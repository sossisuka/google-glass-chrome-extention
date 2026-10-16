import {readFile,writeFile} from 'node:fs/promises';
import {launch} from './cdp.mjs';
const browser=await launch({port:9365});
try{
  const page=await browser.page();
  const reference=(await readFile('qa/reference-translate.png')).toString('base64');
  const rendered=(await readFile('qa/translate-desktop.png')).toString('base64');
  const comparisons=await page.evaluate(`(async()=>{
    const a=new Image(),b=new Image();a.src='data:image/png;base64,${reference}';b.src='data:image/png;base64,${rendered}';await Promise.all([a.decode(),b.decode()]);
    const normalized=document.createElement('canvas');normalized.width=1568;normalized.height=882;normalized.getContext('2d').drawImage(a,0,0,1568,882);const output={};
    for(const [name,x,y,width,height] of [['full',0,0,1568,882],['header',30,0,1510,80],['panes',150,304,1270,244],['methods',470,585,630,171]]){
      const canvas=document.createElement('canvas');canvas.width=width*2;canvas.height=height+30;const ctx=canvas.getContext('2d');ctx.fillStyle='#252a32';ctx.fillRect(0,0,canvas.width,30);ctx.fillStyle='#fff';ctx.font='15px Arial';ctx.fillText('REFERENCE',12,21);ctx.fillText('IMPLEMENTATION',width+12,21);ctx.drawImage(normalized,x,y,width,height,0,30,width,height);ctx.drawImage(b,x,y,width,height,width,30,width,height);output[name]=canvas.toDataURL('image/png').split(',')[1];
    }
    const renderedCanvas=document.createElement('canvas');renderedCanvas.width=1568;renderedCanvas.height=882;renderedCanvas.getContext('2d').drawImage(b,0,0);output.samples=[[160,330],[190,350],[185,375],[600,400],[200,500],[740,500],[1390,500]].map(([x,y])=>({point:[x,y],reference:[...normalized.getContext('2d').getImageData(x,y,1,1).data],rendered:[...renderedCanvas.getContext('2d').getImageData(x,y,1,1).data]}));return output;
  })()`);
  for(const [name,data] of Object.entries(comparisons))if(name!=='samples')await writeFile(`qa/compare-translate-${name}.png`,Buffer.from(data,'base64'));
  await writeFile('qa/translate-color-samples.json',JSON.stringify(comparisons.samples,null,2)+'\n');console.log(comparisons.samples);
  console.log('Saved Translate reference/render comparisons.');
}finally{await browser.stop();}
