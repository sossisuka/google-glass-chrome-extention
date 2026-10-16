(() => {
  const html=document.documentElement;
  let host,release,observer,timer,stateTimer,mounting=false,overflow,nativeOnly=false,generation=0;
  const restored=new Map(),subscribers=new Set();
  const languageRun={source:0,target:0};
  const pendingLanguages={};
  let pendingText;
  let signature='';
  const field=()=>document.querySelector('textarea.er8xn,textarea[jsname=BJE2fc],textarea[data-translation-source]');
  const enabled=()=>(window.HeroGoogleBoot?.settings.sites?.translate ?? window.HeroGoogleBoot?.settings.translateEnabled)!==false;
  const allowed=()=>!nativeOnly && enabled() && window.HeroGoogleBoot?.route()==='translate-home';
  function selected(side){return [...document.querySelectorAll('[role=tablist]')].filter(list=>list.querySelector('[data-language-code]'))[side==='source' ? 0 : 1]?.querySelector('[aria-selected=true][data-language-code]')?.dataset.languageCode;}
  function read(){
    const params=new URL(location.href).searchParams;
    const text=pendingText?.value ?? field()?.value ?? '';
    return {text,translation:text.trim() && !pendingText && !Object.keys(pendingLanguages).length ? [...document.querySelectorAll('.ryNqvb,[data-translation-result]')].map(element=>element.textContent).join(' ') : '',source:pendingLanguages.source?.value || params.get('sl') || selected('source') || 'auto',target:pendingLanguages.target?.value || params.get('tl') || selected('target') || 'ru'};
  }
  function notify(){const data=read();const next=JSON.stringify(data);if(next===signature)return;signature=next;for(const listener of subscribers)listener(data);}
  function sendInput(command){const input=field();if(!input)return;command.sent=Date.now();Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,command.value);input.dispatchEvent(new InputEvent('input',{bubbles:true,composed:true,inputType:'insertText',data:command.value}));}
  function sendLanguage(side,command){
    const code=command.value,run=++languageRun[side];command.sent=Date.now();
    const lists=[...document.querySelectorAll('[role=tablist]')].filter(list=>list.querySelector('[data-language-code]'));
    const list=lists[side==='source' ? 0 : 1];
    const tab=[...list?.querySelectorAll('[data-language-code]') || []].find(button=>button.dataset.languageCode===code);
    if(tab){tab.click();return;}
    document.querySelector(side==='source' ? '[jsname=RCbdJd]' : '[jsname=zumM6d]')?.click();
    setTimeout(()=>{
      if(run!==languageRun[side] || pendingLanguages[side]!==command || !allowed())return;
      const menus=[...document.querySelectorAll('[role=listbox]')].filter(menu=>menu.querySelector('[role=option][data-language-code]'));
      const menu=menus[side==='source' ? 0 : 1];
      const option=[...menu?.querySelectorAll('[data-language-code]') || []].find(option=>option.dataset.languageCode===code);
      if(option){option.click();return;}
      if(Date.now()-command.started<1500)return;
      const url=new URL(location.href),data=read();url.searchParams.set(side==='source' ? 'sl' : 'tl',code);if(data.text)url.searchParams.set('text',data.text);location.assign(url.href);
    },60);
  }
  function reconcile(){
    // Google can render a textarea before its deferred controllers are ready.
    // Keep the latest command until its value appears in native URL state.
    const params=new URL(location.href).searchParams,now=Date.now();
    if(pendingText){
      if(field()?.value===pendingText.value && (params.get('text') || '')===pendingText.value)pendingText=undefined;
      else if(now-pendingText.started<10000 && now-pendingText.sent>=500)sendInput(pendingText);
    }
    for(const side of ['source','target']){const command=pendingLanguages[side];if(!command)continue;const key=side==='source' ? 'sl' : 'tl';if(params.get(key)===command.value)delete pendingLanguages[side];else if(now-command.started<10000 && now-command.sent>=500)sendLanguage(side,command);}
    notify();
  }
  function cancelPending(){pendingText=undefined;for(const side of ['source','target']){delete pendingLanguages[side];languageRun[side]++;}}
  function hide(element){if(element===host || ['SCRIPT','STYLE','LINK'].includes(element.tagName) || restored.has(element))return;restored.set(element,{inert:element.inert,aria:element.getAttribute('aria-hidden')});element.inert=true;element.setAttribute('aria-hidden','true');}
  function unmount(){generation++;clearInterval(stateTimer);stateTimer=undefined;cancelPending();release?.();release=undefined;host?.remove();host=undefined;mounting=false;for(const [element,old] of restored){element.inert=old.inert;if(old.aria===null)element.removeAttribute('aria-hidden');else element.setAttribute('aria-hidden',old.aria);}restored.clear();if(overflow!==undefined && document.body)document.body.style.overflow=overflow;window.HeroGoogleBoot?.finishHome();}
  function reveal(action){nativeOnly=true;html.setAttribute('data-hg-translate-native','');unmount();if(action){const selector=action==='rate' ? '[jsname=IOOiDc]' : '[jsname=ryDGAb]';const expression=action==='rate' ? /Оценить.*перевод|Хороший перевод|Плохой перевод|Good translation|Rate (?:this )?translation/i : /Оставить отзыв|Отправить отзыв|Send feedback/i;const button=document.querySelector(selector) || [...document.querySelectorAll('button,[role=button]')].find(button=>expression.test(button.getAttribute('aria-label') || button.textContent) && button.getClientRects().length);button?.click();}}
  const bridge={
    read,
    subscribe(listener){subscribers.add(listener);listener(read());return()=>subscribers.delete(listener);},
    input(text){pendingText={value:text,started:Date.now(),sent:0};sendInput(pendingText);signature='';notify();},
    language(side,code){
      const command={value:code,started:Date.now(),sent:0};pendingLanguages[side]=command;sendLanguage(side,command);notify();
    },
    swap(){document.querySelector('[jsname=dnDxad],[data-translation-swap]')?.click();},
    mode(op,url){const names={translate:'bl4nBb',docs:'qDeCrf',images:'SHEbFd',websites:'n87sxd'};const button=document.querySelector(`[jsname=${names[op]}]`);if(button){button.click();window.HeroGoogleBoot?.sync();sync();}else location.assign(url);},
    reveal
  };
  async function mount(){
    await window.HeroGoogleBoot?.ready;
    if(!allowed() || !document.body || !field() || host || mounting)return;
    mounting=true;const run=++generation;
    host=document.createElement('div');host.id='hero-translate-root';host.style.cssText='position:fixed;inset:0;z-index:2147483600;overflow:auto;';
    const shadow=host.attachShadow({mode:'open'});
    const styles=['ui.css','translate.css'].map(file=>new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='stylesheet';link.href=chrome.runtime.getURL(file);link.onload=resolve;link.onerror=()=>reject(Error(`Could not load ${file}`));shadow.append(link);}));
    // Keep our controls outside Google's body-level event controllers and inert states.
    const container=document.createElement('div');shadow.append(container);overflow=document.body.style.overflow;document.body.style.overflow='hidden';document.documentElement.append(host);[...document.body.children].forEach(hide);
    try{await Promise.all(styles);if(run!==generation || !allowed())return;const cleanup=await window.TranslateGlass.mount(container,{assetBase:chrome.runtime.getURL(''),bridge});if(run!==generation || !allowed()){cleanup();return;}release=cleanup;mounting=false;stateTimer=setInterval(reconcile,250);window.HeroGoogleBoot.finishHome();}
    catch(error){console.warn('Google Glass uses the original Translate interface:',error.message);reveal();}
  }
  function sync(){if(allowed())mount();else if(host)unmount();notify();}
  observer=new MutationObserver(records=>{if(host)for(const record of records)for(const node of record.addedNodes)if(node instanceof HTMLElement && node.parentElement===document.body)hide(node);if(!timer)timer=setTimeout(()=>{timer=undefined;sync();},60);});
  observer.observe(html,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-selected','aria-current','data-language-code']});
  window.addEventListener('hg-route',sync);
  // Query-string and textarea.value changes need not produce DOM mutations.
  for(const name of ['popstate','hashchange'])window.addEventListener(name,()=>{cancelPending();sync();});
  window.addEventListener('pageshow',sync);
  window.navigation?.addEventListener('currententrychange',sync);
  document.addEventListener('input',event=>{if(event.target===field())notify();},true);
  let previousEnabled=true;
  chrome.storage.onChanged.addListener((changes,area)=>{if(area!=='local' || !changes.settings)return;const next=(changes.settings.newValue?.sites?.translate ?? changes.settings.newValue?.translateEnabled)!==false;if(next!==previousEnabled){nativeOnly=false;html.removeAttribute('data-hg-translate-native');}previousEnabled=next;sync();});
  setTimeout(()=>{if(allowed() && !field()){nativeOnly=true;html.setAttribute('data-hg-translate-native','');window.HeroGoogleBoot.finishHome();}},8000);
  sync();
})();
