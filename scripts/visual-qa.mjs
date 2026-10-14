import { readFile,writeFile } from 'node:fs/promises';
import { launch } from './cdp.mjs';
const browser = await launch({ port:9335 });
try {
  const page = await browser.page();
  const source = (await readFile('qa/reference.png')).toString('base64');
  const implementation = (await readFile('qa/newtab-ru.png')).toString('base64');
  const result = await page.evaluate(`(async () => {
    const source = new Image(); source.src = 'data:image/png;base64,${source}';
    const implementation = new Image(); implementation.src = 'data:image/png;base64,${implementation}';
    await Promise.all([source.decode(),implementation.decode()]);
    const output = {dimensions:{source:[source.width,source.height],implementation:[implementation.width,implementation.height]},images:{}};
    const normalized = document.createElement('canvas'); normalized.width=1568; normalized.height=882;
    normalized.getContext('2d').drawImage(source,0,0,1568,882);
    for (const [name,x,y,width,height] of [['full',0,0,1568,882],['search',429,150,710,325],['cards',149,508,1270,280]]) {
      const canvas=document.createElement('canvas');canvas.width=width*2;canvas.height=height+30;
      const ctx=canvas.getContext('2d');ctx.fillStyle='#24262c';ctx.fillRect(0,0,canvas.width,30);ctx.fillStyle='white';ctx.font='16px Arial';ctx.fillText('REFERENCE',12,21);ctx.fillText('EXTENSION',width+12,21);
      ctx.drawImage(normalized,x,y,width,height,0,30,width,height);ctx.drawImage(implementation,x,y,width,height,width,30,width,height);
      output.images[name]=canvas.toDataURL('image/png').split(',')[1];
    }
    return output;
  })()`);
  for (const [name,data] of Object.entries(result.images)) await writeFile(`qa/comparison-${name}.png`,Buffer.from(data,'base64'));
  console.log(JSON.stringify(result.dimensions));
} finally { await browser.stop(); }
