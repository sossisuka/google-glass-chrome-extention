(() => {
  // This small script runs before Google's scripts and before our React bundle.
  const html = document.documentElement;
  let settings = {};
  let cachedTheme;
  try {cachedTheme=localStorage.getItem('__googleGlassTheme');if(['dark','light','system'].includes(cachedTheme))settings.theme=cachedTheme;} catch { /* Storage may be blocked on a host page. */ }
  let loaded = false;
  let lastRoute = '';
  let avatarTimer;
  let lastAvatar = '';
  const isGoogle = /(^|\.)google\./.test(location.hostname) && location.hostname !== 'mail.google.com';
  const isYandex=/(^|\.)yandex\.(ru|com|by|kz)$|(^|\.)ya\.ru$/.test(location.hostname);
  const site = isYandex ? 'yandex' : location.hostname === 'mail.google.com' ? 'gmail' : /(^|\.)youtube\.com$/.test(location.hostname) ? 'youtube' : 'google';
  function route() {
    const url = new URL(location.href);
    if(site==='yandex')return url.pathname==='/' && !url.searchParams.has('text') ? 'yandex-home' : '';
    if (site !== 'google') return site;
    if (['/ai','/aimode'].includes(url.pathname) || (url.pathname === '/search' && url.searchParams.get('udm') === '50')) return 'ai';
    if (url.pathname === '/search' && url.searchParams.has('q')) return 'results';
    if (['/','/webhp'].includes(url.pathname) && !url.searchParams.has('q')) return 'home';
    return '';
  }
  function sync() {
    const current = route();
    const allowed = (settings.sites?.[site] ?? settings[`${site}Enabled`]) !== false;
    const enabled = allowed && (current !== 'home' || settings.homepageEnabled !== false) && (current !== 'results' || settings.resultsEnabled !== false) && (current !== 'ai' || settings.aiEnabled !== false);
    const mode = settings.theme === 'light' || (settings.theme === 'system' && matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
    if(html.getAttribute('data-hg-mode') !== mode) html.setAttribute('data-hg-mode', mode);
    const selectedTheme = settings.theme || 'dark';
    if(loaded && selectedTheme !== cachedTheme) {try {localStorage.setItem('__googleGlassTheme',selectedTheme);cachedTheme=selectedTheme;} catch { /* Use extension preferences when host storage is blocked. */ }}
    html.toggleAttribute('data-hg-results', Boolean(enabled && ['results','ai'].includes(current)));
    html.toggleAttribute('data-hg-ai', Boolean(enabled && current === 'ai'));
    html.toggleAttribute('data-hg-youtube', Boolean(enabled && current === 'youtube'));
    html.toggleAttribute('data-hg-gmail', Boolean(enabled && current === 'gmail'));
    if (enabled && ['home','yandex-home'].includes(current) && !document.querySelector('#hero-google-root[data-hg-ready],#hero-yandex-root[data-hg-ready]')) html.setAttribute('data-hg-home-loading','');
    else html.removeAttribute('data-hg-home-loading');
    if (loaded) html.removeAttribute('data-hg-pending');
    const key = `${current}:${enabled}:${mode}`;
    if (key !== lastRoute) {
      lastRoute = key;
      window.dispatchEvent(new CustomEvent('hg-route', {detail:{route:current,enabled,mode}}));
    }
  }
  // Conceal only a supported surface while preferences are read. No time-based delay.
  if (route()) html.setAttribute('data-hg-pending','');
  sync();
  const failSafe = setTimeout(() => {html.removeAttribute('data-hg-pending');html.removeAttribute('data-hg-home-loading');}, 4000);
  const ready = chrome.storage.local.get('settings').then(value => {
    settings = value.settings || {};
    loaded = true;
    sync();
    return settings;
  }).catch(() => {loaded = true;sync();return settings;});
  window.HeroGoogleBoot = {ready, get settings(){return settings;}, route, sync, finishHome(){document.querySelector('#hero-google-root,#hero-yandex-root')?.setAttribute('data-hg-ready','');html.removeAttribute('data-hg-home-loading');clearTimeout(failSafe);}};
  chrome.storage.onChanged.addListener((changes,area) => {
    if(area === 'local' && changes.settings){settings = changes.settings.newValue || {};sync();}
  });
  function discoverAvatar() {
    if (!isGoogle && site !== 'gmail') return;
    const candidates = document.querySelectorAll('#gb img, a[aria-label] img, button[aria-label] img');
    const image = [...candidates].find(img => {
      const label = img.closest('a,button,[role=button]')?.getAttribute('aria-label') || '';
      return /https:\/\/(lh\d+\.)?googleusercontent\.com\//.test(img.currentSrc || img.src) && (img.closest('#gb') || /Google Account|Аккаунт Google|Google аккаунт|Account/i.test(label));
    });
    // Only an avatar actually exposed by the signed-in page is used; no account lookup.
    const url = image?.currentSrc || image?.src;
    if (!url) {
      if(document.querySelector('#gb a[href*="accounts.google.com/ServiceLogin"],#gb a[href*="accounts.google.com/v3/signin"]') && lastAvatar !== 'signed-out') {
        lastAvatar = 'signed-out';
        chrome.storage.local.remove('accountAvatar').catch(()=>{});
        window.dispatchEvent(new CustomEvent('hg-avatar',{detail:{url:''}}));
      }
      return;
    }
    if (url === lastAvatar) return;
    lastAvatar = url;
    chrome.storage.local.set({accountAvatar:{url,observedAt:Date.now()}}).catch(()=>{});
    window.dispatchEvent(new CustomEvent('hg-avatar', {detail:{url}}));
  }
  let routeQueued = false;
  new MutationObserver(() => {
    if (!routeQueued) {routeQueued = true;queueMicrotask(()=>{routeQueued=false;sync();});}
    clearTimeout(avatarTimer);
    avatarTimer = setTimeout(discoverAvatar, 80);
  }).observe(html, {childList:true,subtree:true});
  for(const name of ['popstate','pageshow','yt-navigate-finish']) window.addEventListener(name, sync);
  window.navigation?.addEventListener('currententrychange',sync);
  matchMedia('(prefers-color-scheme: light)').addEventListener('change',sync);
  document.addEventListener('DOMContentLoaded',discoverAvatar,{once:true});
})();
