import {until} from './cdp.mjs';

// These isolated test profiles opt out of Google's optional consent cookies.
export async function waitForGoogleUI(page,ready,timeout=35000){
  let lastConsentClick=0;
  await until(async()=>{
    if(await page.evaluate(ready))return true;
    const point=await page.evaluate("(()=>{if(location.hostname!=='consent.google.com')return null;const button=[...document.querySelectorAll('button')].find(el=>/^(Reject all|Отклонить все|Alle ablehnen)$/.test((el.getAttribute('aria-label') || el.textContent).trim()) && el.getClientRects().length);if(!button)return null;button.scrollIntoView({block:'nearest'});const r=button.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()");
    if(point && Date.now()-lastConsentClick>1500){lastConsentClick=Date.now();await page.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});}
    return false;
  },timeout);
}
