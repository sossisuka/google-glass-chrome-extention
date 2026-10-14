(() => {
  window.HeroGoogle.mount(document.querySelector('#app'), {
    assetBase: new URL('./', location.href).href,
    onGoogle: false
  });
})();
