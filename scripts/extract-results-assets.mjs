import {readFile,writeFile} from 'node:fs/promises';
import {launch} from './cdp.mjs';
const browser=await launch({port:9338});
try {
  const page=await browser.page();
  const source=(await readFile('qa/reference-results.png')).toString('base64');
  const outputs=await page.evaluate(`(async()=>{
    const source=new Image();source.src='data:image/png;base64,${source}';await source.decode();
    const outputs={};
    for(const [name,x,y,width,height] of [['glusk-collage',928,175,543,232],['results-glusk',257,201,34,34],['results-wiki',257,409,34,34],['results-niva',257,615,34,34],['results-maps',257,756,34,34]]){
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d').drawImage(source,x,y,width,height,0,0,width,height);outputs[name]=canvas.toDataURL('image/png').split(',')[1];
    }return outputs;
  })()`);
  for(const [name,data] of Object.entries(outputs))await writeFile(`extension/assets/${name}.png`,Buffer.from(data,'base64'));
  console.log('Extracted reference collage and four site favicons.');
}finally{await browser.stop();}
