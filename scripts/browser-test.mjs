import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { CDP, launch, until, delay } from './cdp.mjs';
const extension = fileURLToPath(new URL('../extension/',import.meta.url));
let previewProcess;
try {
  if (!(await fetch('http://127.0.0.1:4173/')).ok) throw new Error('Preview unavailable');
} catch {
  previewProcess=spawn(process.execPath,[fileURLToPath(new URL('preview.mjs',import.meta.url))],{windowsHide:true,stdio:'ignore'});
  await until(async()=> (await fetch('http://127.0.0.1:4173/')).ok);
}
const browser = await launch({ extension });
const results = [];
const errors = [];
const pass = name => { results.push(name); console.log(`PASS: ${name}`); };
await mkdir('qa',{recursive:true});
let page;

async function ready(cdp, expression="Boolean(document.querySelector('.google-wordmark'))") { await until(() => cdp.evaluate(expression)); await cdp.evaluate("window.fillInput=(element,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(element,value);element.dispatchEvent(new Event('input',{bubbles:true}));};"); }
async function capture(cdp,name,width=1568,height=882) {
  await cdp.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});
  await delay(250);
  await cdp.evaluate("var shotToast = document.querySelector('#toast'); if(shotToast) shotToast.hidden = true;");
  await cdp.evaluate('Promise.all([...document.images].map(image => image.decode().catch(() => {})))');
  const shot = await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  await writeFile(`qa/${name}.png`,Buffer.from(shot.data,'base64'));
}
async function intercept(cdp, pattern, handler) {
  cdp.on('Fetch.requestPaused',params => handler(params).catch(error => errors.push(error.message)));
  await cdp.send('Fetch.enable',{patterns:[{urlPattern:pattern,requestStage:'Request'}]});
}

