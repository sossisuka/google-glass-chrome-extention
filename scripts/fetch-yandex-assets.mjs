import {writeFile} from 'node:fs/promises';
const assets={
  'yandex-mark.png':'https://yastatic.net/s3/home-static/_/nova3/DGq8Zi-m.png',
  'yandex-wordmark.svg':'https://commons.wikimedia.org/wiki/Special:FilePath/Yandex_logo_2021_Russian.svg',
  'yandex-maps.svg':'https://maps.yastatic.net/s3/front-maps-static/maps-front-maps/static/v57/icons/favicon/favicon.svg',
  'yandex-market.png':'https://avatars.mds.yandex.net/get-marketcms/475644/img-0ec60a9f-2803-4ab0-8408-ed0dd2cbec79.png/favicon_194x194',
  'yandex-mail.ico':'https://mail.yandex.ru/favicon.ico',
  'yandex-disk.svg':'https://yastatic.net/s3/home/services/all/svg/disk.svg',
  'yandex-music.svg':'https://yastatic-net.ru/s3/music-frontend-static/music/v4.1721.5/favicon.svg',
  'yandex-kinopoisk.svg':'https://api.iconify.design/simple-icons/kinopoisk.svg?color=%23ff5b27',
  'yandex-browser.svg':'https://browser.yandex.ru/icon.svg',
  'yandex-weather.svg':'https://api.iconify.design/meteocons/partly-cloudy-night-fill.svg',
  'yandex-news-tech.jpg':'https://images.unsplash.com/photo-1518770660439-4636190af475?w=160&h=110&fit=crop&auto=format',
  'yandex-news-world.jpg':'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=160&h=110&fit=crop&auto=format',
  'yandex-news-nature.jpg':'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=160&h=110&fit=crop&auto=format',
  'yandex-news-culture.jpg':'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=160&h=110&fit=crop&auto=format'
};
await Promise.all(Object.entries(assets).map(async([file,url])=>{
  const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
  if(!response.ok || !response.headers.get('content-type')?.startsWith('image/'))throw Error(`${file}: HTTP ${response.status} ${response.headers.get('content-type')}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  await writeFile(`extension/assets/${file}`,bytes);
  console.log(`${file}: ${bytes.length} bytes`);
}));
const response=await fetch('https://api.iconify.design/tabler/crown-filled.svg');
if(!response.ok)throw Error('Crown icon unavailable');
await writeFile('extension/assets/icons/crown-filled.svg',await response.text());
await writeFile('extension/assets/yandex-sources.json',JSON.stringify({fetchedAt:new Date().toISOString(),assets},null,2)+'\n');
