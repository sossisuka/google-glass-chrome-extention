import { writeFile } from 'node:fs/promises';
const domains = ['google.com','google.ru','google.by','google.kz','google.co.uk','google.de','google.fr','google.es','google.it','google.ca','google.com.au','google.co.in','google.co.jp','google.com.br','google.com.tr','google.pl','google.nl','google.com.ua','google.co.kr','google.com.mx'];
const matches = domains.flatMap(domain => [`https://${domain}/*`, `https://www.${domain}/*`]);
const siteMatches = [...matches,'https://www.youtube.com/*','https://youtube.com/*','https://mail.google.com/*'];
const manifest = {
  manifest_version: 3,
  name: 'Google Glass',
  version: '1.2.0',
  description: 'HeroUI light and dark themes for Google, AI Mode, YouTube and Gmail. Custom new-tab backgrounds and search selectors.',
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
    { matches, js:['results-content.js'], run_at:'document_end' }
  ],
  web_accessible_resources: [{ resources:['page.css','ui.css','assets/*','assets/icons/*','assets/flags/*','assets/fonts/*'], matches:siteMatches }],
  content_security_policy: { extension_pages: "script-src 'self'; object-src 'self'; base-uri 'self'" }
};
await writeFile(new URL('../extension/manifest.json',import.meta.url), JSON.stringify(manifest,null,2)+'\n');
console.log('Created Manifest V3.');
