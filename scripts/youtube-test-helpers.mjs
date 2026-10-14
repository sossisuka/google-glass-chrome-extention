import assert from 'node:assert/strict';
import {until} from './cdp.mjs';

// Click the visible position with real browser input, and prove the native control receives it.
export async function clickNativeControl(page,key){
  await page.send('Page.bringToFront');
  const expression=JSON.stringify(key);
  await until(()=>page.evaluate(`[...document.querySelectorAll('[data-hg-native-overlay]')].some(element=>element.dataset.hgNativeOverlay===${expression})`));
  const position=await page.evaluate(`(()=>{const source=[...document.querySelectorAll('[data-hg-native-overlay]')].find(element=>element.dataset.hgNativeOverlay===${expression});const target=[...document.querySelectorAll('[data-hg-youtube-slot]')].flatMap(host=>[...host.shadowRoot.querySelectorAll('[data-hg-native-control]')]).find(element=>element.dataset.hgNativeControl===${expression});const a=source.getBoundingClientRect(),b=target.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2,aligned:Math.abs(a.left-b.left)<1 && Math.abs(a.top-b.top)<1 && Math.abs(a.width-b.width)<1 && Math.abs(a.height-b.height)<1};})()`);
  assert(position.aligned,`Native ${key} matches its visible control`);
  assert.equal(await page.evaluate(`document.elementFromPoint(${position.x},${position.y})?.closest('[data-hg-native-overlay]')?.dataset.hgNativeOverlay`),key,`Native ${key} receives the pointer`);
  await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:position.x,y:position.y});
  await page.send('Input.dispatchMouseEvent',{type:'mousePressed',x:position.x,y:position.y,button:'left',clickCount:1});
  await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:position.x,y:position.y,button:'left',clickCount:1});
}
