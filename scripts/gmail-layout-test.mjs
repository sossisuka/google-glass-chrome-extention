import {writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {launch,until,delay} from './cdp.mjs';
import {gmailLayoutFixture} from './gmail-layout-fixture.mjs';
const before=process.argv.includes('--capture-before');
const browser=await launch({extension:fileURLToPath(new URL('../extension/',import.meta.url)),port:9353});
const checks=[],errors=[],requests=[],responses=[];
const pass=name=>{checks.push(name);console.log('PASS: '+name);};
async function capture(page,name,width=1535,height=1000){await page.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});await delay(350);await page.evaluate("Promise.all([...document.images].map(img=>img.decode().catch(()=>{})))");await writeFile(`qa/gmail-layout-${name}.png`,Buffer.from((await page.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));}
async function click(page,selector){const point=await page.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});}
try{
  const worker=await until(async()=> (await (await fetch(`${browser.endpoint}/json/list`)).json()).find(t=>t.type==='service_worker' && t.url.endsWith('/background.js')));
  const base=`chrome-extension://${new URL(worker.url).hostname}/`;
  const settings=await browser.page(base+'popup.html');await until(()=>settings.evaluate("Boolean(document.querySelector('.hg-panel'))"));
  await settings.evaluate("chrome.storage.local.set({settings:{theme:'dark',language:'ru',sites:{gmail:true}}})");
  const page=await browser.page();await page.send('Network.enable');await page.send('Emulation.setDeviceMetricsOverride',{width:1535,height:1000,deviceScaleFactor:1,mobile:false});
  page.on('Runtime.exceptionThrown',event=>errors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text));
  page.on('Network.requestWillBeSent',event=>requests.push(event.request.url));
  page.on('Network.responseReceived',event=>responses.push({url:event.response.url,status:event.response.status,mime:event.response.mimeType}));
  const logo=(await readFile('extension/assets/logo_gmail_lockup_light.png')).toString('base64');
  page.on('Fetch.requestPaused',async event=>{
    if(event.resourceType==='Document')await page.send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/html; charset=utf-8'}],body:Buffer.from(gmailLayoutFixture(base)).toString('base64')});
    else if(event.request.url.startsWith('https://ssl.gstatic.com/'))await page.send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'image/png'}],body:logo});
    else if(event.request.url.startsWith('https://mail.google.com/'))await page.send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:404,body:''});
    else await page.send('Fetch.continueRequest',{requestId:event.requestId});
  });
  await page.send('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]});
  await page.send('Page.navigate',{url:'https://mail.google.com/mail/u/0/#inbox'});
  await until(()=>page.evaluate("document.readyState==='complete' && document.documentElement.hasAttribute('data-hg-gmail')"));
  await capture(page,before ? 'before' : 'dark');
  const readColors=()=>page.evaluate("Object.fromEntries(['.layout-root','.left-frame','.main-wrap','.right-frame','.label-heading','.group-heading','.footer-info','.native-glyph'].map(selector=>{const s=getComputedStyle(document.querySelector(selector));return [selector,{background:s.backgroundColor,color:s.color}]}))");
  const colors=await readColors();
  if(!before){
    for(const selector of ['.layout-root','.left-frame','.main-wrap','.right-frame'])assert.equal(colors[selector].background,'rgb(8, 10, 13)',selector);
    assert.equal(colors['.group-heading'].background,'rgb(13, 16, 21)');
    assert.equal(colors['.label-heading'].color,'rgb(233, 237, 245)');
    assert.equal(colors['.group-heading'].color,'rgb(233, 237, 245)');
    assert.equal(colors['.footer-info'].color,'rgb(161, 170, 187)');
    assert.equal(colors['.native-glyph'].background,'rgb(161, 170, 187)');
    assert.equal(await page.evaluate("getComputedStyle(document.querySelector('[role=navigation]')).borderTopWidth"),'0px');
    assert.equal(await page.evaluate("getComputedStyle(document.querySelector('[role=navigation]')).boxShadow"),'none');
    pass('Unread-first inbox, full sidebar, outer gutters, Workspace rail, headings and footer are dark and readable');
    assert(await page.evaluate("getComputedStyle(document.querySelector('#gmail-native-logo')).content.startsWith('url(\"'+"+JSON.stringify(base)+")"));
    await until(()=>responses.some(r=>r.url===base+'assets/logo_gmail_lockup_dark.png' && r.status===200 && r.mime==='image/png'));
    assert(await page.evaluate("document.fonts.load('14px HGInter').then(fonts=>fonts.length>0 && fonts.every(font=>font.status==='loaded')).catch(()=>false)"));
    assert(!requests.some(url=>url.startsWith('https://mail.google.com/') && url.includes('/assets/')));
    pass('Injected CSS loads the actual bundled Gmail logo and Inter font from extension URLs');
    const svgSource=(await readFile('extension/assets/icons/settings.svg','utf8')).replace(/<svg /,'<svg id="native-svg-probe" ').replace(/stroke="[^"]+"/g,'stroke="#202124"');
    await page.evaluate(`document.querySelector('#layout-settings').innerHTML=${JSON.stringify(svgSource)}`);
    await until(()=>page.evaluate("getComputedStyle(document.querySelector('#native-svg-probe [stroke]')).stroke==='rgb(161, 170, 187)'"));
    assert.equal(await page.evaluate("document.querySelector('#native-svg-probe [stroke]').getAttribute('stroke')"),'#202124');
    pass('Native monochrome SVG strokes become visible without changing the authored stroke attribute');
    await click(page,'tr [role=checkbox]');assert.equal(await page.evaluate("document.querySelector('tr [role=checkbox]').getAttribute('aria-checked')"),'true');
    await click(page,'#unread-group');assert(await page.evaluate("document.querySelector('#unread-rows').hidden"));
    await click(page,'#unread-group');assert.equal(await page.evaluate("document.querySelector('#unread-rows').hidden"),false);
    await click(page,'#layout-settings');assert.equal(await page.evaluate("document.querySelector('.fixture-menu').hidden"),false);await click(page,'#layout-settings');
    await click(page,'#layout-compose');await page.evaluate("document.querySelector('textarea').value='Preserved layout draft'");await capture(page,'compose');await click(page,'#layout-close');
    pass('Trusted native checkbox, collapsible sections, settings menu and compose controls remain functional');
    await page.evaluate("var extra=document.createElement('div');extra.id='new-layout-surface';extra.style.backgroundColor='#fff';extra.style.color='#202124';extra.textContent='Dynamically added settings surface';document.querySelector('.main-wrap').append(extra)");
    await until(()=>page.evaluate("getComputedStyle(document.querySelector('#new-layout-surface')).backgroundColor==='rgb(8, 10, 13)' && getComputedStyle(document.querySelector('#new-layout-surface')).color==='rgb(233, 237, 245)'"));
    await page.evaluate("document.querySelector('#new-layout-surface').remove()");pass('New native UI surfaces inherit the palette without relying on Gmail class names');
    await settings.evaluate("chrome.storage.local.set({settings:{theme:'light',sites:{gmail:true}}})");
    await until(()=>page.evaluate("document.documentElement.dataset.hgMode==='light' && !document.querySelector('[data-hg-gmail-ink],[data-hg-gmail-surface]')"));
    await capture(page,'light');assert.equal((await readColors())['.layout-root'].background,'rgb(246, 248, 252)');
    await until(()=>responses.some(r=>r.url===base+'assets/logo_gmail_lockup_light.png' && r.status===200));
    await settings.evaluate("chrome.storage.local.set({settings:{theme:'dark',sites:{gmail:false}}})");
    await until(()=>page.evaluate("!document.documentElement.hasAttribute('data-hg-gmail') && !document.querySelector('[data-hg-gmail-ink],[data-hg-gmail-surface],[data-hg-gmail-icon-fill]')"));
    assert.equal((await readColors())['.label-heading'].color,'rgb(32, 33, 36)');assert.equal(await page.evaluate("document.querySelector('textarea').value"),'Preserved layout draft');
    pass('Light mode and disabling customization restore native UI colors and preserve the draft');
    await settings.evaluate("chrome.storage.local.set({settings:{theme:'dark',sites:{gmail:true}}})");await capture(page,'mobile',390,844);assert(await page.evaluate("document.documentElement.scrollWidth<=innerWidth"));pass('Unread-first layout fits a 390px viewport');
    assert.deepEqual(errors,[]);pass('No adapter exceptions');
  }
  await writeFile(`qa/gmail-layout-${before ? 'before-results' : 'test-results'}.json`,JSON.stringify({source:'Anonymized layout fixture based on the user-provided screenshot, not authenticated Gmail',checks,colors,requests:requests.filter(url=>url.includes('/assets/') || url.includes('logo_gmail')),errors},null,2)+'\n');
}finally{await browser.stop();}
