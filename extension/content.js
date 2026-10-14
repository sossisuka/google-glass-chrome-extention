(() => {
  let host;
  let mounting = false;
  const restore = new Map();
  let observer;
  let previousOverflow;

  function hideNative(element) {
    if (element === host || ['SCRIPT', 'STYLE', 'LINK'].includes(element.tagName) || restore.has(element)) return;
    restore.set(element, { element, inert: element.inert, aria: element.getAttribute('aria-hidden') });
    element.inert = true;
    element.setAttribute('aria-hidden', 'true');
  }

  async function mount() {
    await window.HeroGoogleBoot?.ready;
    if (!allowed() || host || mounting || !document.body) return;
    mounting = true;
    host = document.createElement('div');
    host.id = 'hero-google-root';
    host.style.cssText = 'position:fixed;inset:0;z-index:2147483600;overflow:auto;';
    const shadow = host.attachShadow({ mode: 'open' });
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = chrome.runtime.getURL('page.css');
    const pageLoaded = new Promise(resolve=>{stylesheet.onload=resolve;stylesheet.onerror=resolve;});
    shadow.append(stylesheet);
    const controlsStyles = document.createElement('link');
    controlsStyles.rel = 'stylesheet';
    controlsStyles.href = chrome.runtime.getURL('ui.css');
    const controlsLoaded = new Promise(resolve=>{controlsStyles.onload=resolve;controlsStyles.onerror=resolve;});
    shadow.append(controlsStyles);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.append(host);
    [...document.body.children].forEach(hideNative);
    observer = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node instanceof HTMLElement) hideNative(node);
      }
    });
    observer.observe(document.body, { childList: true });
    await Promise.all([pageLoaded,controlsLoaded]);
    if(host && allowed()) await window.HeroGoogle.mount(shadow, { assetBase: chrome.runtime.getURL(''), onGoogle: true });
    mounting = false;
    window.HeroGoogleBoot?.finishHome();
    if(!allowed()) unmount();
  }

  function unmount() {
    observer?.disconnect();
    host?.dispatchEvent(new Event('hg-unmount'));
    host?.remove();
    host = undefined;
    for (const item of restore.values()) {
      item.element.inert = item.inert;
      if (item.aria === null) item.element.removeAttribute('aria-hidden');
      else item.element.setAttribute('aria-hidden', item.aria);
    }
    restore.clear();
    if (previousOverflow !== undefined) document.body.style.overflow = previousOverflow;
    window.HeroGoogleBoot?.finishHome();
  }

  function allowed() {
    const settings = window.HeroGoogleBoot?.settings || {};
    return window.HeroGoogleBoot?.route() === 'home' && settings.sites?.google !== false && settings.googleEnabled !== false && settings.homepageEnabled !== false;
  }
  function sync() { if(allowed()) mount(); else unmount(); }
  window.addEventListener('hg-route',sync);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes.settings) return;
    sync();
  });
  if (document.body) mount();
  else {
    const bodyObserver = new MutationObserver(()=>{if(document.body){bodyObserver.disconnect();mount();}});
    bodyObserver.observe(document.documentElement,{childList:true,subtree:true});
  }
})();
