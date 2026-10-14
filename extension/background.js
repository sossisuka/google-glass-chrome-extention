const WEATHER_TTL = 30 * 60 * 1000;
const pending = new Map();

async function fetchJSON(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(12000), credentials: 'omit' });
  if (!response.ok) throw new Error('Weather service is unavailable.');
  return response.json();
}

async function getWeather(city) {
  const { weatherCache, settings = {} } = await chrome.storage.local.get(['weatherCache', 'settings']);
  if (!settings.liveWeather) throw new Error('Live weather is disabled.');
  if (weatherCache?.city === city && Date.now() - weatherCache.fetchedAt < WEATHER_TTL) return weatherCache;
  const geocoding = new URL('https://geocoding-api.open-meteo.com/v1/search');
  geocoding.search = new URLSearchParams({ name: city, count:'1', language:'en', format:'json' });
  const result = await fetchJSON(geocoding);
  const place = result.results?.[0];
  if (!place || !Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) throw new Error('City not found.');
  const forecast = new URL('https://api.open-meteo.com/v1/forecast');
  forecast.search = new URLSearchParams({ latitude:place.latitude, longitude:place.longitude, current:'temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m', daily:'weather_code,temperature_2m_max', wind_speed_unit:'ms', timezone:'auto', forecast_days:'5' });
  const data = await fetchJSON(forecast);
  if (!data.current || !data.daily?.time || !Number.isFinite(data.current.temperature_2m)) throw new Error('Invalid weather response.');
  const cache = { city, place:place.name, fetchedAt:Date.now(), data };
  await chrome.storage.local.set({ weatherCache:cache });
  return cache;
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (sender.id === chrome.runtime.id && message?.type === 'open-settings') {
    chrome.tabs.create({url:chrome.runtime.getURL('newtab.html?settings=1')});
    respond({ok:true});
    return;
  }
  if (sender.id !== chrome.runtime.id || message?.type !== 'weather') return;
  const city = String(message.city || '').trim().slice(0,100);
  if (city.length < 2) { respond({ ok:false, error:'City not found.' }); return; }
  if (!pending.has(city)) pending.set(city, getWeather(city).finally(() => pending.delete(city)));
  pending.get(city).then(data => respond({ ok:true, data }), error => respond({ ok:false, error:error.message }));
  return true;
});
