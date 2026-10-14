(() => {
  const boot = window.HeroGoogleBoot;
  const assetBase = chrome.runtime.getURL('');
  const slots = new Map();
  const nativeChrome = new Map();
  const nativeControls = new Map();
  const positionedControls = new Map();
  const sizeObserver = new ResizeObserver(schedulePlacement);
  let placementFrame;
  let shell,controller,featureSlot,chipSlot,timer,collapsed=false,lastSignature='',slotRevision=0;
  const text = element => element?.textContent?.replace(/\s+/g,' ').trim() || '';
  const image = element => element?.srcset || element?.closest('picture') ? element.currentSrc || element.src || '' : element?.src || element?.currentSrc || '';
  const first = (element,selectors) => selectors.map(selector=>element.querySelector(selector)).find(Boolean);
  const isDuration = value => /^(?:\d+:)?\d+:\d{2}$/.test(value);
  function safeHref(value,fallback='/') {
    try {const url=new URL(value || fallback,location.origin);return ['https:','http:'].includes(url.protocol) ? url.href : new URL(fallback,location.origin).href;} catch {return new URL(fallback,location.origin).href;}
  }
  function makeSlot(parent,name,before=false) {
    slotRevision++;
    const host=document.createElement('div');
    host.setAttribute('data-hg-youtube-slot',name);
    host.hidden=true;
    host.dataset.mode=document.documentElement.dataset.hgMode || 'dark';
    const shadow=host.attachShadow({mode:'open'});
    shadow.addEventListener('scroll',schedulePlacement,{capture:true,passive:true});
    const slot={host,target:null,ready:false};
    let loaded=0;
    for(const file of ['ui.css','youtube.css']) {
      const link=document.createElement('link');link.rel='stylesheet';link.href=assetBase+file;
      link.addEventListener('load',()=>{if(++loaded===2){slot.ready=true;host.hidden=false;lastSignature='';schedule();}},{once:true});
      shadow.append(link);
    }
    const font=document.createElement('style');
    font.textContent=`@font-face{font-family:Inter;src:url("${assetBase}assets/fonts/Inter.ttf") format("truetype");font-weight:100 900;font-display:swap;}`;
    shadow.append(font);
    const target=document.createElement('div');shadow.append(target);
    if(before)parent.prepend(host);else parent.append(host);
    sizeObserver.observe(host);
    slot.target=target;return slot;
  }
  function removeSlot(slot){if(slot){sizeObserver.unobserve(slot.host);slot.host.remove();}}
  function videoData(element,index) {
    const short=element.matches('ytd-reel-item-renderer,ytm-shorts-lockup-view-model');
    const titleNode=first(element,['#video-title','.ytLockupMetadataViewModelTitle','.yt-lockup-metadata-view-model__title','.shortsLockupViewModelHostMetadataTitle','h3[title]','h3 a[href*="/watch?"]','h4 a[href*="/watch?"]']);
    const anchor=titleNode?.closest('a[href]') || titleNode?.querySelector('a[href]') || first(element,short ? ['a[href*="/shorts/"]'] : ['a#video-title-link','a#video-title','a.ytLockupMetadataViewModelTitle','a.yt-lockup-metadata-view-model__title','h3 a[href*="/watch?"]','a[href*="/watch?"][title]','a[href*="/watch?"][aria-label]']);
    const title=text(titleNode) || anchor?.getAttribute('title') || anchor?.getAttribute('aria-label') || '';
    const thumbnail=element.querySelector('ytd-thumbnail img,yt-image img,.ytThumbnailViewModelImage img,.shortsLockupViewModelHostThumbnail img,img');
    const channel=first(element,['#channel-name a','#text.ytd-channel-name a','.ytContentMetadataViewModelMetadataRow a[href^="/@"]','.yt-content-metadata-view-model__metadata-row a[href^="/@"]','a[href^="/@"]:not(:has(img))','a[href*="/channel/"]:not(:has(img))']);
    if(!anchor || !title || isDuration(title) || !image(thumbnail) || image(thumbnail).startsWith('data:'))return null;
    const metadata=element.querySelectorAll('#metadata-line .inline-metadata-item,#metadata-line>span,.ytContentMetadataViewModelMetadataRow,.yt-content-metadata-view-model__metadata-row');
    const metadataText=[...metadata].map(text).filter(value=>value && value!==text(channel)).join(' · ');
    const menu=first(element,['.ytLockupMetadataViewModelMenuButton button','.yt-lockup-metadata-view-model__menu-button button','ytd-menu-renderer yt-icon-button','ytd-menu-renderer button','button[aria-label*="More"]','button[aria-label*="Action"]','button[aria-label*="действ"]','button[aria-label*="Ещё"]']);
    const menuKey=menu ? `menu:${index}` : undefined;
    if(menu)nativeControls.set(menuKey,menu.closest('button-view-model') || menu);
    const href=safeHref(anchor.getAttribute('href'));
    return {key:`${href}-${index}`,href,title,thumbnail:image(thumbnail),channel:text(channel),channelHref:safeHref(channel?.getAttribute('href'),href),avatar:image(element.querySelector('#avatar img,yt-avatar-shape img,.yt-spec-avatar-shape__image,.ytSpecAvatarShapeImage,#channel-thumbnail img')),duration:text(first(element,['ytd-thumbnail-overlay-time-status-renderer #text','yt-thumbnail-badge-view-model .ytBadgeShapeText','.ytThumbnailOverlayBadgeViewModelHost .ytBadgeShapeText','.yt-badge-shape__text','.badge-shape-wiz__text'])),metadata:metadataText,description:text(element.querySelector('#description-text,.metadata-snippet-text')),short,menuKey};
  }
  function loadingVideo(element,index) {
    // Missing metadata in a watch/Shorts renderer is a loading state, not a title.
    // Leave ads, promotions and unsupported completed renderers in YouTube's care.
    if(element.querySelector('ytd-ad-slot-renderer,ytd-display-ad-renderer,ytd-in-feed-ad-layout-renderer,ytd-promoted-sparkles-web-renderer,ytd-feed-nudge-renderer'))return null;
    const pending=element.hasAttribute('is-skeleton') || element.querySelector('[is-skeleton],.skeleton-thumbnail,.skeleton-bg-color') || ![...element.children].some(child=>!child.hasAttribute('data-hg-youtube-slot')) || element.querySelector('a[href*="/watch?"],a[href*="/shorts/"]');
    if(!pending)return null;
    return {key:`loading-${index}`,loading:true,short:element.matches('ytd-reel-item-renderer,ytm-shorts-lockup-view-model')};
  }
  function navIcon(href) {
    if(href.includes('/shorts'))return 'brand-youtube';
    if(href.includes('subscriptions'))return 'subscriptions';
    if(href.includes('history'))return 'history';
    if(href.includes('WL'))return 'clock';
    if(href.includes('LL'))return 'thumb-up';
    if(href.includes('trending'))return 'flame';
    if(href.includes('music'))return 'music';
    if(href.includes('gaming'))return 'device-gamepad-2';
    if(href.includes('sports'))return 'trophy';
    if(href.includes('library') || href.includes('you'))return 'user';
    return href==='/' ? 'home' : 'player-play';
  }
  function groups(lang) {
    const guides=[...document.querySelectorAll('ytd-guide-renderer')];
    const guide=guides.find(element=>!element.closest('[hidden]') && element.querySelector('ytd-guide-entry-renderer')) || guides.find(element=>element.querySelector('ytd-guide-entry-renderer'));
    const sections=guide ? [...guide.querySelectorAll('ytd-guide-section-renderer,ytd-guide-collapsible-section-entry-renderer')].filter(section=>!section.closest('[hidden]')) : [];
    const seen=new Set();
    const result=sections.map(section=>({title:text(section.querySelector('#guide-section-title')),items:[...section.querySelectorAll('ytd-guide-entry-renderer')].filter(entry=>entry.closest('ytd-guide-section-renderer,ytd-guide-collapsible-section-entry-renderer')===section && !entry.closest('[hidden]')).map(entry=>{
      const link=entry.querySelector('a[href]');const href=link?.getAttribute('href');
      if(!href)return null;
      const url=new URL(safeHref(href));if(seen.has(url.href))return null;seen.add(url.href);
      return {href:url.href,title:text(entry.querySelector('yt-formatted-string')) || text(link),icon:navIcon(url.origin===location.origin ? url.pathname+url.search : href),avatar:image(entry.querySelector('img')),active:entry.hasAttribute('active') || url.origin===location.origin && url.pathname+url.search===location.pathname+location.search};
    }).filter(Boolean)})).filter(group=>group.items.length);
    const primary=[['/',lang==='ru' ? 'Главная' : 'Home'],['/shorts/','Shorts'],['/feed/subscriptions',lang==='ru' ? 'Подписки' : 'Subscriptions']].map(([href,title])=>result.flatMap(group=>group.items).find(item=>item.href===safeHref(href)) || {href:safeHref(href),title,icon:navIcon(href),active:location.pathname===href});
    const primaryHrefs=new Set(primary.map(item=>item.href));
    const remaining=result.map(group=>({...group,items:group.items.filter(item=>!primaryHrefs.has(item.href))})).filter(group=>group.items.length);
    return [{title:'',items:primary},...remaining];
  }
  function registerAction(key,selectors) {
    const element=[...document.querySelectorAll(selectors)].find(element=>!element.closest('[hidden]'));
    if(!element)return false;
    const control=element.closest('ytd-topbar-menu-button-renderer,yt-icon-button') || element;
    nativeControls.set(`header:${key}`,control);return true;
  }
  function restoreControl(element) {
    const previous=positionedControls.get(element);if(!previous)return;
    element.removeAttribute('data-hg-native-overlay');
    for(const [name,value] of previous.variables){if(value)element.style.setProperty(name,value);else element.style.removeProperty(name);}
    previous.target?.removeAttribute('data-hg-native-focus');
    previous.target?.removeAttribute('data-hg-native-hover');
    positionedControls.delete(element);
  }
  function placeControls() {
    placementFrame=undefined;
    if(!shell?.ready)return;
    const targets=new Map();
    for(const host of document.querySelectorAll('[data-hg-youtube-slot]:not([hidden])')){
      for(const target of host.shadowRoot.querySelectorAll('[data-hg-native-control]'))targets.set(target.dataset.hgNativeControl,target);
    }
    const active=new Set();
    for(const [key,element] of nativeControls){
      const target=targets.get(key);if(!target || !element.isConnected)continue;
      const rect=target.getBoundingClientRect();
      if(!rect.width || !rect.height || rect.bottom<=0 || rect.top>=innerHeight)continue;
      let left=Math.max(0,rect.left),top=Math.max(0,rect.top),right=Math.min(document.documentElement.clientWidth,rect.right),bottom=Math.min(innerHeight,rect.bottom);
      for(let parent=target.parentElement;parent;parent=parent.parentElement){
        const style=getComputedStyle(parent),bounds=parent.getBoundingClientRect();
        if(/auto|scroll|hidden|clip/.test(style.overflowX)){left=Math.max(left,bounds.left);right=Math.min(right,bounds.right);}
        if(/auto|scroll|hidden|clip/.test(style.overflowY)){top=Math.max(top,bounds.top);bottom=Math.min(bottom,bounds.bottom);}
      }
      if(right<=left || bottom<=top)continue;
      active.add(element);
      if(!positionedControls.has(element))positionedControls.set(element,{variables:['--hg-hit-left','--hg-hit-top','--hg-hit-width','--hg-hit-height'].map(name=>[name,element.style.getPropertyValue(name)]),target});
      positionedControls.get(element).target=target;
      element.setAttribute('data-hg-native-overlay',key);
      for(const [name,value] of [['left',left],['top',top],['width',right-left],['height',bottom-top]])element.style.setProperty(`--hg-hit-${name}`,`${value}px`);
    }
    for(const element of positionedControls.keys())if(!active.has(element))restoreControl(element);
  }
  function schedulePlacement(){if(!placementFrame)placementFrame=requestAnimationFrame(placeControls);}
  function nativeFocus(event,focused){
    for(const element of event.composedPath()){
      const previous=positionedControls.get(element);
      if(previous){previous.target.toggleAttribute('data-hg-native-focus',focused);break;}
    }
  }
  function nativeHover(event,hovered){
    for(const element of event.composedPath()){
      const previous=positionedControls.get(element);
      if(previous){if(!(event.relatedTarget instanceof Node) || !element.contains(event.relatedTarget))previous.target.toggleAttribute('data-hg-native-hover',hovered);break;}
    }
  }
  function cleanup() {
    cancelAnimationFrame(placementFrame);placementFrame=undefined;
    for(const element of positionedControls.keys())restoreControl(element);
    nativeControls.clear();
    controller?.destroy();controller=null;removeSlot(shell);shell=null;
    removeSlot(featureSlot);featureSlot=null;removeSlot(chipSlot);chipSlot=null;
    for(const [element,slot] of slots){element.removeAttribute('data-hg-video-card');element.removeAttribute('data-hg-video-loading');removeSlot(slot);}
    slots.clear();
    for(const [element,previous] of nativeChrome){element.inert=previous.inert;if(previous.aria===null)element.removeAttribute('aria-hidden');else element.setAttribute('aria-hidden',previous.aria);}
    nativeChrome.clear();
    document.querySelectorAll('[data-hg-feature-video]').forEach(element=>element.removeAttribute('data-hg-feature-video'));
    for(const attribute of ['data-hg-youtube-shell','data-hg-youtube-collapsed','data-hg-youtube-chips'])document.documentElement.removeAttribute(attribute);
    lastSignature='';
  }
  function sync() {
    if(!document.documentElement.hasAttribute('data-hg-youtube')){cleanup();return;}
    const app=document.querySelector('ytd-app');const masthead=document.querySelector('ytd-masthead');
    if(!app || !masthead || !window.HeroYoutubeUI)return;
    if(!shell?.host.isConnected){cleanup();shell=makeSlot(app,'shell');controller=window.HeroYoutubeUI.mount(shell.target,{assetBase});}
    nativeControls.clear();
    const mode=document.documentElement.dataset.hgMode || 'dark';
    const lang=(document.documentElement.lang || navigator.language).startsWith('ru') ? 'ru' : 'en';
    const home=location.pathname==='/' || location.pathname==='/feed/subscriptions';
    const grid=home && document.querySelector('ytd-browse:not([hidden]) ytd-rich-grid-renderer');
    const all=grid ? [...grid.querySelectorAll('ytd-rich-item-renderer')].filter(element=>!element.closest('ytd-rich-shelf-renderer')) : [];
    const data=all.map((element,index)=>({element,video:videoData(element,index)})).filter(item=>item.video && !item.video.short);
    // Only make a feature shelf when there are enough actual videos. Empty and signed-out feeds remain native.
    const featured=data.length>=8 ? data.slice(0,4) : [];
    const featuredElements=new Set(featured.map(item=>item.element));
    document.querySelectorAll('[data-hg-feature-video]').forEach(element=>{if(!featuredElements.has(element))element.removeAttribute('data-hg-feature-video');});
    if(featured.length){
      if(!featureSlot?.host.isConnected || !grid.contains(featureSlot.host)){removeSlot(featureSlot);featureSlot=makeSlot(grid,'feature',true);}
      const contents=grid.querySelector(':scope > #contents');
      if(contents && featureSlot.host.nextElementSibling!==contents)grid.insertBefore(featureSlot.host,contents);
      if(featureSlot.ready)featured.forEach(({element})=>element.setAttribute('data-hg-feature-video',''));
    }else{removeSlot(featureSlot);featureSlot=null;}
    const cardElements=grid ? [...all,...grid.querySelectorAll('ytd-reel-item-renderer,ytm-shorts-lockup-view-model')] : [];
    const liveElements=new Set(cardElements);
    for(const [element,slot] of slots){if(!element.isConnected || !liveElements.has(element) || featuredElements.has(element)){element.removeAttribute('data-hg-video-card');element.removeAttribute('data-hg-video-loading');removeSlot(slot);slots.delete(element);}}
    const cards=[];
    for(const [index,element] of cardElements.entries()){
      if(featuredElements.has(element))continue;
      const video=videoData(element,index) || loadingVideo(element,index);
      if(!video){element.removeAttribute('data-hg-video-card');element.removeAttribute('data-hg-video-loading');removeSlot(slots.get(element));slots.delete(element);continue;}
      let slot=slots.get(element);if(!slot){slot=makeSlot(element,'card');slots.set(element,slot);}
      if(slot.ready)element.setAttribute('data-hg-video-card','');
      element.toggleAttribute('data-hg-video-loading',Boolean(video.loading));
      slot.host.dataset.mode=mode;cards.push({target:slot.target,video});
    }
    const chipContainer=home && document.querySelector('ytd-browse:not([hidden]) ytd-feed-filter-chip-bar-renderer');
    const chips=chipContainer ? [...chipContainer.querySelectorAll('yt-chip-cloud-chip-renderer')].filter(chip=>!chip.closest('[hidden]')).map((chip,index)=>{
      const nativeKey=`chip:${index}`;nativeControls.set(nativeKey,chip);
      return {key:`${index}-${text(chip)}`,title:text(chip),selected:chip.hasAttribute('selected') || chip.getAttribute('aria-selected')==='true',nativeKey};
    }).filter(chip=>chip.title) : [];
    if(chips.length){if(!chipSlot?.host.isConnected || !chipContainer.contains(chipSlot.host)){removeSlot(chipSlot);chipSlot=makeSlot(chipContainer,'chips');}chipSlot.host.dataset.mode=mode;if(chipSlot.ready)document.documentElement.setAttribute('data-hg-youtube-chips','');}
    else{removeSlot(chipSlot);chipSlot=null;document.documentElement.removeAttribute('data-hg-youtube-chips');}
    shell.host.dataset.mode=mode;if(featureSlot)featureSlot.host.dataset.mode=mode;
    const avatar=image(masthead.querySelector('#avatar-btn img,button#avatar-btn img,yt-avatar-shape img'));
    const searchQuery=new URL(location.href).searchParams.get('search_query') || '';
    const model={mode,lang,collapsed,avatar,searchQuery,groups:groups(lang),featured:featured.map(item=>item.video),cards,chips,chipTarget:chipSlot?.target,featureTarget:featureSlot?.target,
      onToggle:()=>{collapsed=!collapsed;lastSignature='';sync();},actions:{
        voice:registerAction('voice','ytd-masthead #voice-search-button button'),create:registerAction('create','ytd-masthead button[aria-label="Create"],ytd-masthead button[aria-label="Создать"]'),notifications:registerAction('notifications','ytd-masthead button[aria-label*="Notifications"],ytd-masthead button[aria-label*="Уведомления"]'),
        account:registerAction('account','ytd-masthead #avatar-btn,ytd-masthead a[href*="accounts.google.com"]'),settings:registerAction('settings','ytd-masthead button[aria-label="Settings"],ytd-masthead button[aria-label="Настройки"]')
      }};
    // Native page mutation bursts must not remount cards or reset the search input.
    const signature=JSON.stringify({slotRevision,mode,lang,collapsed,avatar,searchQuery,groups:model.groups,videos:[...model.featured,...cards.map(card=>card.video)],chips,actions:model.actions});
    if(signature!==lastSignature){lastSignature=signature;controller.update(model);}
    if(shell.ready){
      document.documentElement.setAttribute('data-hg-youtube-shell','');
      // Exclude the concealed native guide from keyboard focus and assistive technology.
      for(const element of document.querySelectorAll('ytd-guide-renderer,ytd-mini-guide-renderer')){
        if(!nativeChrome.has(element))nativeChrome.set(element,{inert:element.inert,aria:element.getAttribute('aria-hidden')});
        element.inert=true;element.setAttribute('aria-hidden','true');
      }
      for(const element of nativeChrome.keys())if(!element.isConnected)nativeChrome.delete(element);
    }
    document.documentElement.toggleAttribute('data-hg-youtube-collapsed',collapsed);
    schedulePlacement();
  }
  function schedule(){if(!timer)timer=setTimeout(()=>{timer=undefined;sync();},100);}
  // React's shadow DOM changes are outside this observer; slot insertion is ignored.
  new MutationObserver(records=>{if(records.some(record=>record.type!=='childList' || [...record.addedNodes,...record.removedNodes].some(node=>node.nodeType!==1 || !node.hasAttribute('data-hg-youtube-slot'))))schedule();}).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['src','href','title','aria-label','selected','aria-selected','hidden','is-skeleton']});
  for(const name of ['hg-route','yt-navigate-finish','yt-page-data-updated','popstate'])window.addEventListener(name,()=>{lastSignature='';schedule();});
  document.addEventListener('scroll',schedulePlacement,{capture:true,passive:true});
  window.addEventListener('resize',schedulePlacement,{passive:true});
  document.addEventListener('focusin',event=>nativeFocus(event,true),true);
  document.addEventListener('focusout',event=>nativeFocus(event,false),true);
  document.addEventListener('mouseover',event=>nativeHover(event,true),true);
  document.addEventListener('mouseout',event=>nativeHover(event,false),true);
  document.fonts.addEventListener('loadingdone',schedulePlacement);
  boot?.ready.then(schedule);schedule();
})();
