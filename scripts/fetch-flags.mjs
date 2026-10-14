import {countries} from 'countries-list';
import {mkdir,writeFile,access} from 'node:fs/promises';
await mkdir('extension/assets/flags',{recursive:true});
const codes=Object.keys(countries);
let index=0;
const failures=[];
async function worker() {
  while(index<codes.length) {
    const code=codes[index++].toLowerCase();
    try {await access(`extension/assets/flags/${code}.svg`);continue;} catch {}
    const source=code==='ac' ? 'sh-ac' : code==='ta' ? 'sh-ta' : code;
    const result=await fetch(`https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${source}.svg`);
    if(!result.ok) {failures.push(code);continue;}
    await writeFile(`extension/assets/flags/${code}.svg`,Buffer.from(await result.arrayBuffer()));
  }
}
await Promise.all(Array.from({length:8},worker));
for(const name of ['chevron-down','chevron-right','language','external-link','share','bookmark','device-mobile','route','map-pin','photo','arrows-maximize']) {
  const result=await fetch(`https://api.iconify.design/tabler/${name}.svg?color=%23e8eaed`);
  if(!result.ok) throw new Error(`Icon ${name}: ${result.status}`);
  await writeFile(`extension/assets/icons/${name}.svg`,Buffer.from(await result.arrayBuffer()));
}
const license=await fetch('https://raw.githubusercontent.com/lipis/flag-icons/main/LICENSE');
await writeFile('extension/assets/flags/LICENSE.txt',await license.text());
if(failures.length) throw new Error(`Missing flags: ${failures.join(',')}`);
console.log(`Bundled ${codes.length} country flags and selector/result icons.`);
