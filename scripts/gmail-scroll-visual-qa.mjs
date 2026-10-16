import {readFile,writeFile} from 'node:fs/promises';
import {launch} from './cdp.mjs';
const browser=await launch({port:9366});
try{
  const page=await browser.page();
  const source=(await readFile('.browser-profile/references/gmail-glass-reference.png')).toString('base64');
  const top=(await readFile('qa/gmail-scroll-top.png')).toString('base64');
  const scrolled=(await readFile('qa/gmail-scroll-dark.png')).toString('base64');
  const output=await page.evaluate(`(async()=>{
    const a=new Image(),b=new Image(),c=new Image();a.src='data:image/png;base64,${source}';b.src='data:image/png;base64,${top}';c.src='data:image/png;base64,${scrolled}';await Promise.all([a.decode(),b.decode(),c.decode()]);
    const output={};
    const pairs=[['compose',22,92,150,60,8,72,148,62,150,60],['logo',80,21,120,40,73,11,109,40,120,40],['toolbar',272,93,600,58,257,64,600,48,600,58]];
    for(const [name,ax,ay,aw,ah,bx,by,bw,bh,w,h] of pairs){
      const canvas=document.createElement('canvas');canvas.width=w*2;canvas.height=h+30;const ctx=canvas.getContext('2d');ctx.fillStyle='#252a32';ctx.fillRect(0,0,w*2,30);ctx.fillStyle='#fff';ctx.font='13px Arial';ctx.fillText('REFERENCE',5,20);ctx.fillText('NATIVE THEME',w+5,20);ctx.drawImage(a,ax,ay,aw,ah,0,30,w,h);ctx.drawImage(name==='toolbar'?c:b,bx,by,bw,bh,w,30,w,h);output[name]=canvas.toDataURL('image/png').split(',')[1];
      if(name==='compose'){output.samples=[[16,12],[40,10],[70,10],[70,48],[125,48]].map(([x,y])=>({point:[x,y],reference:[...ctx.getImageData(x,y+30,1,1).data],rendered:[...ctx.getImageData(x+w,y+30,1,1).data]}));}
    }
    return output;
  })()`);
  for(const [name,data] of Object.entries(output))if(name!=='samples')await writeFile(`qa/compare-gmail-${name}.png`,Buffer.from(data,'base64'));
  console.log(JSON.stringify(output.samples));
}finally{await browser.stop();}
