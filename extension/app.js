(() => {
  'use strict';

  const DEFAULT_SHORTCUTS = [
    { id:'youtube', name:'YouTube', url:'https://www.youtube.com/', icon:'youtube' },
    { id:'gmail', name:'Gmail', url:'https://mail.google.com/', icon:'gmail' },
    { id:'drive', name:'Drive', ru:'Диск', url:'https://drive.google.com/', icon:'drive' },
    { id:'maps', name:'Maps', ru:'Карты', url:'https://maps.google.com/', icon:'maps' },
    { id:'photos', name:'Photos', ru:'Фото', url:'https://photos.google.com/', icon:'photos' }
  ];
  const COPY = {
    en: {
      about:'About', store:'Google Store', ads:'Advertising', business:'Business', mail:'Gmail', images:'Images', apps:'Google apps', account:'Google account', results:'Restyle Google search results', regionHint:'Country sets the region for your next Google search.',
      left:'MORE POSSIBILITIES<br>EVERY SINGLE DAY', leftSub:'Search. Ideas. People. Technology.', right:'KNOWLEDGE<br>BRINGS THE WORLD<br>CLOSER',
      search:'Search or enter a URL', searchLabel:'Search Google or enter a website address', keyboard:'On-screen keyboard', voice:'Search by voice', lens:'Search with Google Lens', add:'Add shortcut',
      aiTitle:'Artificial intelligence<br>for everyone', aiBody:'We create technology that helps<br>people, communities, and the<br>whole world move forward.', explore:'Explore Google AI',
      gemini:'Your AI assistant<br>from Google', play:'Apps, games,<br>movies, and books', one:'More space<br>for your ideas',
      minsk:'Minsk', clear:'Clear', cloudy:'Cloudy', rain:'Rain', snow:'Snow', fog:'Fog', storm:'Thunderstorms', humidity:'Humidity', wind:'Wind', sample:'Sample', live:'Live', stale:'Saved',
      privacy:'Privacy', terms:'Terms', settings:'Settings', how:'How Search works', location:'Your Google, reimagined',
      close:'Close', save:'Save changes', cancel:'Cancel', remove:'Delete shortcut', shortcutTitle:'Add a shortcut', editTitle:'Edit shortcut', name:'Name', url:'Website URL', urlHint:'Use a website address such as https://example.com',
      settingsTitle:'Make it yours', settingsSub:'Small details. Your space.', language:'Language', automatic:'Automatic', homepage:'Restyle the Google homepage', weather:'Live weather', weatherInfo:'Fetch a forecast for your city from Open-Meteo. Your city and IP address are sent to the weather service.', city:'City', weatherLink:'Weather by Open-Meteo',
      sampleInfo:'Sample forecast. Enable live weather in settings.', saved:'Changes saved', deleted:'Shortcut deleted', maxShortcuts:'You can save up to 8 shortcuts.', nameRequired:'Enter a name for your shortcut.', urlInvalid:'Enter a valid HTTP or HTTPS website address.',
      voiceUnavailable:'Voice search is unavailable here. You can type your search or use Google’s native microphone.', listening:'Listening…', voiceFailed:'Could not hear you. Check microphone access and try again.',
      weatherFailed:'Could not load weather. Check your city and connection, then try again in settings.', previewWeather:'Live weather works after installing the extension. The preview uses sample data.',
      keyboardHint:'Type here or use your keyboard. Esc closes this panel.', space:'Space', enter:'Search', shortcutHint:'Right-click a shortcut to edit it.', retry:'Retry weather', cityRequired:'Enter a city to enable live weather.'
    },
    ru: {
      about:'О нас', store:'Google Store', ads:'Реклама', business:'Для бизнеса', mail:'Почта', images:'Картинки', apps:'Приложения Google', account:'Аккаунт Google', results:'Новый вид результатов поиска Google', regionHint:'Страна задаёт регион для следующего поиска Google.',
      left:'БОЛЬШЕ<br>ВОЗМОЖНОСТЕЙ<br>КАЖДЫЙ ДЕНЬ', leftSub:'Поиск. Идеи. Люди. Технологии.', right:'ЗНАНИЯ<br>ДЕЛАЮТ МИР<br>БЛИЖЕ',
      search:'Введите запрос или URL', searchLabel:'Поиск в Google или адрес сайта', keyboard:'Экранная клавиатура', voice:'Голосовой поиск', lens:'Поиск с Google Объективом', add:'Добавить',
      aiTitle:'Искусственный<br>интеллект для каждого', aiBody:'Мы создаем технологии, которые<br>помогают людям, сообществам<br>и всему миру развиваться.', explore:'Узнать о Google AI',
      gemini:'Ваш ИИ-помощник<br>от Google', play:'Приложения, игры,<br>фильмы и книги', one:'Больше пространства<br>для ваших идей',
      minsk:'Минск', clear:'Ясно', cloudy:'Облачно', rain:'Дождь', snow:'Снег', fog:'Туман', storm:'Гроза', humidity:'Влажность', wind:'Ветер', sample:'Пример', live:'Сейчас', stale:'Сохранено',
      privacy:'Конфиденциальность', terms:'Условия', settings:'Настройки', how:'Как работает Google', location:'Ваш Google в новом стиле',
      close:'Закрыть', save:'Сохранить', cancel:'Отмена', remove:'Удалить ярлык', shortcutTitle:'Добавить ярлык', editTitle:'Изменить ярлык', name:'Название', url:'Адрес сайта', urlHint:'Укажите адрес сайта, например https://example.com',
      settingsTitle:'Ваше пространство', settingsSub:'Детали, которые делают его вашим.', language:'Язык', automatic:'Автоматически', homepage:'Новый вид главной страницы Google', weather:'Актуальная погода', weatherInfo:'Прогноз для вашего города от Open-Meteo. Сервис получает название города и ваш IP-адрес.', city:'Город', weatherLink:'Погода от Open-Meteo',
      sampleInfo:'Пример прогноза. Включите актуальную погоду в настройках.', saved:'Изменения сохранены', deleted:'Ярлык удален', maxShortcuts:'Можно добавить до 8 ярлыков.', nameRequired:'Введите название ярлыка.', urlInvalid:'Введите корректный адрес сайта с HTTP или HTTPS.',
      voiceUnavailable:'Голосовой поиск здесь недоступен. Введите запрос или используйте микрофон на обычной странице Google.', listening:'Слушаю…', voiceFailed:'Не удалось распознать речь. Проверьте доступ к микрофону и повторите.',
      weatherFailed:'Не удалось загрузить погоду. Проверьте город и интернет, затем повторите в настройках.', previewWeather:'Актуальная погода доступна после установки расширения. Здесь показан пример.',
      keyboardHint:'Вводите текст здесь или с клавиатуры. Esc закрывает панель.', space:'Пробел', enter:'Найти', shortcutHint:'Нажмите правой кнопкой на ярлык, чтобы изменить его.', retry:'Обновить погоду', cityRequired:'Укажите город для актуальной погоды.'
    }
  };
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
  const validURL = value => {
    try {
      const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && (url.hostname.includes('.') || url.hostname === 'localhost') ? url.href : null;
    } catch { return null; }
  };
  const extensionStorage = typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id && chrome.storage?.local);
  const storage = {
    async get() {
      if (extensionStorage) return chrome.storage.local.get(['settings','shortcuts','weatherCache','backgroundImage','accountAvatar']);
      try { return JSON.parse(localStorage.getItem('hero-google') || '{}'); } catch { return {}; }
    },
    async set(value) {
      if (extensionStorage) return chrome.storage.local.set(value);
      const previous = await this.get();
      localStorage.setItem('hero-google', JSON.stringify({ ...previous, ...value }));
      window.dispatchEvent(new CustomEvent('hg-settings-change',{detail:value}));
    }
  };

  async function mount(root, { assetBase, onGoogle }) {
    const initial = await storage.get();
    let settings = { language:'auto', homepageEnabled:true, resultsEnabled:true, country:'BY', liveWeather:false, city:'Minsk', theme:'dark', aiEnabled:true, ...initial.settings };
    let shortcuts = Array.isArray(initial.shortcuts) ? initial.shortcuts.filter(item => validURL(item.url)).slice(0,8) : structuredClone(DEFAULT_SHORTCUTS);
    let weather = settings.liveWeather && initial.weatherCache?.city === settings.city ? initial.weatherCache : null;
    let backgroundImage = initial.backgroundImage || '';
    let accountAvatar = initial.accountAvatar?.url || '';
    let modals;
    let weatherError = false;
    let destroyed = false;
    let recognition;
    let toastTimer;
    let editingId;
    let previousFocus;
    let keyboardOpen = false;
    let lang;
    let t;
    const surface = document.createElement('div');
    surface.className = 'hg-surface';
    root.append(surface);
    surface.addEventListener('error',event=>{
      if(event.target.matches?.('.account-avatar')) {
        event.target.replaceWith(Object.assign(document.createElement('img'),{src:`${assetBase}assets/icons/user.svg`,className:'icon',alt:''}));
      }
    },true);
    const asset = name => `${assetBase}assets/${name}`;
    const icon = (name, className='') => `<img class="icon ${className}" src="${asset(`icons/${name}.svg`)}" alt="" aria-hidden="true">`;
    const logo = (name, className='') => `<img class="product-icon ${className}" src="${asset(`${name}.svg`)}" alt="" aria-hidden="true">`;
    const button = (action, name, label, className='') => `<button type="button" class="icon-button ${className}" data-action="${action}" aria-label="${escapeHTML(label)}" title="${escapeHTML(label)}">${icon(name === 'apps' ? 'grid-dots' : name)}</button>`;
    const arrow = `<span class="card-arrow">${icon('arrow-right')}</span>`;

    function localize() {
      const hint = onGoogle ? new URL(location.href).searchParams.get('hl') || document.documentElement.lang || navigator.language : navigator.language;
      lang = (settings.language === 'auto' ? hint : settings.language).toLowerCase().startsWith('ru') ? 'ru' : 'en';
      t = COPY[lang];
      surface.lang = lang;
      if (!onGoogle) document.documentElement.lang = lang;
    }

    function weatherCondition(code, day=true) {
      if (code === 0) return { name:t.clear, icon:day ? 'sun-filled' : 'moon-filled', style:day ? 'sun' : '' };
      if (code <= 3) return { name:t.cloudy, icon:code < 3 ? 'cloud-sun' : 'cloud-filled', style:code < 3 ? 'partly' : 'cloud' };
      if ([45,48].includes(code)) return { name:t.fog, icon:'cloud-fog', style:'cloud' };
      if (code >= 95) return { name:t.storm, icon:'cloud-storm', style:'cloud' };
      if ([71,73,75,77,85,86].includes(code)) return { name:t.snow, icon:'cloud-snow', style:'cloud' };
      return { name:t.rain, icon:'cloud-rain', style:'cloud' };
    }

    function weatherMarkup() {
      const live = settings.liveWeather;
      const cache = live ? weather : null;
      const stale = cache && Date.now() - cache.fetchedAt > 30 * 60 * 1000;
      const current = cache?.data.current || { temperature_2m:12, relative_humidity_2m:62, wind_speed_10m:3, weather_code:0, is_day:0 };
      const condition = weatherCondition(current.weather_code, current.is_day);
      const temperature = number => `${number > 0 ? '+' : ''}${Math.round(number)}°`;
      const daily = cache?.data.daily || { time:['2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16'], weather_code:[0,1,2,3,3], temperature_2m_max:[14,16,15,13,12] };
      const unavailable = live && !cache;
      const city = cache?.place || (settings.city.toLowerCase() === 'minsk' ? t.minsk : settings.city);
      return `<div class="weather-top"><span class="weather-orb">${icon(condition.icon, condition.style)}</span><div><h2>${escapeHTML(city)}</h2><p>${unavailable ? '—' : condition.name}</p></div>${button('settings','dots-vertical',t.settings,'weather-menu')}</div>
        <div class="weather-current"><strong>${unavailable ? '—' : temperature(current.temperature_2m)}</strong><p>${t.humidity}: ${unavailable ? '—' : `${Math.round(current.relative_humidity_2m)}%`}<br>${t.wind}: ${unavailable ? '—' : `${Math.round(current.wind_speed_10m)} ${lang === 'ru' ? 'м/с' : 'm/s'}`}</p></div>
        <div class="forecast">${daily.time.map((date,index) => {
          const condition = weatherCondition(daily.weather_code[index]);
          const day = new Intl.DateTimeFormat(lang, { weekday:'short', timeZone:'UTC' }).format(new Date(`${date}T12:00:00Z`)).replace('.','');
          return `<div class="forecast-day"><span>${day}</span>${icon(condition.icon, condition.style)}<span>${unavailable ? '—' : temperature(daily.temperature_2m_max[index])}</span></div>`;
        }).join('')}</div>
        <div class="weather-source">${cache ? `<a href="https://open-meteo.com/" title="${escapeHTML(t.weatherLink)}">Open-Meteo</a><span title="${escapeHTML(new Date(cache.fetchedAt).toLocaleString(lang))}">${stale || weatherError ? t.stale : t.live}</span>` : `<button data-action="settings" title="${escapeHTML(live ? t.weatherFailed : t.sampleInfo)}">${live ? (weatherError ? t.retry : '…') : t.sample}</button>`}</div>`;
    }

    function render() {
      modals?.destroy();
      localize();
      const theme = settings.theme === 'light' || (settings.theme === 'system' && matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
      surface.className = 'hg-surface ' + theme;
      surface.dataset.theme = theme;
      if (!onGoogle) document.documentElement.setAttribute('data-hg-mode',theme);
      surface.style.setProperty('--custom-background', /^data:image\/(png|jpeg|webp|avif);base64,/.test(backgroundImage) ? 'url("' + backgroundImage + '")' : 'none');
      surface.toggleAttribute('data-custom-background',Boolean(backgroundImage));
      const query = surface.querySelector('#search-input')?.value || '';
      surface.innerHTML = `<div class="page">
        <header class="topbar"><nav class="top-left" aria-label="Google"><a href="https://about.google/">${t.about}</a><a href="https://store.google.com/">${t.store}</a><a href="https://ads.google.com/">${t.ads}</a><a href="https://smallbusiness.withgoogle.com/">${t.business}</a></nav><nav class="top-right" aria-label="${escapeHTML(t.apps)}"><a href="https://mail.google.com/">${t.mail}</a><a href="https://www.google.com/imghp?hl=${lang}">${t.images}</a>${button('apps','apps',t.apps,'apps-button')}<a class="account icon-button" href="https://myaccount.google.com/" aria-label="${t.account}" title="${t.account}">${accountAvatar ? `<img class="account-avatar" src="${escapeHTML(accountAvatar)}" referrerpolicy="no-referrer" alt="">` : icon('user')}</a></nav></header>
        <main>
          <section class="hero" aria-label="Google">
            <div class="google-wordmark" role="img" aria-label="Google" style="--google-mask:url('${asset('google.png')}')"></div>
            <div class="search-area"><form id="search-form" class="search-bar" role="search" action="https://www.google.com/search" method="get">${button('search','search',lang === 'ru' ? 'Найти' : 'Search','search-submit')}<input id="search-input" type="text" name="q" value="${escapeHTML(query)}" aria-label="${escapeHTML(t.searchLabel)}" placeholder="${t.search}" autocomplete="off" spellcheck="false"><div class="search-tools">${button('keyboard','keyboard',t.keyboard)}${button('voice','microphone',t.voice)}<a class="icon-button" href="https://lens.google/" title="${t.lens}" aria-label="${t.lens}">${icon('scan')}</a></div></form><div id="keyboard-panel" class="keyboard-panel" hidden></div></div>
            <nav class="shortcuts" aria-label="${escapeHTML(t.shortcutHint)}">${shortcuts.map(item => `<a class="shortcut" href="${escapeHTML(item.url)}" data-shortcut="${escapeHTML(item.id)}" title="${escapeHTML((lang === 'ru' ? item.ru || item.name : item.name) + ' · ' + t.shortcutHint)}"><span class="shortcut-tile">${item.icon && ['youtube','gmail','drive','maps','photos'].includes(item.icon) ? logo(item.icon) : icon('world')}</span><span class="shortcut-label">${escapeHTML(lang === 'ru' ? item.ru || item.name : item.name)}</span></a>`).join('')}${shortcuts.length < 8 ? `<button class="shortcut add-shortcut" data-action="add"><span class="shortcut-tile">${icon('plus')}</span><span class="shortcut-label">${t.add}</span></button>` : ''}</nav>
          </section>
          <section class="dashboard" aria-label="${lang === 'ru' ? 'Откройте больше' : 'Discover more'}">
            <a class="glass-card ai-card" href="https://ai.google/" aria-label="${t.explore}"><span class="eyebrow">GOOGLE</span><h1>${t.aiTitle}</h1><p>${t.aiBody}</p>${arrow}</a>
            <div class="services"><a class="glass-card service-card" href="https://gemini.google.com/"><span class="service-orb">${logo('gemini','gemini-icon')}</span><div><h2>Gemini</h2><p>${t.gemini}</p></div>${arrow}</a><a class="glass-card service-card" href="https://play.google.com/"><span class="service-orb">${logo('play')}</span><div><h2>Google Play</h2><p>${t.play}</p></div>${arrow}</a><a class="glass-card service-card" href="https://one.google.com/"><span class="service-orb one-orb">${icon('cloud-filled')}</span><div><h2>Google One</h2><p>${t.one}</p></div>${arrow}</a></div>
            <section class="glass-card weather-card" aria-label="${t.weather}" id="weather-card">${weatherMarkup()}</section>
          </section>
        </main>
        <footer class="footer"><nav><a href="https://policies.google.com/privacy?hl=${lang}">${t.privacy}</a><a href="https://policies.google.com/terms?hl=${lang}">${t.terms}</a><button data-action="settings">${t.settings}</button></nav><a class="how-link" href="https://www.google.com/search/howsearchworks/">${t.how}</a></footer>
        <div class="apps-popover glass-card" id="apps-menu" hidden><div class="popover-heading"><strong>${t.apps}</strong>${button('apps','x',t.close)}</div><div class="apps-grid">${DEFAULT_SHORTCUTS.map(item => `<a href="${item.url}">${logo(item.icon)}<span>${lang === 'ru' ? item.ru || item.name : item.name}</span></a>`).join('')}<a href="https://gemini.google.com/">${logo('gemini','gemini-icon')}<span>Gemini</span></a></div></div>
        <div id="homepage-modals"></div>
        <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>
      </div>`;
      keyboardOpen = false;
      modals = window.HeroGoogleUI.mountModals(surface.querySelector('#homepage-modals'),{settings,lang,assetBase,backgroundImage,onDelete:deleteShortcut});
    }

    function notify(message) {
      const toast = surface.querySelector('#toast');
      if (!toast || destroyed) return;
      toast.textContent = message;
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
    }

    function showDialog(selector) {
      surface.querySelector('#apps-menu').hidden = true;
      previousFocus = root.activeElement || document.activeElement;
      if(selector === '#settings-dialog') modals.openSettings();
    }

    function closeDialog() {
      modals?.close();
      if (previousFocus?.isConnected && surface.contains(previousFocus)) previousFocus.focus();
    }

    function showShortcut(item) {
      if (!item && shortcuts.length >= 8) return notify(t.maxShortcuts);
      editingId = item?.id;
      previousFocus = root.activeElement || document.activeElement;
      modals.openShortcut(item);
    }

    function search() {
      const value = surface.querySelector('#search-input').value.trim();
      if (!value) { surface.querySelector('#search-input').focus(); return; }
      const looksLikeURL = /^https?:\/\//i.test(value) || /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#][^\s]*)?$/i.test(value);
      const destination = looksLikeURL ? validURL(value) : null;
      const searchURL = new URL('/search', onGoogle ? location.origin : 'https://www.google.com');
      searchURL.search = new URLSearchParams({ q:value, hl:lang, gl:settings.country.toLowerCase() });
      location.assign(destination || searchURL.href);
    }

    async function deleteShortcut() {
      shortcuts = shortcuts.filter(item => item.id !== editingId);
      closeDialog();
      await storage.set({shortcuts});
      render();
      surface.querySelector('[data-action="add"]')?.focus();
      notify(t.deleted);
    }

    function toggleKeyboard() {
      keyboardOpen = !keyboardOpen;
      const panel = surface.querySelector('#keyboard-panel');
      panel.hidden = !keyboardOpen;
      const rows = lang === 'ru' ? ['йцукенгшщзхъ','фывапролджэ','ячсмитьбю'] : ['qwertyuiop','asdfghjkl','zxcvbnm'];
      panel.innerHTML = `<div class="keyboard-heading"><span>${t.keyboard}</span>${button('keyboard','x',t.close)}</div>${['1234567890',...rows].map(row => `<div class="keyboard-row">${[...row].map(key => `<button type="button" data-key="${key}">${key}</button>`).join('')}</div>`).join('')}<div class="keyboard-row"><button type="button" data-key="backspace" aria-label="Backspace">${icon('backspace')}</button><button type="button" class="space-key" data-key=" ">${t.space}</button><button type="button" data-key="enter">${t.enter}</button></div><small>${t.keyboardHint}</small>`;
      surface.querySelector('[data-action="keyboard"]').setAttribute('aria-expanded', String(keyboardOpen));
      surface.querySelector('#search-input').focus();
    }

    function typeKey(key) {
      if (key === 'enter') return search();
      const input = surface.querySelector('#search-input');
      let start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      if (key === 'backspace' && start === end) start = Math.max(0,start-1);
      input.setRangeText(key === 'backspace' ? '' : key, start, end, 'end');
      input.focus();
      input.dispatchEvent(new Event('input', { bubbles:true }));
    }

    function voiceSearch() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return notify(t.voiceUnavailable);
      if (recognition) { recognition.stop(); return; }
      try {
        recognition = new SpeechRecognition();
        recognition.lang = lang === 'ru' ? 'ru-RU' : 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onstart = () => { surface.querySelector('[data-action="voice"]')?.classList.add('listening'); notify(t.listening); };
        recognition.onresult = event => {
          surface.querySelector('#search-input').value = event.results[0][0].transcript;
          surface.querySelector('#search-input').focus();
          surface.querySelector('#toast').hidden = true;
        };
        recognition.onerror = () => notify(t.voiceFailed);
        recognition.onend = () => { recognition = undefined; surface.querySelector('[data-action="voice"]')?.classList.remove('listening'); };
        recognition.start();
      } catch { recognition = undefined; notify(t.voiceUnavailable); }
    }

    async function refreshWeather() {
      if (!settings.liveWeather || destroyed) return;
      if (!extensionStorage) { notify(t.previewWeather); return; }
      try {
        const requestedCity = settings.city;
        const response = await chrome.runtime.sendMessage({ type:'weather', city:requestedCity });
        if (destroyed || !settings.liveWeather || settings.city !== requestedCity) return;
        if (!response?.ok) throw new Error(response?.error || 'Weather unavailable');
        weather = response.data;
        weatherError = false;
      } catch { weatherError = true; notify(t.weatherFailed); }
      const card = surface.querySelector('#weather-card');
      if (card) card.innerHTML = weatherMarkup();
    }

    surface.addEventListener('click', async event => {
      const target = event.target.closest('[data-action], [data-key]');
      if (target?.dataset.key !== undefined && target.closest('#keyboard-panel')) return typeKey(target.dataset.key);
      switch (target?.dataset.action) {
        case 'search': search(); break;
        case 'keyboard': toggleKeyboard(); break;
        case 'voice': voiceSearch(); break;
        case 'apps': {
          const menu = surface.querySelector('#apps-menu');
          menu.hidden = !menu.hidden;
          surface.querySelector('.apps-button').setAttribute('aria-expanded',String(!menu.hidden));
          if (!menu.hidden) menu.querySelector('a').focus();
          break;
        }
        case 'settings': showDialog('#settings-dialog'); break;
        case 'add': showShortcut(); break;
        case 'close': closeDialog(); break;
        case 'delete': break; // HeroUI's onPress handles this action.
      }
    });

    surface.addEventListener('pointerdown', event => {
      if (event.target.closest('[data-key]')) event.preventDefault();
    });
    surface.addEventListener('contextmenu', event => {
      const tile = event.target.closest('[data-shortcut]');
      if (!tile) return;
      event.preventDefault();
      showShortcut(shortcuts.find(item => item.id === tile.dataset.shortcut));
    });
    surface.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        surface.querySelector('#search-input').focus();
      }
      if (event.key === 'Escape') {
        surface.querySelector('#apps-menu').hidden = true;
        if (keyboardOpen) toggleKeyboard();
      }
      if (event.shiftKey && event.key === 'F10') {
        const tile = event.target.closest('[data-shortcut]');
        if (tile) { event.preventDefault(); showShortcut(shortcuts.find(item => item.id === tile.dataset.shortcut)); }
      }
    });

    surface.addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.target;
      if (form.id === 'search-form') return search();
      if (form.id === 'shortcut-form') {
        const name = form.elements.name.value.trim();
        const url = validURL(form.elements.url.value.trim());
        if (!name || !url) { surface.querySelector('#shortcut-error').textContent = !name ? t.nameRequired : t.urlInvalid; return; }
        const previous = shortcuts.find(item => item.id === editingId);
        const item = { id:editingId || crypto.randomUUID(), name, url, ...(previous?.url === url ? { icon:previous.icon } : {}) };
        shortcuts = editingId ? shortcuts.map(shortcut => shortcut.id === editingId ? item : shortcut) : [...shortcuts,item];
        closeDialog();
        await storage.set({ shortcuts });
        render();
        surface.querySelector(`[data-shortcut="${item.id}"]`)?.focus();
        notify(t.saved);
      }
      if (form.id === 'settings-form') {
        const draft = JSON.parse(form.elements.hgSettings.value);
        if (draft.liveWeather && draft.city.trim().length < 2) {
          surface.querySelector('#settings-error').textContent = t.cityRequired;
          return;
        }
        const previousCity = settings.city;
        const latest = await storage.get();
        settings = { ...latest.settings, ...draft, country:draft.country || 'BY', language:draft.language || 'auto', city:draft.city.trim() || 'Minsk' };
        backgroundImage = form.elements.backgroundImage.value;
        if (previousCity !== settings.city || !settings.liveWeather) weather = null;
        closeDialog();
        await storage.set({ settings, backgroundImage });
        if (destroyed) return;
        render();
        surface.querySelector('.footer [data-action="settings"]')?.focus();
        notify(t.saved);
        refreshWeather();
      }
    });

    function documentClick(event) {
      const path = event.composedPath();
      const menu = surface.querySelector('#apps-menu');
      if (menu && !path.includes(menu) && !path.some(node => node?.dataset?.action === 'apps')) menu.hidden = true;
    }
    document.addEventListener('click', documentClick);
    function storageChanged(changes, area) {
      if (area !== 'local' || destroyed) return;
      if (changes.accountAvatar) {accountAvatar = changes.accountAvatar.newValue?.url || '';updateAvatar();}
      if (changes.backgroundImage && changes.backgroundImage.newValue !== backgroundImage) {
        backgroundImage = changes.backgroundImage.newValue || '';render();
      }
      if (changes.settings && JSON.stringify(changes.settings.newValue) !== JSON.stringify(settings)) {
        settings = { ...settings, ...changes.settings.newValue };
        weather = null;
        render();
        refreshWeather();
      }
      if (changes.shortcuts && JSON.stringify(changes.shortcuts.newValue) !== JSON.stringify(shortcuts)) {
        shortcuts = (changes.shortcuts.newValue || DEFAULT_SHORTCUTS).filter(item => validURL(item.url)).slice(0,8);
        render();
      }
    }
    function updateAvatar() {
      const account = surface.querySelector('.account');
      if(account) account.innerHTML = accountAvatar ? '<img class="account-avatar" src="' + escapeHTML(accountAvatar) + '" referrerpolicy="no-referrer" alt="">' : icon('user');
    }
    function avatarChanged(event) {accountAvatar = event.detail.url;updateAvatar();}
    window.addEventListener('hg-avatar',avatarChanged);
    const media = matchMedia('(prefers-color-scheme: light)');
    function systemChanged(){if(settings.theme === 'system') render();}
    media.addEventListener('change',systemChanged);
    if (extensionStorage) chrome.storage.onChanged.addListener(storageChanged);
    function cleanup() {
      destroyed = true;
      clearTimeout(toastTimer);
      recognition?.abort();
      modals?.destroy();
      window.removeEventListener('hg-avatar',avatarChanged);
      media.removeEventListener('change',systemChanged);
      document.removeEventListener('click', documentClick);
      if (extensionStorage) chrome.storage.onChanged.removeListener(storageChanged);
    }
    if (root.host) root.host.addEventListener('hg-unmount', cleanup, { once:true });
    render();
    if (!onGoogle && new URL(location.href).searchParams.get('settings') === '1') showDialog('#settings-dialog');
    refreshWeather();
    return cleanup;
  }
  window.HeroGoogle = { mount };
})();
