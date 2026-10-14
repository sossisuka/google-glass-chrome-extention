import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {launch,until,delay} from './cdp.mjs';
import {gmailFixture} from './sites-fixtures.mjs';

// Controlled native markup, not a signed-in Gmail account or private email.
const before=process.argv.includes('--capture-before');
const browser=await launch({extension:fileURLToPath(new URL('../extension/',import.meta.url)),port:9352});
const checks=[],errors=[];
const pass=name=>{checks.push(name);console.log('PASS: '+name);};
const message=`<table bgcolor="#ffffff" style="background:#fff;color:#222;width:100%;table-layout:auto"><tbody><tr><td style="padding:20px">
  <h2 id="mail-heading" style="color:#202124;font-size:22px">Your project update</h2>
  <p id="mail-copy" style="color:#222">A formatted email should stay readable in a dark inbox.</p>
  <div id="mail-gray" style="background:rgb(245,245,245);padding:14px;color:#555;border:1px solid #ddd">Neutral panels and borders follow the selected theme.</div>
  <p><a id="mail-brand" href="https://example.org/project" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 18px;border-radius:8px">View project</a></p>
  <div id="mail-warning" style="background:#fef3c7;padding:14px;color:#78350f">Keep the original colors of this notice.</div>
  <p><font id="mail-legacy" color="#000000">Legacy HTML color attributes also need readable text.</font></p>
  <p id="mail-alpha" style="color:rgba(233,237,245,.15)">Low-opacity text also needs enough contrast.</p>
  <blockquote id="mail-quote" style="color:#666;border-left:2px solid #ddd;padding-left:14px">An earlier message in the conversation.</blockquote>
  <div id="mail-dark" style="background:#111;color:white;padding:12px">An email's own dark section stays dark.</div>
</td></tr></tbody></table>`;
async function capture(page,name){await page.send('Page.bringToFront');await page.send('Emulation.setDeviceMetricsOverride',{width:1672,height:941,deviceScaleFactor:1,mobile:false});await delay(300);await page.evaluate("Promise.all([...document.images].map(img=>img.decode().catch(()=>{})))");await writeFile(`qa/gmail-${name}.png`,Buffer.from((await page.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));}
const colors="(()=>{const result={};for(const id of ['mail-heading','mail-copy','mail-gray','mail-brand','mail-warning','mail-legacy','mail-alpha','mail-quote','mail-dark']){const el=document.getElementById(id),s=getComputedStyle(el);let p=el,bg;while(p){bg=getComputedStyle(p).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)')break;p=p.parentElement;}result[id]={color:s.color,background:bg,border:s.borderLeftColor};}return result})()";
function luminance(value){const rgb=value.match(/[\d.]+/g).slice(0,3).map(Number).map(c=>{c/=255;return c<=.04045 ? c/12.92 : ((c+.055)/1.055)**2.4;});return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
try{
  const worker=await until(async()=> (await (await fetch(`${browser.endpoint}/json/list`)).json()).find(t=>t.type==='service_worker' && t.url.endsWith('/background.js')));
  const base=`chrome-extension://${new URL(worker.url).hostname}/`;
  const settings=await browser.page(base+'popup.html');
  await until(()=>settings.evaluate("Boolean(document.querySelector('.hg-panel'))"));
  await settings.evaluate("chrome.storage.local.set({settings:{theme:'dark',language:'en',sites:{gmail:true}}})");
  const page=await browser.page();
  await page.send('Emulation.setDeviceMetricsOverride',{width:1672,height:941,deviceScaleFactor:1,mobile:false});
  page.on('Runtime.exceptionThrown',event=>errors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text));
  page.on('Fetch.requestPaused',async event=>{if(event.resourceType==='Document')await page.send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/html; charset=utf-8'}],body:Buffer.from(gmailFixture(base)).toString('base64')});else await page.send('Fetch.continueRequest',{requestId:event.requestId});});
  await page.send('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]});
  await page.send('Page.navigate',{url:'https://mail.google.com/mail/u/0/#inbox'});
  await until(()=>page.evaluate("document.readyState==='complete' && document.documentElement.hasAttribute('data-hg-gmail')"));
  if(!before){await until(()=>page.evaluate("getComputedStyle(document.querySelector('.a3s p')).color==='rgb(233, 237, 245)'"));pass('Plain text mail is readable as soon as the reading pane opens');}
  await capture(page,before ? 'before-inbox' : 'after-inbox');
  await page.evaluate(`document.querySelector('.a3s').innerHTML=${JSON.stringify(message)};document.querySelector('.reading').style.overflow='auto'`);
  await delay(400);
  await capture(page,before ? 'before-html-email' : 'after-html-email');
  const dark=await page.evaluate(colors);
  if(!before){
    for(const [id,value] of Object.entries(dark))assert(contrast(value.color,value.background)>=4.5,`${id} has unreadable contrast: ${JSON.stringify(value)}`);
    assert.equal(dark['mail-brand'].background,'rgb(37, 99, 235)');
    assert.equal(dark['mail-brand'].color,'rgb(255, 255, 255)');
    assert.equal(dark['mail-warning'].background,'rgb(254, 243, 199)');
    assert.equal(dark['mail-warning'].color,'rgb(120, 53, 15)');
    pass('Plain, formatted, legacy, quoted and branded HTML email text has at least 4.5:1 contrast');
    pass('Branded buttons and colored notices retain their authored colors');
  }
  await page.evaluate("document.querySelector('#reply').click();document.querySelector('textarea').value='Keep this native reply draft'");
  await capture(page,before ? 'before-compose' : 'after-compose');
  if(!before){
    assert.equal(await page.evaluate("getComputedStyle(document.querySelector('[role=dialog]')).backgroundColor"),'rgb(13, 16, 21)');
    await settings.evaluate("chrome.storage.local.set({settings:{theme:'light',sites:{gmail:true}}})");
    await until(()=>page.evaluate("document.documentElement.dataset.hgMode==='light' && !document.querySelector('[data-hg-gmail-ink],[data-hg-gmail-surface]')"));
    const light=await page.evaluate(colors);
    assert.equal(light['mail-copy'].color,'rgb(34, 34, 34)');
    assert.equal(light['mail-copy'].background,'rgb(255, 255, 255)');
    await settings.evaluate("chrome.storage.local.set({settings:{theme:'dark',sites:{gmail:false}}})");
    await until(()=>page.evaluate("!document.documentElement.hasAttribute('data-hg-gmail') && !document.querySelector('[data-hg-gmail-ink],[data-hg-gmail-surface]')"));
    assert.equal(await page.evaluate("document.querySelector('textarea').value"),'Keep this native reply draft');
    assert.equal(await page.evaluate("document.querySelector('#mail-copy').style.color"),'rgb(34, 34, 34)');
    pass('Light mode and disabled customization restore authored email colors and preserve drafts');
    await settings.evaluate("chrome.storage.local.set({settings:{theme:'dark',sites:{gmail:true}}})");
    await page.evaluate("document.querySelector('#mail-copy').style.color='#000';document.querySelector('#mail-gray').style.backgroundColor='#fff'");
    await until(()=>page.evaluate("getComputedStyle(document.querySelector('#mail-copy')).color==='rgb(233, 237, 245)' && getComputedStyle(document.querySelector('#mail-gray')).backgroundColor==='rgb(13, 16, 21)'"));
    await page.evaluate("var next=document.createElement('p');next.id='mail-added';next.style.color='#111';next.textContent='Dynamically loaded email content';document.querySelector('.a3s td').append(next)");
    await until(()=>page.evaluate("getComputedStyle(document.querySelector('#mail-added')).color==='rgb(233, 237, 245)'"));
    pass('Style changes and newly loaded message content are recolored without editing authored CSS');
    await page.evaluate("document.querySelector('.reading').hidden=true");
    await until(()=>page.evaluate("!document.querySelector('[data-hg-gmail-ink]')"));
    await page.evaluate("document.querySelector('.reading').hidden=false");
    await until(()=>page.evaluate("getComputedStyle(document.querySelector('#mail-copy')).color==='rgb(233, 237, 245)'"));
    pass('Opening a previously hidden reading pane applies the theme');
    assert.deepEqual(errors,[]);pass('No Gmail adapter exceptions');
  }
  await writeFile(`qa/gmail-${before ? 'before-colors' : 'theme-test-results'}.json`,JSON.stringify({source:'Controlled native markup; no authenticated Gmail account',checks,colors:dark,errors},null,2)+'\n');
}finally{await browser.stop();}
