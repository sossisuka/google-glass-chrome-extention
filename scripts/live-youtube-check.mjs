import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launch,until,delay} from './cdp.mjs';
import {clickNativeControl} from './youtube-test-helpers.mjs';
const browser=await launch({extension:fileURLToPath(new URL('../extension/',import.meta.url)),port:9351});
const checks=[],errors=[];
const pass=check=>{checks.push(check);console.log('PASS: '+check);};
async function shot(page,name){if(process.argv.includes('--no-screenshots'))return;await page.send('Page.bringToFront');await delay(250);await writeFile(`qa/${name}.png`,Buffer.from((await page.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));}
const popupOpen="[...document.querySelectorAll('tp-yt-iron-dropdown,ytd-menu-popup-renderer,ytd-multi-page-menu-renderer,tp-yt-paper-dialog')].some(element=>element.getBoundingClientRect().width>0 && element.getBoundingClientRect().height>0 && !element.closest('[hidden]') && getComputedStyle(element).visibility==='visible')";
async function closePopup(page){await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await delay(200);}
try{
  const page=await browser.page();
  await page.send('Page.bringToFront');
  page.on('Runtime.exceptionThrown',event=>{if(event.exceptionDetails.url?.startsWith('chrome-extension:') || event.exceptionDetails.exception?.description?.includes('youtube-content.js'))errors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text);});
  await page.send('Emulation.setDeviceMetricsOverride',{width:1672,height:941,deviceScaleFactor:1,mobile:false});
  await page.send('Page.navigate',{url:'https://www.youtube.com/@urbandrew_ru/videos'});
  await until(()=>page.evaluate("document.readyState==='complete'"),30000);
  await page.evaluate("[...document.querySelectorAll('button')].find(button=>/^(Reject all|Отклонить все)$/.test(button.innerText.trim()))?.click()");
  await until(()=>page.evaluate("document.querySelectorAll('ytd-rich-item-renderer h3 a').length>=8"),30000);
  // A public channel supplies live view-model components without borrowing a signed-in profile.
  const expected=await page.evaluate("document.querySelector('ytd-rich-item-renderer h3 a').textContent.replace(/\\s+/g,' ').trim()");
  await page.evaluate("history.replaceState({},'', '/');dispatchEvent(new Event('yt-navigate-finish'))");
  await until(()=>page.evaluate("Boolean(document.querySelector('[data-hg-youtube-slot=feature]')?.shadowRoot.querySelector('.yt-featured-title'))"));
  assert.equal(await page.evaluate("document.querySelector('[data-hg-youtube-slot=feature]').shadowRoot.querySelector('.yt-featured-title').textContent.trim()"),expected);
  const titles=await page.evaluate("[...document.querySelectorAll('[data-hg-youtube-slot=card]')].map(host=>host.shadowRoot.querySelector('.yt-video-title')?.textContent).filter(Boolean)");
  assert(titles.length>=4);assert(titles.every(title=>! /^(?:\d+:)?\d+:\d{2}$/.test(title)));
  pass('Live camel-case YouTube view models retain full video titles');
  await until(()=>page.evaluate("[...document.querySelectorAll('[data-hg-youtube-slot]')].flatMap(host=>[...host.shadowRoot.querySelectorAll('[data-hg-native-control]')]).find(element=>element.dataset.hgNativeControl==='menu:4')?.getBoundingClientRect().width>0"));
  await page.evaluate("[...document.querySelectorAll('[data-hg-youtube-slot]')].flatMap(host=>[...host.shadowRoot.querySelectorAll('[data-hg-native-control]')]).find(element=>element.dataset.hgNativeControl==='menu:4').scrollIntoView({block:'center'})");
  await until(()=>page.evaluate("Boolean(document.querySelector('[data-hg-native-overlay=\"menu:4\"]'))"));
  await shot(page,'youtube-fixed-live-feed');
  await clickNativeControl(page,'menu:4');
  await delay(500);
  await until(()=>page.evaluate(popupOpen));
  if(await page.evaluate("Boolean(document.querySelector('yt-contextual-sheet-layout'))"))assert.equal(await page.evaluate("getComputedStyle(document.querySelector('yt-contextual-sheet-layout')).backgroundColor"),'rgb(21, 25, 31)');
  await shot(page,'youtube-fixed-live-menu');
  pass('A real YouTube video action menu opens from the visible HeroUI card');
  const sharePosition=await until(()=>page.evaluate("(()=>{const item=[...document.querySelectorAll('[role=menuitem]')].find(element=>/^(Поделиться|Share)$/.test(element.textContent.trim()) && element.getBoundingClientRect().width>0);if(!item)return null;const rect=item.getBoundingClientRect();return {x:rect.left+rect.width/2,y:rect.top+rect.height/2};})()"));
  await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...sharePosition});
  await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...sharePosition,button:'left',clickCount:1});
  await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...sharePosition,button:'left',clickCount:1});
  await until(()=>page.evaluate("[...document.querySelectorAll('ytd-unified-share-panel-renderer,ytd-share-panel-renderer,yt-dialog-view-model,tp-yt-paper-dialog')].some(element=>element.getBoundingClientRect().width>0 && element.getBoundingClientRect().height>0 && !element.closest('[hidden]') && getComputedStyle(element).visibility==='visible')"));
  await until(()=>page.evaluate("[...document.querySelectorAll('tp-yt-paper-dialog')].some(dialog=>dialog.getBoundingClientRect().width>0 && [...dialog.querySelectorAll('*')].some(element=>/^(Поделиться|Share)$/.test(element.textContent.trim()) && element.getBoundingClientRect().width>0))"));
  assert(await page.evaluate("[...document.querySelectorAll('tp-yt-paper-dialog h2')].some(element=>/^(Поделиться|Share)$/.test(element.textContent.trim()) && element.getBoundingClientRect().width>0 && getComputedStyle(element).color==='rgb(233, 237, 245)')"));
  await shot(page,'youtube-fixed-live-share');
  pass('The native Share action opens a real YouTube modal dialog');
  await closePopup(page);
  await until(()=>page.evaluate('!('+popupOpen+')'));
  if(await page.evaluate("Boolean(document.querySelector('[data-hg-native-overlay=\"header:settings\"]'))")){
    await clickNativeControl(page,'header:settings');
    await until(()=>page.evaluate(popupOpen));
    await shot(page,'youtube-fixed-live-settings');
    pass('The real signed-out YouTube settings dropdown opens from the header');
    await closePopup(page);
  }
  const links=await page.evaluate("[...document.querySelector('[data-hg-youtube-slot=shell]').shadowRoot.querySelectorAll('.yt-nav-link')].map(link=>link.href)");
  assert.equal(new Set(links).size,links.length);
  assert.equal(await page.evaluate("[...document.querySelector('[data-hg-youtube-slot=shell]').shadowRoot.querySelectorAll('.yt-nav-link[aria-current=page]')].filter(link=>new URL(link.href).origin!==location.origin).length"),0);
  pass('The live sidebar has unique links and correct selected-page state');
  assert.deepEqual(errors,[]);
  await writeFile('qa/youtube-live-test-results.json',JSON.stringify({source:'Public channel video components on a home-route test surface; no signed-in account',checks,errors,titles},null,2)+'\n');
}finally{await browser.stop();}
