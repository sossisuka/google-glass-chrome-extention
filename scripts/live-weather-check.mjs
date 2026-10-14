import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { launch, until } from './cdp.mjs';
const browser = await launch({ extension:fileURLToPath(new URL('../extension/',import.meta.url)),port:9336 });
try {
  const target = await until(async()=> (await (await fetch(`${browser.endpoint}/json/list`)).json()).find(item=> item.type==='service_worker' && item.url.endsWith('/background.js')));
  const id = new URL(target.url).hostname;
  const page = await browser.page(`chrome-extension://${id}/newtab.html`);
  await until(()=>page.evaluate("Boolean(document.querySelector('.google-wordmark'))"));
  await page.evaluate("document.querySelector('.footer [data-action=settings]').click(); var weatherForm=document.querySelector('#settings-form'); weatherForm.elements.liveWeather.checked=true; weatherForm.requestSubmit()");
  await until(()=>page.evaluate("Boolean(document.querySelector('.weather-source a'))"),30000);
  const cache = await page.evaluate("(async()=>{const {weatherCache}=await chrome.storage.local.get('weatherCache'); return {city:weatherCache.city,place:weatherCache.place,fetchedAt:weatherCache.fetchedAt,temperature:weatherCache.data.current.temperature_2m,days:weatherCache.data.daily.time.length};})()");
  await writeFile('qa/live-weather-result.json',JSON.stringify({passed:true,...cache},null,2)+'\n');
  console.log('PASS: Live Open-Meteo geocoding and forecast returned, and the installed extension rendered current weather.');
} catch(error) {
  await writeFile('qa/live-weather-result.json',JSON.stringify({passed:false,error:error.message},null,2)+'\n');
  console.error('Live API check unavailable:',error.message);
  process.exitCode=1;
} finally { await browser.stop(); }
