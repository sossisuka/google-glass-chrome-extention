import { readFile,writeFile } from 'node:fs/promises';
import { launch } from './cdp.mjs';
const browser = await launch({ port:9334 });
try {
  const page = await browser.page();
  const source = await readFile(new URL('../extension/assets/icons/sparkles.svg',import.meta.url),'utf8');
  for (const size of [16,32,48,128]) {
    const data = await page.evaluate(`(async () => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = ${size};
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#14161c'; ctx.beginPath(); ctx.roundRect(0,0,${size},${size},${size*.23}); ctx.fill();
      const image = new Image(); image.src = 'data:image/svg+xml;base64,${Buffer.from(source).toString('base64')}'; await image.decode();
      ctx.drawImage(image,${size*.18},${size*.18},${size*.64},${size*.64});
      return canvas.toDataURL('image/png').split(',')[1];
    })()`);
    await writeFile(new URL(`../extension/assets/icon-${size}.png`,import.meta.url),Buffer.from(data,'base64'));
  }
  console.log('Created extension icons from the bundled Tabler sparkles icon.');
} finally { await browser.stop(); }
