import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launch,until,delay} from './cdp.mjs';
const browser=await launch({extension:fileURLToPath(new URL('../extension/',import.meta.url)),port:9344});
const checks=[];
try{
  for(const [name,url] of [['youtube','https://www.youtube.com/'],['ai','https://www.google.com/ai']]){
    const page=await browser.page();
    page.on('Runtime.exceptionThrown',event=>console.log('Runtime error: '+(event.exceptionDetails.exception?.description || event.exceptionDetails.text)));
    await page.send('Emulation.setDeviceMetricsOverride',{width:1568,height:882,deviceScaleFactor:1,mobile:false});
    await page.send('Page.navigate',{url});
    await until(()=>page.evaluate("document.readyState==='complete'"),25000);
    await delay(1500);await page.send('Page.bringToFront');
    const consent=await page.evaluate("var consentButton=[...document.querySelectorAll('button,[role=button]')].find(b=>/^(Отклонить все|Reject all)$/i.test(b.innerText.trim()));if(consentButton)consentButton.click();Boolean(consentButton)");
    if(consent) await delay(2200);
    if(name==='youtube')await until(()=>page.evaluate("document.body.innerText.length>10"),15000).catch(()=>{});
    if(name==='youtube') {
      await until(()=>page.evaluate("document.documentElement.hasAttribute('data-hg-youtube-shell')"),15000);
      await until(()=>page.evaluate("[...document.querySelectorAll('[data-hg-youtube-slot]')].every(host=>[...host.shadowRoot.querySelectorAll('link')].every(link=>Boolean(link.sheet)))"));
      await delay(350);
    }
    const result=await page.evaluate("({url:location.href,title:document.title,theme:document.documentElement.getAttribute('data-hg-mode'),ai:document.documentElement.hasAttribute('data-hg-ai'),youtube:document.documentElement.hasAttribute('data-hg-youtube'),youtubeShell:document.documentElement.hasAttribute('data-hg-youtube-shell'),text:document.body.innerText.slice(0,1500),composer:document.querySelector('textarea,[contenteditable=true]')?.outerHTML,main:document.querySelector('main,[role=main]')?.tagName,masthead:document.querySelector('ytd-masthead')?getComputedStyle(document.querySelector('ytd-masthead')).backgroundColor:null})");
    checks.push({name,consentDismissed:consent,...result});
    if(name==='youtube'){
      const palette=await page.evaluate("['html','body','ytd-app','ytd-guide-entry-renderer','ytd-guide-entry-renderer yt-formatted-string','#logo-icon','ytd-message-renderer','ytd-message-renderer yt-formatted-string'].map(selector=>{var el=document.querySelector(selector);return {selector,exists:Boolean(el),color:el?getComputedStyle(el).color:null,text:el?getComputedStyle(el).getPropertyValue('--yt-spec-text-primary'):null,hg:el?getComputedStyle(el).getPropertyValue('--hg-text'):null,shadow:Boolean(el?.shadowRoot)}})");
      checks.at(-1).palette=palette;
      console.log(JSON.stringify({palette}));
    }
    await writeFile(`qa/v2-live-${name}.png`,Buffer.from((await page.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));
    console.log(JSON.stringify({name,url:result.url,title:result.title,ai:result.ai,youtube:result.youtube,masthead:result.masthead}));
  }
  await writeFile('qa/v2-live-results.json',JSON.stringify(checks,null,2)+'\n');
}finally{await browser.stop();}