try {
  const target = await until(async () => (await (await fetch(`${browser.endpoint}/json/list`)).json()).find(target => target.type === 'service_worker' && target.url.endsWith('/background.js')));
  const id = new URL(target.url).hostname;
  const base = `chrome-extension://${id}/`;
  const overridden = await browser.page('chrome://newtab/');
  await ready(overridden);
  assert.equal(await overridden.evaluate('location.origin'),base.slice(0,-1));
  pass('Chrome new tab navigates to the installed override');
  page = await browser.page(base+'newtab.html');
  page.on('Runtime.exceptionThrown',event => errors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text));
  page.on('Runtime.consoleAPICalled',event => { if (event.type === 'error') errors.push(event.args.map(arg => arg.value || arg.description).join(' ')); });
  await ready(page);
  await page.evaluate(`chrome.storage.local.set({settings:{language:'ru',homepageEnabled:true,liveWeather:false,city:'Minsk'}})`);
  await ready(page,"document.querySelector('.hg-surface')?.lang === 'ru'");
  await capture(page,'newtab-ru');
  assert.equal(await page.evaluate("[...document.images].every(image => image.complete && image.naturalWidth > 0)"),true);
  pass('New tab override loads with all local image assets');

  await page.evaluate("document.querySelector('[data-action=apps]').click()");
  assert.equal(await page.evaluate("document.querySelector('#apps-menu').hidden"),false);
  await page.evaluate("document.querySelector('#apps-menu [data-action=apps]').click()");
  pass('Google apps menu opens and closes');
  await page.evaluate("document.querySelector('[data-action=keyboard]').click(); document.querySelector('[data-key=q]')?.click(); document.querySelector('[data-key=й]').click()");
  assert.equal(await page.evaluate("document.querySelector('#search-input').value"),'й');
  await page.evaluate("document.querySelector('[data-key=backspace]').click(); document.querySelector('#keyboard-panel [data-action=keyboard]').click()");
  pass('On-screen keyboard enters and deletes text');

  await page.evaluate("document.querySelector('[data-action=add]').click(); var form=document.querySelector('#shortcut-form'); fillInput(form.elements.name,'Example'); fillInput(form.elements.url,'javascript:alert(1)'); form.requestSubmit()");
  assert(await page.evaluate("document.querySelector('#shortcut-error').textContent.length > 0"));
  await page.evaluate("var form=document.querySelector('#shortcut-form'); fillInput(form.elements.url,'https://example.com'); form.requestSubmit()");
  await ready(page,"document.querySelectorAll('[data-shortcut]').length === 6");
  const reloaded = new Promise(resolve=>{const off=page.on('Page.loadEventFired',()=>{off();resolve();});});
  await page.send('Page.reload');
  await reloaded;
  await ready(page,"document.querySelectorAll('[data-shortcut]').length === 6");
  pass('Shortcut validation and persistence across reload');
  await page.evaluate("var tile=[...document.querySelectorAll('[data-shortcut]')].find(a=>a.textContent.includes('Example')); tile.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true})); var form=document.querySelector('#shortcut-form'); fillInput(form.elements.name,'Example edited'); form.requestSubmit()");
  await ready(page,"[...document.querySelectorAll('[data-shortcut]')].some(a=>a.textContent.includes('Example edited'))");
  await page.evaluate("var tile=[...document.querySelectorAll('[data-shortcut]')].find(a=>a.textContent.includes('Example edited')); tile.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true})); document.querySelector('[data-action=delete]').click()");
  await ready(page,"document.querySelectorAll('[data-shortcut]').length === 5");
  pass('Edit and delete shortcut');

  await page.evaluate("document.querySelector('.footer [data-action=settings]').click(); var form=document.querySelector('#settings-form'); form.elements.hgSettings.value=JSON.stringify({...JSON.parse(form.elements.hgSettings.value),language:'en'}); form.requestSubmit()");
  await ready(page,"document.querySelector('.hg-surface').lang === 'en'");
  await capture(page,'newtab-en');
  await page.evaluate("document.querySelector('#toast').hidden=true");
  await capture(page,'newtab-mobile',390,844);
  assert.equal(await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),true);
  assert.equal(await page.evaluate("document.querySelector('.dashboard').getBoundingClientRect().width <= window.innerWidth"),true);
  pass('Russian / English settings and mobile layout without horizontal overflow');

  const google = await browser.page();
  const nativeFixture = '<!doctype html><html lang="en"><head><title>Google fixture</title></head><body style="overflow:auto"><main id="native-google">Native Google content</main></body></html>';
  await intercept(google,'https://www.google.com/*',params => google.send('Fetch.fulfillRequest',{requestId:params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/html; charset=utf-8'}],body:Buffer.from(nativeFixture).toString('base64')}));
  await google.send('Page.navigate',{url:'https://www.google.com/'});
  await ready(google,"Boolean(document.querySelector('#hero-google-root')?.shadowRoot.querySelector('.google-wordmark'))");
  assert.equal(await google.evaluate("document.querySelector('#native-google').inert"),true);
  assert.equal(await google.evaluate("[...document.querySelector('#hero-google-root').shadowRoot.querySelectorAll('img')].every(image=>image.complete && image.naturalWidth>0)"),true);
  await capture(google,'google-homepage');
  pass('Content script mounts an isolated shadow UI on the Google homepage');
  await google.send('Page.bringToFront');
  await google.evaluate("document.body.inert=true;document.body.addEventListener('pointerdown',event=>{event.preventDefault();event.stopImmediatePropagation()},true)");
  const appsPoint=await google.evaluate("(()=>{const r=document.querySelector('#hero-google-root').shadowRoot.querySelector('[data-action=apps]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
  await google.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...appsPoint});
  await google.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...appsPoint});
  await ready(google,"document.querySelector('#hero-google-root').shadowRoot.querySelector('#apps-menu').hidden===false");
  await google.evaluate("document.body.inert=false;document.querySelector('#hero-google-root').shadowRoot.querySelector('#apps-menu [data-action=apps]').click()");
  pass('Installed Google controls receive trusted pointer input despite an inert native body and native capture handlers');
  await google.evaluate("const native=document.querySelector('#native-google');document.body.append(native); const added=document.createElement('section');added.id='native-added';document.body.append(added)");
  await ready(google,"document.querySelector('#native-added').inert");
  await page.evaluate("(async()=>{const {settings}=await chrome.storage.local.get('settings'); await chrome.storage.local.set({settings:{...settings,homepageEnabled:false}})})()");
  await ready(google,"!document.querySelector('#hero-google-root')");
  assert.equal(await google.evaluate("!document.querySelector('#native-google').inert && !document.querySelector('#native-google').hasAttribute('aria-hidden') && document.body.style.overflow === 'auto'"),true);
  assert.equal(await google.evaluate("!document.querySelector('#native-added').inert && !document.querySelector('#native-added').hasAttribute('aria-hidden')"),true);
  await page.evaluate("(async()=>{const {settings}=await chrome.storage.local.get('settings'); await chrome.storage.local.set({settings:{...settings,homepageEnabled:true}})})()");
  await ready(google,"Boolean(document.querySelector('#hero-google-root'))");
  pass('Homepage toggle restores native Google accessibility and scroll state');
  await google.send('Page.navigate',{url:'https://www.google.com/search?q=hello'});
  await ready(google,"Boolean(document.querySelector('#native-google'))");
  await delay(300);
  assert.equal(await google.evaluate("Boolean(document.querySelector('#hero-google-root'))"),false);
  await google.send('Page.navigate',{url:'https://www.google.com/imghp'});
  await ready(google,"Boolean(document.querySelector('#native-google'))");
  await delay(300);
  assert.equal(await google.evaluate("Boolean(document.querySelector('#hero-google-root'))"),false);
  pass('Search results and Google Images retain their native UI');

  const popup = await browser.page(base+'popup.html');
  await ready(popup,"Boolean(document.querySelector('.hg-panel'))");
  await popup.evaluate("document.querySelector('[data-key=search][role=tab]').click()");
  await ready(popup,"Boolean(document.querySelector('[data-testid=language-trigger]'))");
  await popup.evaluate("document.querySelector('[data-testid=language-trigger]').click()");
  await ready(popup,"Boolean(document.querySelector('[data-key=ru][role=option]'))");
  await popup.evaluate("document.querySelector('[data-key=ru][role=option]').click()");
  await ready(page,"document.querySelector('.hg-surface').lang === 'ru'");
  assert.equal(await popup.evaluate('document.documentElement.lang'),'ru');
  pass('Toolbar popup settings update already open extension pages');

  const preview = await browser.page('http://127.0.0.1:4173/');
  await ready(preview);
  await preview.evaluate("localStorage.setItem('hero-google',JSON.stringify({settings:{language:'ru'}}));location.reload()");
  await ready(preview,"document.querySelector('.hg-surface')?.lang === 'ru'");
  await capture(preview,'preview');
  await preview.evaluate("document.querySelector('.footer [data-action=settings]').click()");
  assert.equal(await preview.evaluate("Boolean(document.querySelector('#settings-form'))"),true);
  await preview.evaluate("document.querySelector('.hg-modal-close').click()");
  pass('Local preview renders and opens its settings dialog');

  const worker = new CDP(target.webSocketDebuggerUrl);
  await worker.send('Runtime.enable');
  const meteo = { current:{temperature_2m:7,relative_humidity_2m:75,wind_speed_10m:4,is_day:1,weather_code:2},daily:{time:['2026-10-14','2026-10-15','2026-10-16','2026-10-17','2026-10-18'],weather_code:[2,3,61,0,1],temperature_2m_max:[9,8,6,11,13]} };
  await worker.evaluate(`globalThis.__originalFetch = fetch; globalThis.__weatherRequests = 0; globalThis.fetch = async(url) => {globalThis.__weatherRequests++; const data=String(url).includes('geocoding')?{results:[{name:'Minsk',latitude:53.9,longitude:27.57}]}:${JSON.stringify(meteo)}; return new Response(JSON.stringify(data),{status:200});}`);
  await page.evaluate("document.querySelector('.footer [data-action=settings]').click(); var form=document.querySelector('#settings-form'); form.elements.hgSettings.value=JSON.stringify({...JSON.parse(form.elements.hgSettings.value),liveWeather:true}); form.requestSubmit()");
  await ready(page,"document.querySelector('.weather-current strong').textContent === '+7°'");
  assert.equal(await worker.evaluate('globalThis.__weatherRequests'),2);
  await page.evaluate("chrome.runtime.sendMessage({type:'weather',city:'Minsk'})");
  assert.equal(await worker.evaluate('globalThis.__weatherRequests'),2);
  pass('Opt-in weather fetch, forecast rendering, and 30-minute cache (API response fixture)');
  await page.evaluate("document.querySelector('.footer [data-action=settings]').click(); var form=document.querySelector('#settings-form'); form.elements.hgSettings.value=JSON.stringify({...JSON.parse(form.elements.hgSettings.value),liveWeather:false}); form.requestSubmit()");
  await ready(page,"document.querySelector('.weather-source').textContent.includes('Пример')");
  await worker.evaluate('globalThis.fetch = globalThis.__originalFetch');
  worker.close();

  let navigation;
  page.on('Page.frameRequestedNavigation',params => { if (params.url.includes('/search?')) navigation=params.url; });
  await intercept(page,'https://www.google.com/*',params => page.send('Fetch.fulfillRequest',{requestId:params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/html'}],body:Buffer.from('<h1>Search destination</h1>').toString('base64')}));
  await page.evaluate("document.querySelector('#search-input').value='HeroUI dark theme'; document.querySelector('#search-form').requestSubmit()");
  await until(()=>navigation);
  assert.equal(new URL(navigation).searchParams.get('q'),'HeroUI dark theme');
  pass('Search form navigates to Google with the query preserved');
  assert.deepEqual(errors,[],'Browser errors must be resolved');
  pass('No runtime exceptions or console errors during the extension flows');
  await writeFile('qa/test-results.json',JSON.stringify({browser:(await (await fetch(`${browser.endpoint}/json/version`)).json()).Browser,results,errors},null,2)+'\n');
} catch (error) {
  console.error('Failure diagnostics:', JSON.stringify({errors, page:page ? await page.evaluate('({url:location.href,html:document.documentElement.outerHTML.slice(0,2500)})').catch(()=>null) : null}));
  throw error;
} finally {
  await browser.stop();
  previewProcess?.kill();
}
