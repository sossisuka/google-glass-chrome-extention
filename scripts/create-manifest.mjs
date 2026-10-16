import { writeFile,readFile } from 'node:fs/promises';
const {version}=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const domains = ['google.com','google.ru','google.by','google.kz','google.co.uk','google.de','google.fr','google.es','google.it','google.ca','google.com.au','google.co.in','google.co.jp','google.com.br','google.com.tr','google.pl','google.nl','google.com.ua','google.co.kr','google.com.mx'];
const matches = domains.flatMap(domain => [`https://${domain}/*`, `https://www.${domain}/*`]);
const yandexMatches=['ya.ru','yandex.ru','yandex.com','yandex.by','yandex.kz'].flatMap(domain=>[`https://${domain}/*`,`https://www.${domain}/*`]);
const translateMatches=['https://translate.google.com/*','https://translate.google.ru/*'];
const siteMatches = [...matches,...yandexMatches,...translateMatches,'https://www.youtube.com/*','https://youtube.com/*','https://mail.google.com/*'];
const manifest = {
  manifest_version: 3,
  name: 'Google Glass',
  version,
  description: 'HeroUI Google, Yandex and Translate pages. AI Mode, YouTube and Gmail themes, custom backgrounds and light mode.',
  minimum_chrome_version: '120',
  permissions: ['storage'],
  host_permissions: ['https://api.open-meteo.com/*', 'https://geocoding-api.open-meteo.com/*'],
  background: { service_worker: 'background.js' },
  action: { default_popup:'popup.html', default_title:'Google Glass', default_icon: { 16:'assets/icon-16.png', 32:'assets/icon-32.png', 48:'assets/icon-48.png', 128:'assets/icon-128.png' } },
  icons: { 16:'assets/icon-16.png', 32:'assets/icon-32.png', 48:'assets/icon-48.png', 128:'assets/icon-128.png' },
  chrome_url_overrides: { newtab:'newtab.html' },
  content_scripts: [
    { matches:siteMatches, css:['boot.css','results.css','sites.css'], js:['boot.js'], run_at:'document_start' },
    { matches, include_globs:['https://*/','https://*/?*','https://*/webhp*'], js:['ui.js','app.js','content.js'], run_at:'document_start' },
    { matches, js:['results-content.js'], run_at:'document_end' },
    { matches:yandexMatches, include_globs:['https://*/','https://*/?*'], js:['yandex-ui.js','yandex-content.js'], run_at:'document_start' },
    { matches:translateMatches, css:['translate-native.css'], js:['translate-ui.js','translate-content.js'], run_at:'document_start' },
    { matches:['https://www.youtube.com/*','https://youtube.com/*'], js:['youtube-ui.js','youtube-content.js'], run_at:'document_end' },
    { matches:['https://mail.google.com/*'], js:['gmail-content.js'], run_at:'document_end' }
  ],
  web_accessible_resources: [{ resources:['page.css','ui.css','youtube.css','yandex.css','translate.css','assets/*','assets/icons/*','assets/flags/*','assets/fonts/*'], matches:siteMatches }],
  content_security_policy: { extension_pages: "script-src 'self'; object-src 'self'; base-uri 'self'" }
};
await writeFile(new URL('../extension/manifest.json',import.meta.url), JSON.stringify(manifest,null,2)+'\n');
console.log('Created Manifest V3.');
