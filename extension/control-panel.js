(async () => {
  const container = document.querySelector('#popup-controls');
  let {settings={},backgroundImage=''} = await chrome.storage.local.get(['settings','backgroundImage']);
  let cleanup;
  let saving = Promise.resolve();
  function render() {
    cleanup?.();
    const lang = (settings.language === 'auto' || !settings.language ? navigator.language : settings.language).startsWith('ru') ? 'ru' : 'en';
    document.documentElement.lang = lang;
    document.documentElement.dataset.hgMode = settings.theme === 'light' || (settings.theme === 'system' && matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
    cleanup = window.HeroGoogleUI.mountPanel(container,{
      settings,backgroundImage,lang,assetBase:chrome.runtime.getURL(''),
      onChange(key,value) {
        const operation = saving.catch(()=>{}).then(async()=>{
          const latest = (await chrome.storage.local.get('settings')).settings || {};
          settings = {...latest,[key]:value};
          await chrome.storage.local.set({settings});
          if(key === 'theme') document.documentElement.dataset.hgMode = value === 'light' || (value === 'system' && matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
          if(key === 'language') render();
        });
        saving = operation;return operation;
      },
      async onBackground(value) {await chrome.storage.local.set({backgroundImage:value});backgroundImage=value;},
      onOpen:()=>chrome.tabs.create({url:'chrome://newtab/'})
    });
  }
  render();
})();
