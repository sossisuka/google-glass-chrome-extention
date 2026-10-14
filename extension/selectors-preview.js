(async()=>{
  const params = new URL(location.href).searchParams;
  const assetBase = new URL('./',location.href).href;
  const installed = typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id && chrome.storage?.local);
  let settings = installed ? (await chrome.storage.local.get('settings')).settings || {} : {};
  if(!installed){try{settings=JSON.parse(localStorage.getItem('hero-google') || '{}').settings || {};}catch{}}
  const lang = params.get('lang') === 'en' ? 'en' : 'ru';
  document.documentElement.lang = lang;
  window.HeroGoogleUI.mountSelectors(document.querySelector('#selector-app'),{assetBase,settings:{...settings,country:settings.country || 'BY'},lang,mode:'country',initialOpen:params.get('open') !== '0',onChange:async(name,value)=>{
    if(installed){settings=(await chrome.storage.local.get('settings')).settings || {};await chrome.storage.local.set({settings:{...settings,[name]:value}});}
    else {try{settings=JSON.parse(localStorage.getItem('hero-google') || '{}');localStorage.setItem('hero-google',JSON.stringify({...settings,settings:{...settings.settings,[name]:value}}));}catch{}}
  }});
})();
