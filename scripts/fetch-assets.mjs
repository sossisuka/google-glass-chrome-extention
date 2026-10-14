import { mkdir, writeFile } from 'node:fs/promises';
const target = new URL('../extension/assets/', import.meta.url);
await mkdir(new URL('icons/', target), { recursive: true });
const icons = ['search','keyboard','microphone','scan','arrow-right','plus','x','apps','grid-dots','user','dots-vertical','moon-filled','sun-filled','cloud-filled','cloud-rain','cloud-snow','cloud-fog','cloud-storm','world','sparkles','brand-google','trash','check','backspace','settings','cloud','menu-2','bell','home','brand-youtube','subscriptions','history','clock','thumb-up','flame','music','device-gamepad-2','trophy','player-play','player-play-filled'];
const logos = { youtube:'youtube-icon', gmail:'google-gmail', drive:'google-drive', maps:'google-maps', photos:'google-photos', play:'google-play-icon', gemini:'google-gemini-icon' };
const jobs = [
  ...icons.map(name => ({ file:`icons/${name}.svg`, url:`https://api.iconify.design/${name === 'scan' ? 'simple-icons/googlelens' : `tabler/${name === 'subscriptions' ? 'stack-2' : name}`}.svg?color=%23e8eaed` })),
  ...Object.entries(logos).map(([file,name]) => ({ file:`${file}.svg`, url:`https://api.iconify.design/logos/${name}.svg` })),
  { file:'google.png', url:'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png' },
  { file:'logo_gmail_lockup_dark.png', url:'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_dark_1x_r5.png' },
  { file:'logo_gmail_lockup_light.png', url:'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_light_1x_r5.png' },
  { file:'icons/cloud-sun.svg', url:'https://api.iconify.design/meteocons/partly-cloudy-day-fill.svg' },
  { file:'icons/LICENSE.txt', url:'https://raw.githubusercontent.com/tabler/tabler-icons/main/LICENSE' },
  { file:'icons/METEOCONS-LICENSE.txt', url:'https://raw.githubusercontent.com/basmilius/weather-icons/dev/LICENSE' },
  { file:'icons/SIMPLE-ICONS-LICENSE.md', url:'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/LICENSE.md' }
];
const results = await Promise.allSettled(jobs.map(async job => {
  const response = await fetch(job.url);
  if (!response.ok) throw new Error(`${job.file}: HTTP ${response.status}`);
  await writeFile(new URL(job.file, target), Buffer.from(await response.arrayBuffer()));
  return job.file;
}));
for (const result of results) console.log(result.status === 'fulfilled' ? `Saved ${result.value}` : String(result.reason));
if (results.some(item => item.status === 'rejected')) process.exitCode = 1;
