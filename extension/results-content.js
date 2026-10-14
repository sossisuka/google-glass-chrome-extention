(() => {
  let enabled=false;
  let observer;
  let queued;
  const marked = new Map();
  const attr = 'data-hg-role';
  function mark(element,role) {
    if(!element || marked.has(element)) return;
    marked.set(element,element.getAttribute(attr));
    element.setAttribute(attr,role);
  }
  function discover() {
    if(!enabled) return;
    mark(document.querySelector('#searchform'),'header');
    mark(document.querySelector('#search'),'results');
    mark(document.querySelector('#rhs'),'knowledge');
    mark(document.querySelector('#result-stats'),'stats');
    mark(document.querySelector('#hdtb'),'tabs');
    if(document.documentElement.hasAttribute('data-hg-ai')) {
      mark(document.querySelector('main,[role=main]'),'ai-main');
      for(const input of document.querySelectorAll('textarea,[contenteditable=true],[role=textbox]')) mark(input.closest('form') || input.parentElement,'ai-composer');
      mark(document.querySelector('[data-key=aim-err-punt]'),'ai-card');
    }
    for(const heading of document.querySelectorAll('#search h3')) {
      mark(heading,'result-title');
      const result=heading.closest('.MjjYud') || heading.closest('.g');
      if(result) mark(result,'result-block');
    }
    for(const container of document.querySelectorAll('#rhs [data-attrid]')) mark(container,'knowledge-field');
  }
  function schedule() {
    clearTimeout(queued);
    queued=setTimeout(discover,100);
  }
  function enable() {
    if(enabled || !document.body) return;
    enabled=true;
    document.documentElement.setAttribute('data-hg-results','');
    observer=new MutationObserver(schedule);
    observer.observe(document.body,{childList:true,subtree:true});
    discover();
  }
  function disable() {
    enabled=false;
    observer?.disconnect();
    clearTimeout(queued);
    for(const [element,value] of marked) {
      if(value===null) element.removeAttribute(attr); else element.setAttribute(attr,value);
    }
    marked.clear();
  }
  async function sync() {
    await window.HeroGoogleBoot?.ready;
    if(document.documentElement.hasAttribute('data-hg-results')) enable(); else disable();
  }
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local' && changes.settings) sync();});
  window.addEventListener('popstate',sync);
  window.addEventListener('pageshow',sync);
  window.addEventListener('hg-route',sync);
  if(document.body) sync(); else document.addEventListener('DOMContentLoaded',sync,{once:true});
})();
