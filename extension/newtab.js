(() => {
  const app=document.querySelector('#app');
  const assetBase=new URL('./',location.href).href;
  const installed=Boolean(globalThis.chrome?.runtime?.id && chrome.storage?.local);
  const loaded=new Map();
  let provider;
  let cleanup;
  let generation=0;
  function load(file,type='script'){
    if(loaded.has(file))return loaded.get(file);
    const promise=new Promise((resolve,reject)=>{
      const element=document.createElement(type==='script' ? 'script' : 'link');
      if(type==='script')element.src=assetBase+file;
      else{element.rel='stylesheet';element.href=assetBase+file;}
      element.onload=resolve;element.onerror=()=>reject(Error(`Could not load ${file}`));document.head.append(element);
    });
    loaded.set(file,promise);return promise;
  }
  async function render(settings={}){
    const next=['yandex','translate'].includes(settings.homepageProvider) ? settings.homepageProvider : 'google';
    document.documentElement.dataset.hgProvider=next;
    if(next===provider)return;
    const run=++generation;
    provider=next;cleanup?.();cleanup=undefined;
    const container=document.createElement('div');app.replaceChildren(container);
    try{
      if(next==='translate'){
        await Promise.all([load('translate-ui.js'),load('translate.css','style')]);
        if(run!==generation)return;
        const release=await window.TranslateGlass.mount(container,{assetBase});
        if(run!==generation){release();return;}cleanup=release;
      }else if(next==='yandex'){
        await Promise.all([load('yandex-ui.js'),load('yandex.css','style')]);
        if(run!==generation)return;
        const release=await window.YandexGlass.mount(container,{assetBase});
        if(run!==generation){release();return;}cleanup=release;
      }else{
        await load('ui.js');await load('app.js');
        if(run!==generation)return;
        const release=await window.HeroGoogle.mount(container,{assetBase,onGoogle:false});
        if(run!==generation){release();return;}cleanup=release;
      }
    }catch(error){console.error(error);provider=undefined;app.textContent='Could not load the homepage. Refresh this tab.';}
  }
  if(installed){chrome.storage.local.get('settings').then(({settings})=>render(settings));chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local' && changes.settings)render(changes.settings.newValue);});}
  else{let settings={};try{settings=JSON.parse(localStorage.getItem('hero-google') || '{}').settings || {};}catch{}render(settings);}
  window.addEventListener('hg-settings-change',event=>{if(event.detail.settings)render(event.detail.settings);});
})();
