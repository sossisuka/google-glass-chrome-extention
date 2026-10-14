import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('extension/assets/fonts',{recursive:true});
for(const [name,url] of [
  ['Inter.ttf','https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz,wght%5D.ttf'],
  ['OFL.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt']
]){
  const response=await fetch(url);
  if(!response.ok)throw new Error(`${name}: HTTP ${response.status}`);
  await writeFile(`extension/assets/fonts/${name}`,Buffer.from(await response.arrayBuffer()));
}
console.log('Bundled Inter variable font and its SIL Open Font License.');
