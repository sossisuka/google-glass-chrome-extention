(() => {
  let host;
  let mounting=false;
  let cleanup;
  let observer;
  let overflow;
  let generation=0;
  const restore=new Map();
  const allowed=()=>window.HeroGoogleBoot?.route()==='yandex-home' && window.HeroGoogleBoot.settings.sites?.yandex!==false && window.HeroGoogleBoot.settings.yandexEnabled!==false;
  function hide(element){if(element===host || ['SCRIPT','STYLE','LINK'].includes(element.tagName) || restore.has(element))return;restore.set(element,{inert:element.inert,aria:element.getAttribute('aria-hidden')});element.inert=true;element.setAttribute('aria-hidden','true');}
  function unmount(){
    generation++;observer?.disconnect();cleanup?.();cleanup=undefined;host?.remove();host=undefined;mounting=false;
    for(const [element,previous] of restore){element.inert=previous.inert;if(previous.aria===null)element.removeAttribute('aria-hidden');else element.setAttribute('aria-hidden',previous.aria);}
    restore.clear();if(overflow!==undefined && document.body)document.body.style.overflow=overflow;
    window.HeroGoogleBoot?.finishHome();
  }
  async function mount(){
    await window.HeroGoogleBoot?.ready;
    if(!allowed() || !document.body || host || mounting)return;
    mounting=true;const run=++generation;
    host=document.createElement('div');host.id='hero-yandex-root';host.style.cssText='position:fixed;inset:0;z-index:2147483600;overflow:auto;';
    const shadow=host.attachShadow({mode:'open'});
    const styles=['ui.css','yandex.css'].map(file=>new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='stylesheet';link.href=chrome.runtime.getURL(file);link.onload=resolve;link.onerror=()=>reject(Error(`Could not load ${file}`));shadow.append(link);}));
    const container=document.createElement('div');shadow.append(container);
    // Isolate controls from native body-level event handlers and disabled states.
    overflow=document.body.style.overflow;document.body.style.overflow='hidden';document.documentElement.append(host);[...document.body.children].forEach(hide);
    observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node instanceof HTMLElement)hide(node);});observer.observe(document.body,{childList:true});
    try{
      await Promise.all(styles);if(run!==generation || !allowed())return;
      const release=await window.YandexGlass.mount(container,{assetBase:chrome.runtime.getURL(''),onYandex:true});
      if(run!==generation || !allowed()){release();return;}cleanup=release;mounting=false;window.HeroGoogleBoot.finishHome();
    }catch(error){console.error(error);unmount();}
  }
  const sync=()=>{if(allowed())mount();else unmount();};
  window.addEventListener('hg-route',sync);
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local' && changes.settings)sync();});
  if(document.body)mount();else{const bodyObserver=new MutationObserver(()=>{if(document.body){bodyObserver.disconnect();mount();}});bodyObserver.observe(document.documentElement,{childList:true,subtree:true});}
})();
