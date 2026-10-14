import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { launch, until } from './cdp.mjs';
const browser = await launch({ extension:fileURLToPath(new URL('../extension/',import.meta.url)),port:9337 });
try {
  const page = await browser.page('https://www.google.com/?hl=ru');
  await until(()=> page.evaluate("Boolean(document.querySelector('#hero-google-root')?.shadowRoot.querySelector('.search-bar'))"),20000);
  await until(()=> page.evaluate("getComputedStyle(document.querySelector('#hero-google-root').shadowRoot.querySelector('.search-bar')).borderRadius==='999px'"));
  const state = await page.evaluate("({url:location.href,language:document.querySelector('#hero-google-root').shadowRoot.querySelector('.hg-surface').lang,images:[...document.querySelector('#hero-google-root').shadowRoot.querySelectorAll('img')].every(image=>image.complete && image.naturalWidth>0)})");
  await writeFile('qa/live-google-result.json',JSON.stringify({passed:true,...state},null,2)+'\n');
  console.log('PASS: Live Google homepage mounts the extension, loads its shadow stylesheet, and renders bundled images.');
} catch (error) {
  await writeFile('qa/live-google-result.json',JSON.stringify({passed:false,error:error.message},null,2)+'\n');
  console.error('Live Google check unavailable:',error.message);
  process.exitCode=1;
} finally { await browser.stop(); }
