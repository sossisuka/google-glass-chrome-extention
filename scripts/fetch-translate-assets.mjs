import {writeFile} from 'node:fs/promises';
const icons=['language','file-text','link','photo','camera','copy','thumbs-up-down','share','arrows-exchange','volume','external-link','message-report','arrow-up-right','microphone'];
const material={'file-text':'description-rounded',link:'link-rounded',photo:'image-rounded',camera:'photo-camera-rounded',copy:'content-copy-outline-rounded','thumbs-up-down':'thumbs-up-down-outline-rounded','arrows-exchange':'swap-horiz-rounded',microphone:'mic-rounded'};
for(const name of icons){
  const source=material[name] ? `material-symbols/${material[name]}` : `tabler/${name}`;
  const response=await fetch(`https://api.iconify.design/${source}.svg?color=%239ca6b6`,{signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error(`${name}: ${response.status}`);
  await writeFile(`extension/assets/icons/translate-${name}.svg`,await response.text());
}
const response=await fetch('https://www.gstatic.com/images/branding/product/1x/translate_48dp.png');
if(!response.ok)throw Error('Translate product mark unavailable');
await writeFile('extension/assets/translate-mark.png',Buffer.from(await response.arrayBuffer()));
const sparkle=await fetch('https://api.iconify.design/simple-icons/googlegemini.svg');
if(!sparkle.ok)throw Error('Gemini mark unavailable');
await writeFile('extension/assets/translate-gemini.svg',await sparkle.text());
const license=await fetch('https://raw.githubusercontent.com/google/material-design-icons/master/LICENSE');
if(!license.ok)throw Error('Material Symbols license unavailable');
await writeFile('extension/TRANSLATE-ICONS-LICENSE.txt',await license.text());
console.log('Saved the Translate product mark, Gemini shape, Material Symbols and Tabler icons with their license.');
