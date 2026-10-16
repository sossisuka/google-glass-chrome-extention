(() => {
  const html=document.documentElement;
  let host,release,observer,timer,mounting=false,overflow,nativeOnly=false,generation=0;
  const restored=new Map(),subscribers=new Set();
  const languageRun={source:0,target:0};
  let signature='';
  const field=()=>document.querySelector('textarea.er8xn,textarea[jsname=BJE2fc],textarea[data-translation-source]');
  const enabled=()=>(window.HeroGoogleBoot?.settings.sites?.translate ?? window.HeroGoogleBoot?.settings.translateEnabled)!==false;
  const allowed=()=>!nativeOnly && enabled() && window.HeroGoogleBoot?.route()==='translate-home';
  function selected(side){return [...document.querySelectorAll('[role=tablist]')].filter(list=>list.querySelector('[data-language-code]'))[side==='source' ? 0 : 1]?.querySelector('[aria-selected=true][data-language-code]')?.dataset.languageCode;}
  function read(){
    const params=new URL(location.href).searchParams;
    return {text:field()?.value || '',translation:[...document.querySelectorAll('.ryNqvb,[data-translation-result]')].map(element=>element.textContent).join(' '),source:selected('source') || params.get('sl') || 'auto',target:selected('target') || params.get('tl') || 'ru'};
  }
  function notify(){const data=read();const next=JSON.stringify(data);if(next===signature)return;signature=next;for(const listener of subscribers)listener(data);}
  function hide(element){if(element===host || ['SCRIPT','STYLE','LINK'].includes(element.tagName) || restored.has(element))return;restored.set(element,{inert:element.inert,aria:element.getAttribute('aria-hidden')});element.inert=true;element.setAttribute('aria-hidden','true');}
  function unmount(){generation++;release?.();release=undefined;host?.remove();host=undefined;mounting=false;for(const [element,old] of restored){element.inert=old.inert;if(old.aria===null)element.removeAttribute('aria-hidden');else element.setAttribute('aria-hidden',old.aria);}restored.clear();if(overflow!==undefined && document.body)document.body.style.overflow=overflow;window.HeroGoogleBoot?.finishHome();}
  function reveal(action){nativeOnly=true;html.setAttribute('data-hg-translate-native','');unmount();if(action){const selector=action==='rate' ? '[jsname=IOOiDc]' : '[jsname=ryDGAb]';const expression=action==='rate' ? /Оценить.*перевод|Хороший перевод|Плохой перевод|Good translation|Rate (?:this )?translation/i : /Оставить отзыв|Отправить отзыв|Send feedback/i;const button=document.querySelector(selector) || [...document.querySelectorAll('button,[role=button]')].find(button=>expression.test(button.getAttribute('aria-label') || button.textContent) && button.getClientRects().length);button?.click();}}
  const bridge={
    read,
    subscribe(listener){subscribers.add(listener);return()=>subscribers.delete(listener);},
    input(text){const input=field();if(!input){reveal();return;}Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,text);input.dispatchEvent(new InputEvent('input',{bubbles:true,composed:true,inputType:'insertText',data:text}));if(!text)signature='';},
    language(side,code){
      const run=++languageRun[side];
      const lists=[...document.querySelectorAll('[role=tablist]')].filter(list=>list.querySelector('[data-language-code]'));
      const list=lists[side==='source' ? 0 : 1];
      const tab=[...list?.querySelectorAll('[data-language-code]') || []].find(button=>button.dataset.languageCode===code);
      if(tab){tab.click();return;}
      const trigger=document.querySelector(side==='source' ? '[jsname=RCbdJd]' : '[jsname=zumM6d]');
      trigger?.click();
      setTimeout(()=>{
        if(run!==languageRun[side] || !allowed())return;
        const menus=[...document.querySelectorAll('[role=listbox]')].filter(menu=>menu.querySelector('[role=option][data-language-code]'));
        const menu=menus[side==='source' ? 0 : 1];
        [...menu?.querySelectorAll('[data-language-code]') || []].find(option=>option.dataset.languageCode===code)?.click();
        setTimeout(()=>{if(run!==languageRun[side] || !allowed() || selected(side)===code)return;const data=read();const url=new URL(location.href);url.searchParams.set(side==='source' ? 'sl' : 'tl',code);if(data.text)url.searchParams.set('text',data.text);location.assign(url.href);},250);
      },60);
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
    try{await Promise.all(styles);if(run!==generation || !allowed())return;const cleanup=await window.TranslateGlass.mount(container,{assetBase:chrome.runtime.getURL(''),bridge});if(run!==generation || !allowed()){cleanup();return;}release=cleanup;mounting=false;window.HeroGoogleBoot.finishHome();}
    catch(error){console.warn('Google Glass uses the original Translate interface:',error.message);reveal();}
  }
  function sync(){if(allowed())mount();else if(host)unmount();notify();}
  observer=new MutationObserver(records=>{if(host)for(const record of records)for(const node of record.addedNodes)if(node instanceof HTMLElement && node.parentElement===document.body)hide(node);if(!timer)timer=setTimeout(()=>{timer=undefined;sync();},60);});
  observer.observe(html,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-selected','aria-current','data-language-code']});
  window.addEventListener('hg-route',sync);
  let previousEnabled=true;
  chrome.storage.onChanged.addListener((changes,area)=>{if(area!=='local' || !changes.settings)return;const next=(changes.settings.newValue?.sites?.translate ?? changes.settings.newValue?.translateEnabled)!==false;if(next!==previousEnabled){nativeOnly=false;html.removeAttribute('data-hg-translate-native');}previousEnabled=next;sync();});
  setTimeout(()=>{if(allowed() && !field()){nativeOnly=true;html.setAttribute('data-hg-translate-native','');window.HeroGoogleBoot.finishHome();}},8000);
  sync();
})();
