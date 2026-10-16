import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {launch,until,delay} from './cdp.mjs';
const browser=await launch({extension:fileURLToPath(new URL('../extension/',import.meta.url)),port:9372});
const checks=[],errors=[],root="document.querySelector('#hero-translate-root')?.shadowRoot";
let page;
const pass=name=>{checks.push(name);console.log('PASS: '+name);};
async function click(selector){const point=await page.evaluate(`(()=>{const r=${root}.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await page.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});}
try{
  page=await browser.page();page.on('Runtime.exceptionThrown',event=>errors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text));
  const fixture=`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Delayed native initialization fixture</title></head><body><main><div role="tablist"><button role="tab" data-language-code="auto" aria-selected="true">Auto</button><button role="tab" data-language-code="en">English</button></div><div role="tablist"><button role="tab" data-language-code="ru" aria-selected="true">Russian</button><button role="tab" data-language-code="de">German</button></div><textarea class="er8xn"></textarea><div class="ryNqvb"></div></main><script>
  window.resetNative=()=>{document.querySelector('textarea').replaceWith(document.querySelector('textarea').cloneNode());document.querySelector('textarea').value='';};
  window.finishStartup=()=>{resetNative();const input=document.querySelector('textarea');const render=()=>{const url=new URL(location.href);document.querySelector('.ryNqvb').textContent=input.value ? 'Fixture result: '+input.value : '';url.searchParams.set('text',input.value);history.replaceState({},'',url);};input.addEventListener('input',render);[...document.querySelectorAll('[role=tablist]')].forEach((list,index)=>list.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{const url=new URL(location.href);url.searchParams.set(index?'tl':'sl',button.dataset.languageCode);history.replaceState({},'',url);list.querySelectorAll('button').forEach(other=>other.setAttribute('aria-selected',String(other===button)));render();})));};
  </script></body></html>`;
  page.on('Fetch.requestPaused',event=>page.send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/html; charset=utf-8'}],body:Buffer.from(fixture).toString('base64')}));
  await page.send('Fetch.enable',{patterns:[{urlPattern:'https://translate.google.ru/*',resourceType:'Document',requestStage:'Request'}]});
  await page.send('Page.navigate',{url:'https://translate.google.ru/?sl=auto&tl=ru'});
  await page.send('Page.bringToFront');await page.send('Emulation.setDeviceMetricsOverride',{width:1568,height:882,deviceScaleFactor:1,mobile:false});
  await until(()=>page.evaluate(`Boolean(${root}?.querySelector('#translate-source')) && !document.documentElement.hasAttribute('data-hg-home-loading')`));
  await click('#translate-source');await page.send('Input.insertText',{text:'Early input'});
  await page.evaluate('resetNative()');await delay(350);
  assert.equal(await page.evaluate(`${root}.querySelector('#translate-source').value`),'Early input');
  pass('Early input survives Google replacing and resetting its native textarea before initialization');
  await click('.tr-source-pane [data-language=en]');await click('.tr-target-pane [data-language=de]');await delay(350);
  assert.equal(await page.evaluate(`${root}.querySelector('.tr-source-pane .is-selected').dataset.language`),'en');
  assert.equal(await page.evaluate(`${root}.querySelector('.tr-target-pane .is-selected').dataset.language`),'de');
  pass('Early language choices stay selected until the native controllers accept them');
  await click('.tr-clear');await click('#translate-source');await page.send('Input.insertText',{text:'Latest input'});
  await page.evaluate('finishStartup()');
  await until(()=>page.evaluate(`new URL(location.href).searchParams.get('text')==='Latest input' && new URL(location.href).searchParams.get('sl')==='en' && new URL(location.href).searchParams.get('tl')==='de' && ${root}.querySelector('.tr-result').textContent==='Fixture result: Latest input'`),4000);
  await delay(700);assert.equal(await page.evaluate('document.querySelector("textarea.er8xn").value'),'Latest input');
  pass('Initialization replays only the latest text and language pair into the new native controls');
  await page.evaluate("document.querySelector('textarea.er8xn').value='Native update';document.querySelector('textarea.er8xn').dispatchEvent(new Event('input',{bubbles:true}))");
  await until(()=>page.evaluate(`${root}.querySelector('#translate-source').value==='Native update'`));await delay(700);
  assert.equal(await page.evaluate(`${root}.querySelector('#translate-source').value`),'Native update');
  pass('Acknowledged commands stop replaying so later native changes remain authoritative');
  await click('.tr-clear');await until(()=>page.evaluate(`new URL(location.href).searchParams.get('text')==='' && !${root}.querySelector('.tr-result.has-result')`));
  pass('Clear reaches the native engine and disables stale output after startup');
  assert.deepEqual(errors,[]);pass('No runtime exceptions in the delayed initialization flow');
  await writeFile('qa/translate-startup-results.json',JSON.stringify({source:'Deterministic delayed-controller fixture on the installed translate.google.ru content-script path; output is a fixture, not a real translation',checks,errors},null,2)+'\n');
}finally{await browser.stop();}
