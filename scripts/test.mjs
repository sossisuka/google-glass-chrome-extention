import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
for(const script of ['browser-test.mjs','results-test.mjs','v2-test.mjs','sites-test.mjs','gmail-theme-test.mjs','gmail-layout-test.mjs','gmail-scroll-test.mjs','yandex-test.mjs','translate-test.mjs'])execFileSync(process.execPath,[fileURLToPath(new URL(script,import.meta.url))],{stdio:'inherit'});
