import {readFile,writeFile} from 'node:fs/promises';
import {launch} from './cdp.mjs';
const browser=await launch({port:9341});
try{
  const page=await browser.page();
  for(const [name,reference,rendered,width,height,regions] of [
    ['results','reference-results.png','results-desktop.png',1568,882,[['header',85,15,1395,128],['content',257,175,630,710],['knowledge',927,175,545,688]]],
    ['selectors','reference-selectors.png','selectors-desktop.png',1536,1024,[['control',410,69,716,846]]]
  ]){
    const a=(await readFile(`qa/${reference}`)).toString('base64');
    const b=(await readFile(`qa/${rendered}`)).toString('base64');
    const result=await page.evaluate(`(async()=>{
      const a=new Image();a.src='data:image/png;base64,${a}';const b=new Image();b.src='data:image/png;base64,${b}';await Promise.all([a.decode(),b.decode()]);
      const normalized=document.createElement('canvas');normalized.width=${width};normalized.height=${height};normalized.getContext('2d').drawImage(a,0,0,${width},${height});
      const result={dimensions:{source:[a.width,a.height],rendered:[b.width,b.height]},images:{}};
      for(const [region,x,y,w,h] of [['full',0,0,${width},${height}],...${JSON.stringify(regions)}]){
        const canvas=document.createElement('canvas');canvas.width=w*2;canvas.height=h+30;const ctx=canvas.getContext('2d');ctx.fillStyle='#25272d';ctx.fillRect(0,0,canvas.width,30);ctx.fillStyle='white';ctx.font='16px Arial';ctx.fillText('REFERENCE',12,21);ctx.fillText('IMPLEMENTATION',w+12,21);ctx.drawImage(normalized,x,y,w,h,0,30,w,h);ctx.drawImage(b,x,y,w,h,w,30,w,h);result.images[region]=canvas.toDataURL('image/png').split(',')[1];
      }return result;
    })()`);
    console.log(name+': '+JSON.stringify(result.dimensions));
    for(const [region,data] of Object.entries(result.images))await writeFile(`qa/compare-${name}-${region}.png`,Buffer.from(data,'base64'));
  }
}finally{await browser.stop();}
