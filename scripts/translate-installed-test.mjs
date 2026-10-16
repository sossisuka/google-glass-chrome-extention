import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch,until,delay} from './cdp.mjs';
import {waitForGoogleUI} from './google-live.mjs';
const browser=await launch({extension:fileURLToPath(new URL('../extension/',import.meta.url)),port:9369});
const checks=[],errors=[];let page;
const root="document.querySelector('#hero-translate-root')?.shadowRoot";
const pass=name=>{checks.push(name);console.log('PASS: '+name);};
async function click(selector){
  const point=await page.evaluate(`(()=>{const el=${root}?.querySelector(${JSON.stringify(selector)});if(!el)throw Error('Control missing: '+${JSON.stringify(selector)});let r=el.getBoundingClientRect();if(r.top<0 || r.bottom>innerHeight){el.scrollIntoView({block:'nearest'});r=el.getBoundingClientRect();}return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});
  await page.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
  await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
}
async function escape(){await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});}
try{
  const google=await browser.page('https://www.google.com/');
  await google.send('Page.bringToFront');await google.send('Emulation.setDeviceMetricsOverride',{width:1568,height:882,deviceScaleFactor:1,mobile:false});
  const googleRoot="document.querySelector('#hero-google-root')?.shadowRoot";
  await waitForGoogleUI(google,`Boolean(${googleRoot}?.querySelector('.google-wordmark')) && !document.documentElement.hasAttribute('data-hg-home-loading')`);
  async function googleClick(selector){const point=await google.evaluate(`(()=>{const r=${googleRoot}.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await google.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await google.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});}
  await googleClick('[data-action=apps]');
  await until(()=>google.evaluate(`${googleRoot}.querySelector('#apps-menu').hidden===false`));
  await google.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await google.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  pass('Comparison: the installed www.google.com homepage opens its apps menu with real pointer input in the same profile');
  await googleClick('.footer [data-action=settings]');
  await until(()=>google.evaluate(`Boolean(${googleRoot}.querySelector('#settings-form'))`));
  await delay(200);await google.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await google.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await until(()=>google.evaluate(`!${googleRoot}.querySelector('#settings-form')`));
  pass('Comparison: the shared HeroUI modal opens and dismisses on the live Google homepage');
  page=await browser.page('https://translate.google.com/');
  page.on('Runtime.exceptionThrown',event=>{errors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text);console.log('EXCEPTION',errors.at(-1));});
  page.on('Runtime.consoleAPICalled',event=>{if(['error','warning'].includes(event.type))console.log('CONSOLE',event.type,event.args.map(a=>a.value || a.description).join(' '));});
  await page.send('Page.bringToFront');await page.send('Emulation.setDeviceMetricsOverride',{width:1568,height:882,deviceScaleFactor:1,mobile:false});
  await waitForGoogleUI(page,`Boolean(${root}?.querySelector('#translate-source')) && !document.documentElement.hasAttribute('data-hg-home-loading')`);await delay(500);
  await click('.tr-header-actions button:nth-of-type(2)');
  await until(()=>page.evaluate(`Boolean(${root}?.querySelector('.tr-apps-grid'))`));await delay(300);
  assert(await page.evaluate(`Boolean(${root}?.querySelector('.tr-apps-grid'))`));
  await escape();await until(()=>page.evaluate(`!${root}?.querySelector('.tr-apps-grid')`));
  pass('Installed root URL receives real pointer input and opens/closes the apps menu');
  await page.evaluate("window.hgBodyInert=document.body.inert;document.body.inert=true;window.hgBodyTrap=event=>{if(event.composedPath().some(node=>node.id==='hero-translate-root')){event.preventDefault();event.stopImmediatePropagation();}};for(const type of ['pointerdown','pointerup','mousedown','mouseup','click','keydown','keyup'])document.body.addEventListener(type,hgBodyTrap,true)");
  await click('.tr-header-actions button:nth-of-type(2)');
  await until(()=>page.evaluate(`Boolean(${root}?.querySelector('.tr-apps-grid'))`),3000);await escape();
  pass('Installed controls remain clickable when the native body is inert and intercepts pointer/keyboard events');
  await click('.tr-source-pane .is-selected');
  await until(()=>page.evaluate(`Boolean(${root}?.querySelector('.tr-language-menu'))`));await delay(300);
  await click('.tr-language-search input');await page.send('Input.insertText',{text:'fr'});
  await until(()=>page.evaluate(`Boolean(${root}?.querySelector('[role=option][data-key=fr]'))`));
  await click('[role=option][data-key=fr]');
  await until(()=>page.evaluate(`${root}?.querySelector('.tr-source-pane [data-language=fr]')?.getAttribute('aria-pressed')==='true' && !${root}?.querySelector('.tr-language-menu')`),25000);
  pass('Installed searchable language menu accepts typing and a trusted option click');
  await click('.tr-header-actions button:first-of-type');
  await until(()=>page.evaluate(`Boolean(${root}?.querySelector('#settings-form'))`));await delay(300);
  await click('#settings-form input[value=light]');
  await click('#settings-form button[type=submit]');
  await until(()=>page.evaluate(`${root}?.querySelector('.tr-surface')?.dataset.theme==='light' && !${root}?.querySelector('#settings-form')`));
  pass('Installed HeroUI settings accept real pointer input and save the selected theme');
  await click('.tr-keyboard-trigger');await until(()=>page.evaluate(`Boolean(${root}?.querySelector('.tr-keyboard'))`));await delay(300);
  await click('.tr-key[data-key=q]');await click('.tr-key[data-key=w]');
  await until(()=>page.evaluate(`${root}?.querySelector('#translate-source')?.value==='qw'`));
  await click('.tr-keyboard-heading button');
  await click('.tr-clear');
  await click('#translate-source');await page.send('Input.insertText',{text:'Bonjour'});
  await until(()=>page.evaluate(`document.querySelector('textarea.er8xn')?.value==='Bonjour' && Boolean(${root}?.querySelector('.tr-result.has-result'))`),25000);
  pass('Installed keyboard, clear and source input still work after saving a modal');
  await writeFile('qa/translate-installed-interactions.png',Buffer.from((await page.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));
  assert.deepEqual(errors,[]);pass('No installed-page runtime exceptions');
  await page.evaluate("document.body.inert=hgBodyInert;for(const type of ['pointerdown','pointerup','mousedown','mouseup','click','keydown','keyup'])document.body.removeEventListener(type,hgBodyTrap,true)");
  await writeFile('qa/translate-installed-results.json',JSON.stringify({url:'https://translate.google.com/',comparison:'https://www.google.com/',checks,errors},null,2)+'\n');
}catch(error){
  const diagnostic=await page?.evaluate(`({url:location.href,html:document.documentElement.outerHTML.slice(0,700),inert:[...document.querySelectorAll('[inert]')].map(e=>e.tagName+'#'+e.id),rootInert:document.querySelector('#hero-translate-root')?.inert,active:document.activeElement?.outerHTML.slice(0,200),shadowActive:${root}?.activeElement?.outerHTML.slice(0,200),menus:${root}?.querySelectorAll('[role=dialog],[role=listbox]').length,theme:${root}?.querySelector('.tr-surface')?.dataset.theme})`).catch(()=>null);console.error(diagnostic);
  await writeFile('qa/translate-installed-results.json',JSON.stringify({checks,errors,failure:error.message,diagnostic},null,2)+'\n');
  if(page)await writeFile('qa/translate-installed-failure.png',Buffer.from((await page.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));
  throw error;
}finally{await browser.stop();}
