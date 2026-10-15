import {readFile,writeFile} from 'node:fs/promises';
import {launch} from './cdp.mjs';
const browser=await launch({port:9356});
try{
  const page=await browser.page();
  const a=(await readFile('qa/reference-yandex.png')).toString('base64');
  const b=(await readFile('qa/yandex-desktop.png')).toString('base64');
  const result=await page.evaluate(`(async()=>{
    const reference=new Image();reference.src='data:image/png;base64,${a}';const rendered=new Image();rendered.src='data:image/png;base64,${b}';await Promise.all([reference.decode(),rendered.decode()]);
    const normalized=document.createElement('canvas');normalized.width=1568;normalized.height=882;normalized.getContext('2d').drawImage(reference,0,0,1568,882);
    const output={};
    for(const [name,x,y,width,height] of [['full',0,0,1568,882],['hero',338,190,890,312],['cards',87,550,1395,280]]){
      const canvas=document.createElement('canvas');canvas.width=width*2;canvas.height=height+30;const ctx=canvas.getContext('2d');ctx.fillStyle='#24262c';ctx.fillRect(0,0,canvas.width,30);ctx.fillStyle='#fff';ctx.font='16px Arial';ctx.fillText('REFERENCE',12,21);ctx.fillText('IMPLEMENTATION',width+12,21);ctx.drawImage(normalized,x,y,width,height,0,30,width,height);ctx.drawImage(rendered,x,y,width,height,width,30,width,height);output[name]=canvas.toDataURL('image/png').split(',')[1];
    }return output;
  })()`);
  for(const [name,image] of Object.entries(result))await writeFile(`qa/compare-yandex-${name}.png`,Buffer.from(image,'base64'));
  console.log('Saved Yandex reference/render full, hero and card comparisons.');
}finally{await browser.stop();}
