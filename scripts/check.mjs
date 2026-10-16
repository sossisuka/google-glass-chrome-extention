import { readFile, access, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import {countries} from 'countries-list';
const directory = new URL('../extension/',import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json',directory),'utf8'));
assert.equal(manifest.manifest_version,3);
assert.deepEqual(manifest.permissions,['storage']);
assert(!JSON.stringify(manifest).includes('<all_urls>'));
const declared = [manifest.background.service_worker, manifest.action.default_popup, manifest.chrome_url_overrides.newtab,...Object.values(manifest.icons),...manifest.content_scripts.flatMap(item => [...item.js,...(item.css || [])])];
assert.equal(manifest.content_scripts[0].run_at,'document_start');
assert(manifest.content_scripts[0].css.includes('results.css'));
assert(manifest.content_scripts[0].matches.includes('https://mail.google.com/*'));
assert(manifest.content_scripts[0].matches.includes('https://www.youtube.com/*'));
assert(manifest.content_scripts.some(item=>item.matches.includes('https://www.youtube.com/*') && item.js.includes('youtube-content.js') && item.js.includes('youtube-ui.js')));
assert(manifest.content_scripts.some(item=>item.matches.includes('https://mail.google.com/*') && item.js.includes('gmail-content.js')));
assert(manifest.web_accessible_resources.some(item=>item.resources.includes('youtube.css')));
assert(manifest.content_scripts.some(item=>item.matches.includes('https://ya.ru/*') && item.js.includes('yandex-content.js') && item.js.includes('yandex-ui.js')));
assert(manifest.web_accessible_resources.some(item=>item.resources.includes('yandex.css')));
assert(manifest.content_scripts.some(item=>item.matches.includes('https://translate.google.com/*') && item.js.includes('translate-ui.js') && item.js.includes('translate-content.js')));
assert(manifest.web_accessible_resources.some(item=>item.resources.includes('translate.css')));
assert.equal(manifest.version,JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8')).version);
await Promise.all(declared.map(file => access(new URL(file,directory))));
for (const file of await readdir(directory)) {
  if (file.endsWith('.js')) execFileSync(process.execPath,['--check',new URL(file,directory).pathname.replace(/^\/(\w:)/,'$1')]);
  if (file.endsWith('.html')) {
    const html = await readFile(new URL(file,directory),'utf8');
    assert(!/<script[^>]*src=["']https?:/i.test(html),'Scripts must be bundled.');
    assert(!/\son\w+=/i.test(html),'Inline event handlers are incompatible with MV3 CSP.');
    for (const [,filePath] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
      if (!filePath.startsWith('http')) await access(new URL(filePath,directory));
    }
  }
}
for (const icon of ['search','keyboard','microphone','scan','arrow-right','plus','x','grid-dots','apps','user','dots-vertical','moon-filled','sun-filled','cloud-filled','cloud-sun','cloud-rain','cloud-snow','cloud-fog','cloud-storm','world','backspace','menu-2','bell','home','brand-youtube','subscriptions','history','clock','thumb-up','flame','music','device-gamepad-2','trophy','player-play','player-play-filled']) await access(new URL(`assets/icons/${icon}.svg`,directory));
for (const image of ['background.png','orbit.png','google.png','youtube.svg','gmail.svg','logo_gmail_lockup_dark.png','logo_gmail_lockup_light.png','drive.svg','maps.svg','photos.svg','gemini.svg','play.svg']) await access(new URL(`assets/${image}`,directory));
for (const code of Object.keys(countries)) await access(new URL(`assets/flags/${code.toLowerCase()}.svg`,directory));
for (const image of ['results-background.png','glusk-collage.png','results-glusk.png','results-wiki.png','results-niva.png','results-maps.png']) await access(new URL(`assets/${image}`,directory));
for (const image of ['yandex-background.png','yandex-plus.png','yandex-wordmark.svg','yandex-mark.png','yandex-maps.svg','yandex-market.png','yandex-mail.ico','yandex-disk.svg','yandex-music.svg','yandex-kinopoisk.svg','yandex-browser.svg','yandex-weather.svg','yandex-news-tech.jpg','yandex-news-world.jpg','yandex-news-nature.jpg','yandex-news-culture.jpg']) await access(new URL(`assets/${image}`,directory));
for(const image of ['translate-background.png','translate-mark.png','translate-gemini.svg','translate-languages.json'])await access(new URL(`assets/${image}`,directory));
assert(JSON.parse(await readFile(new URL('assets/translate-languages.json',directory),'utf8')).length>=200);
for(const icon of ['language','file-text','link','photo','camera','copy','thumbs-up-down','share','arrows-exchange','volume','external-link','message-report','arrow-up-right','microphone'])await access(new URL(`assets/icons/translate-${icon}.svg`,directory));
await access(new URL('TRANSLATE-ICONS-LICENSE.txt',directory));
for (const file of ['ui.js','ui.css','HEROUI-LICENSE.txt','ui.js.LEGAL.txt','results.css']) await access(new URL(file,directory));
for (const file of ['assets/fonts/Inter.ttf','assets/fonts/OFL.txt','assets/flags/LICENSE.txt']) await access(new URL(file,directory));
console.log('PASS: Manifest V3, bundled resources, script syntax, and CSP-compatible HTML.');
