import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {HeroUIProvider,Button,Input,Card,CardBody,Popover,PopoverTrigger,PopoverContent,Chip} from '@heroui/react';
import {Modals,resolveTheme} from './controls.jsx';

const DEFAULTS={language:'auto',theme:'dark',homepageProvider:'google',city:'Minsk',country:'BY',liveWeather:false};
const SERVICES=[
  {id:'maps',ru:'Карты',en:'Maps',url:'https://yandex.ru/maps/',icon:'yandex-maps.svg'},
  {id:'market',ru:'Маркет',en:'Market',url:'https://market.yandex.ru/',icon:'yandex-market.png'},
  {id:'mail',ru:'Почта',en:'Mail',url:'https://mail.yandex.ru/',icon:'yandex-mail.ico'},
  {id:'disk',ru:'Диск',en:'Disk',url:'https://disk.yandex.ru/',icon:'yandex-disk.svg'},
  {id:'music',ru:'Музыка',en:'Music',url:'https://music.yandex.ru/',icon:'yandex-music.svg'},
  {id:'kinopoisk',ru:'Кинопоиск',en:'Kinopoisk',url:'https://www.kinopoisk.ru/',icon:'yandex-kinopoisk.svg'},
  {id:'browser',ru:'Браузер',en:'Browser',url:'https://browser.yandex.ru/',icon:'yandex-browser.svg'}
];
const TEXT={
  ru:{search:'Найти',placeholder:'Найдётся всё',searchLabel:'Поиск в Яндексе или адрес сайта',images:'Картинки',video:'Видео',maps:'Карты',market:'Маркет',news:'Новости',translate:'Переводчик',music:'Музыка',more:'Ещё',signin:'Войти',plus:'Яндекс Плюс',apps:'Сервисы Яндекса',add:'Добавить',addShortcut:'Добавить ярлык',edit:'Изменить ярлык',settings:'Настройки страницы',keyboard:'Экранная клавиатура',voice:'Голосовой поиск',visual:'Поиск по картинке',clear:'Ясно',cloudy:'Облачно',rain:'Дождь',snow:'Снег',feels:'Ощущается как',sample:'Пример',savedWeather:'Сохранено',sampleHelp:'Пример прогноза. Включите актуальную погоду в настройках.',liveWeather:'Актуальная погода',weatherFailed:'Не удалось обновить погоду. Проверьте город и соединение в настройках.',main:'Главное',selection:'Подборка',plusBody:'Больше возможностей\nв одной подписке',try:'Попробовать',mail:'Почта',inbox:'Входящие',starred:'Избранное',sent:'Отправленные',drafts:'Черновики',mailSignin:'Войти в почту',close:'Закрыть',save:'Сохранить',nameRequired:'Введите название ярлыка.',urlInvalid:'Введите адрес сайта с HTTP или HTTPS.',cityRequired:'Укажите город для прогноза погоды.',voiceUnavailable:'Голосовой поиск недоступен. Введите запрос с клавиатуры.',listening:'Слушаю…',voiceError:'Не удалось распознать речь. Проверьте доступ к микрофону.',space:'Пробел',shortcutSaved:'Ярлык сохранён',shortcutDeleted:'Ярлык удалён',settingsSaved:'Настройки сохранены',weather:'Погода',help:'Помощь'},
  en:{search:'Search',placeholder:'Find everything',searchLabel:'Search Yandex or enter a website address',images:'Images',video:'Video',maps:'Maps',market:'Market',news:'News',translate:'Translate',music:'Music',more:'More',signin:'Sign in',plus:'Yandex Plus',apps:'Yandex services',add:'Add',addShortcut:'Add a shortcut',edit:'Edit shortcut',settings:'Page settings',keyboard:'On-screen keyboard',voice:'Voice search',visual:'Search by image',clear:'Clear',cloudy:'Cloudy',rain:'Rain',snow:'Snow',feels:'Feels like',sample:'Sample',savedWeather:'Saved',sampleHelp:'Sample forecast. Enable live weather in settings.',liveWeather:'Live weather',weatherFailed:'Could not update weather. Check the city and connection in settings.',main:'Highlights',selection:'Selected topics',plusBody:'More possibilities\nwith one subscription',try:'Explore Plus',mail:'Mail',inbox:'Inbox',starred:'Starred',sent:'Sent',drafts:'Drafts',mailSignin:'Sign in to Mail',close:'Close',save:'Save',nameRequired:'Enter a shortcut name.',urlInvalid:'Enter a valid HTTP or HTTPS website address.',cityRequired:'Enter a city for the forecast.',voiceUnavailable:'Voice search is unavailable. Type your query instead.',listening:'Listening…',voiceError:'Could not recognize speech. Check microphone access.',space:'Space',shortcutSaved:'Shortcut saved',shortcutDeleted:'Shortcut deleted',settingsSaved:'Settings saved',weather:'Weather',help:'Help'}
};
const NEWS=[
  {id:'tech',ru:'Технологии: открытия и идеи, которые меняют мир',en:'Technology: ideas and discoveries changing our world',query:'новости технологий'},
  {id:'world',ru:'Мир сегодня: главные темы и события',en:'Around the world: the stories that matter',query:'мировые новости'},
  {id:'nature',ru:'Наука и природа: удивительное рядом',en:'Science and nature: a world to discover',query:'наука природа открытия'},
  {id:'culture',ru:'Культура и искусство: события и вдохновение',en:'Arts and culture: events and inspiration',query:'культура искусство события'}
];
Object.assign(TEXT.ru,{retryWeather:'Повторить'});
Object.assign(TEXT.en,{retryWeather:'Retry'});
const hasExtension=Boolean(globalThis.chrome?.runtime?.id && chrome.storage?.local);
const store={
  async get(){if(hasExtension)return chrome.storage.local.get(['settings','yandexShortcuts','backgroundImage','weatherCache']);try{return JSON.parse(localStorage.getItem('hero-google') || '{}');}catch{return {}; }},
  async set(value){if(hasExtension)await chrome.storage.local.set(value);else{const previous=await this.get();localStorage.setItem('hero-google',JSON.stringify({...previous,...value}));window.dispatchEvent(new CustomEvent('hg-settings-change',{detail:value}));}}
};
function validURL(value){try{const url=new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);return ['http:','https:'].includes(url.protocol) && !url.username && !url.password && (url.hostname.includes('.') || url.hostname==='localhost') ? url.href : null;}catch{return null;}}
function searchURL(query){const url=new URL('https://ya.ru/search/');url.searchParams.set('text',query);return url.href;}
function Icon({name,assetBase,className=''}){return <img className={`yx-icon ${className}`} src={`${assetBase}assets/icons/${name}.svg`} alt="" aria-hidden="true"/>;}

function YandexPage({initial,assetBase,onYandex=false,previewLanguage}){
  const [settings,setSettings]=useState({...DEFAULTS,...initial.settings});
  const [shortcuts,setShortcuts]=useState(()=>Array.isArray(initial.yandexShortcuts) ? initial.yandexShortcuts.filter(item=>validURL(item.url)).slice(0,8) : SERVICES.map(item=>({...item,name:item.en})));
  const [background,setBackground]=useState(initial.backgroundImage || '');
  const [weather,setWeather]=useState(initial.weatherCache || null);
  const [weatherError,setWeatherError]=useState(false);
  const [weatherAttempt,setWeatherAttempt]=useState(0);
  const [query,setQuery]=useState('');
  const [appsOpen,setAppsOpen]=useState(false);
  const [keyboardOpen,setKeyboardOpen]=useState(false);
  const [notice,setNotice]=useState('');
  const [portal,setPortal]=useState(null);
  const [systemLight,setSystemLight]=useState(matchMedia('(prefers-color-scheme: light)').matches);
  const controller=useRef({});
  const editing=useRef(null);
  const input=useRef(null);
  const recognition=useRef(null);
  const surface=useRef(null);
  const lang=(settings.language==='auto' ? previewLanguage || (onYandex ? document.documentElement.lang : '') || navigator.language : settings.language).toLowerCase().startsWith('en') ? 'en' : 'ru';
  const t=TEXT[lang];
  const theme=settings.theme==='system' ? systemLight ? 'light' : 'dark' : resolveTheme(settings);
  const asset=name=>`${assetBase}assets/${name}`;
  const icon=(name,className='')=><Icon name={name} assetBase={assetBase} className={className}/>;
  const signin='https://passport.yandex.ru/auth?retpath='+encodeURIComponent('https://ya.ru/');
  useEffect(()=>{const media=matchMedia('(prefers-color-scheme: light)');const listener=()=>setSystemLight(media.matches);media.addEventListener('change',listener);return()=>media.removeEventListener('change',listener);},[]);
  useEffect(()=>{if(!onYandex){document.documentElement.lang=lang;document.documentElement.dataset.hgMode=theme;}},[lang,theme,onYandex]);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),5000);return()=>clearTimeout(timer);},[notice]);
  useEffect(()=>{
    const escape=event=>{
      if(event.key!=='Escape' || !surface.current?.querySelector('#settings-form,#shortcut-form') || surface.current.querySelector('[role=listbox]'))return;
      event.preventDefault();event.stopPropagation();controller.current.close?.();
    };
    document.addEventListener('keydown',escape,true);
    return()=>document.removeEventListener('keydown',escape,true);
  },[]);
  useEffect(()=>{
    const changed=(changes,area)=>{
      if(area && area!=='local')return;
      if(changes.settings)setSettings({...DEFAULTS,...changes.settings.newValue});
      if(changes.backgroundImage)setBackground(changes.backgroundImage.newValue || '');
      if(changes.yandexShortcuts)setShortcuts(changes.yandexShortcuts.newValue || SERVICES.map(item=>({...item,name:item.en})));
      if(changes.weatherCache)setWeather(changes.weatherCache.newValue || null);
    };
    const previewChanged=event=>changed(Object.fromEntries(Object.entries(event.detail).map(([key,value])=>[key,{newValue:value}])));
    if(hasExtension)chrome.storage.onChanged.addListener(changed);
    window.addEventListener('hg-settings-change',previewChanged);
    return()=>{if(hasExtension)chrome.storage.onChanged.removeListener(changed);window.removeEventListener('hg-settings-change',previewChanged);recognition.current?.abort();};
  },[]);
  useEffect(()=>{
    if(!hasExtension || !settings.liveWeather)return;
    let active=true;
    setWeatherError(false);
    chrome.runtime.sendMessage({type:'weather',city:settings.city}).then(result=>{if(!active)return;if(result?.ok){setWeather(result.data);setWeatherError(false);}else setWeatherError(true);}).catch(()=>{if(active)setWeatherError(true);});
    return()=>{active=false;};
  },[settings.liveWeather,settings.city,weatherAttempt]);
  useEffect(()=>{if(!onYandex && new URL(location.href).searchParams.get('settings')==='1' && portal)controller.current.openSettings?.();},[portal,onYandex]);
  function submitSearch(event){event?.preventDefault();event?.stopPropagation();const value=query.trim();if(!value){input.current?.focus();return;}const isAddress=/^https?:\/\//i.test(value) || /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#][^\s]*)?$/i.test(value);location.assign(isAddress && validURL(value) || searchURL(value));}
  function editShortcut(item){editing.current=item?.id || null;setAppsOpen(false);controller.current.openShortcut?.(item);}
  async function deleteShortcut(){const next=shortcuts.filter(item=>item.id!==editing.current);controller.current.close();setShortcuts(next);await store.set({yandexShortcuts:next});setNotice(t.shortcutDeleted);}
  async function modalSubmit(event){
    const form=event.target;if(!['settings-form','shortcut-form'].includes(form.id))return;event.preventDefault();event.stopPropagation();
    if(form.id==='shortcut-form'){
      const name=form.elements.name.value.trim();const url=validURL(form.elements.url.value.trim());
      if(!name || !url){form.querySelector('#shortcut-error').textContent=!name ? t.nameRequired : t.urlInvalid;return;}
      const old=shortcuts.find(item=>item.id===editing.current);
      const item={id:editing.current || crypto.randomUUID(),name,url,...(old?.url===url ? {icon:old.icon} : {})};
      const next=editing.current ? shortcuts.map(shortcut=>shortcut.id===editing.current ? item : shortcut) : [...shortcuts,item].slice(0,8);
      controller.current.close();setShortcuts(next);await store.set({yandexShortcuts:next});setNotice(t.shortcutSaved);
    }else{
      const draft=JSON.parse(form.elements.hgSettings.value);
      if(draft.liveWeather && draft.city.trim().length<2){form.querySelector('#settings-error').textContent=t.cityRequired;return;}
      const backgroundImage=form.elements.backgroundImage.value;
      const latest=await store.get();const next={...latest.settings,...draft};
      controller.current.close();setSettings({...DEFAULTS,...next});setBackground(backgroundImage);await store.set({settings:next,backgroundImage});setNotice(t.settingsSaved);
    }
  }
  function voice(){const Speech=window.SpeechRecognition || window.webkitSpeechRecognition;if(!Speech){setNotice(t.voiceUnavailable);return;}recognition.current?.abort();const instance=new Speech();recognition.current=instance;instance.lang=lang==='ru' ? 'ru-RU' : 'en-US';instance.interimResults=false;instance.onresult=event=>{setQuery(event.results[0][0].transcript);setNotice('');input.current?.focus();};instance.onerror=()=>setNotice(t.voiceError);instance.onend=()=>setNotice(value=>value===t.listening ? '' : value);try{instance.start();setNotice(t.listening);}catch{setNotice(t.voiceUnavailable);}}
  const live=settings.liveWeather && weather?.city===settings.city ? weather : null;
  const current=live?.data.current;
  const unavailable=settings.liveWeather && !live;
  const degree=value=>`${value>0 ? '+' : ''}${Math.round(value)}°`;
  const condition=code=>code===0 ? t.clear : code<4 ? t.cloudy : [71,73,75,77,85,86].includes(code) ? t.snow : t.rain;
  const weatherIcon=(code,day=true)=>code===0 ? day ? 'sun-filled' : 'moon-filled' : code<3 ? 'cloud-sun' : code<5 ? 'cloud-filled' : code>70 && code<90 ? 'cloud-snow' : 'cloud-rain';
  let forecast=[{label:'10:00',temp:11,icon:'sun-filled'},{label:'11:00',temp:12,icon:'moon-filled'},{label:'12:00',temp:13,icon:'sun-filled'},{label:'13:00',temp:14,icon:'cloud-sun'},{label:'14:00',temp:14,icon:'cloud-sun'}];
  if(live?.data.hourly){const hourly=live.data.hourly;const start=Math.max(0,hourly.time.findIndex(time=>time>=(current.time || '').slice(0,13)+':00'));forecast=hourly.time.slice(start,start+5).map((time,index)=>({label:time.slice(11,16),temp:hourly.temperature_2m[start+index],icon:weatherIcon(hourly.weather_code[start+index],hourly.is_day?.[start+index]!==0)}));}
  else if(live?.data.daily)forecast=live.data.daily.time.map((time,index)=>({label:new Intl.DateTimeFormat(lang,{weekday:'short',timeZone:'UTC'}).format(new Date(time+'T12:00:00Z')),temp:live.data.daily.temperature_2m_max[index],icon:weatherIcon(live.data.daily.weather_code[index])}));
  const safeBackground=/^data:image\/(png|jpeg|webp|avif);base64,/.test(background) ? background : '';
  return <HeroUIProvider disableAnimation={matchMedia('(prefers-reduced-motion: reduce)').matches}><div ref={surface} className={`${theme} yx-surface`} lang={lang} data-theme={theme} data-custom-background={Boolean(safeBackground)} style={safeBackground ? {'--yx-custom-background':`url("${safeBackground}")`} : undefined} onSubmit={modalSubmit} onKeyDown={event=>{if((event.ctrlKey || event.metaKey) && event.key==='k' && !surface.current.querySelector('[role=dialog]')){event.preventDefault();input.current?.focus();}}}>
    <div className="yx-page">
      <header className="yx-topbar">
        <a className="yx-brand-mark" href="https://ya.ru/" aria-label="Яндекс"><img src={asset('yandex-mark.png')} alt=""/></a>
        <nav className="yx-navigation" aria-label={lang==='ru' ? 'Навигация Яндекса' : 'Yandex navigation'}>
          {[['Поиск','Search','https://ya.ru/'],[t.images,t.images,'https://yandex.ru/images/'],[t.video,t.video,'https://yandex.ru/video/'],[t.maps,t.maps,'https://yandex.ru/maps/'],[t.market,t.market,'https://market.yandex.ru/'],[t.news,t.news,'https://dzen.ru/news/'],[t.translate,t.translate,'https://translate.yandex.ru/'],[t.music,t.music,'https://music.yandex.ru/']].map(([ru,en,url])=><a key={url} href={url}>{lang==='ru' ? ru : en}</a>)}
          <Popover placement="bottom-start" portalContainer={portal || undefined} classNames={{content:'yx-popover'}}><PopoverTrigger><Button className="yx-nav-more" endContent={icon('chevron-down')}>{t.more}</Button></PopoverTrigger><PopoverContent><div className="yx-more-menu"><a href="https://rasp.yandex.ru/">{lang==='ru' ? 'Расписания' : 'Timetables'}</a><a href="https://travel.yandex.ru/">{lang==='ru' ? 'Путешествия' : 'Travel'}</a><a href="https://yandex.ru/pogoda/">{t.weather}</a><Button className="yx-settings-link" onPress={()=>controller.current.openSettings?.()}>{t.settings}</Button></div></PopoverContent></Popover>
        </nav>
        <div className="yx-account-actions">
          <Popover isOpen={appsOpen} onOpenChange={setAppsOpen} placement="bottom-end" portalContainer={portal || undefined} classNames={{content:'yx-popover'}}><PopoverTrigger><Button className="yx-apps-button" isIconOnly aria-label={t.apps}>{icon('grid-dots')}</Button></PopoverTrigger><PopoverContent><div className="yx-apps-menu"><h2>{t.apps}</h2><div className="yx-apps-grid">{SERVICES.map(item=><a key={item.id} href={item.url}><img src={asset(item.icon)} alt=""/><span>{item[lang]}</span></a>)}</div><Button className="yx-settings-link" onPress={()=>{setAppsOpen(false);controller.current.openSettings?.();}} startContent={icon('settings')}>{t.settings}</Button></div></PopoverContent></Popover>
          <Button as="a" href={signin} className="yx-signin">{t.signin}</Button>
          <Button as="a" href="https://plus.yandex.ru/" className="yx-plus-header" startContent={icon('crown-filled')}>{t.plus}</Button>
        </div>
      </header>
      <main>
        <section className="yx-hero" aria-label="Яндекс">
          <a className="yx-wordmark" href="https://ya.ru/" aria-label="Яндекс"><span className="yx-wordmark-image" style={{'--yx-wordmark':`url("${asset('yandex-wordmark.svg')}")`}}/><span className="yx-wordmark-first" style={{'--yx-wordmark':`url("${asset('yandex-wordmark.svg')}")`}}/></a>
          <form className="yx-search-form" role="search" onSubmit={submitSearch} action="https://ya.ru/search/">
            <Input ref={input} id="yandex-search-input" name="text" value={query} onValueChange={setQuery} placeholder={t.placeholder} aria-label={t.searchLabel} autoComplete="off" spellCheck="false" startContent={icon('search')} classNames={{base:'yx-search-input',inputWrapper:'yx-search-input-wrapper',innerWrapper:'yx-search-inner',input:'yx-input'}} endContent={<div className="yx-search-tools">
              <Popover isOpen={keyboardOpen} onOpenChange={setKeyboardOpen} placement="bottom" portalContainer={portal || undefined} classNames={{content:'yx-popover yx-keyboard-popover'}}><PopoverTrigger><Button isIconOnly className="yx-tool" aria-label={t.keyboard}>{icon('keyboard')}</Button></PopoverTrigger><PopoverContent><div className="yx-keyboard"><div className="yx-keyboard-heading"><span>{t.keyboard}</span><Button isIconOnly className="yx-tool" onPress={()=>setKeyboardOpen(false)} aria-label={t.close}>{icon('x')}</Button></div>{(lang==='ru' ? ['йцукенгшщзх','фывапролджэ','ячсмитьбю'] : ['qwertyuiop','asdfghjkl','zxcvbnm']).map(row=><div className="yx-keyboard-row" key={row}>{[...row].map(key=><Button key={key} className="yx-key" data-key={key} onPress={()=>setQuery(previous=>previous+key)}>{key}</Button>)}</div>)}<div className="yx-keyboard-row"><Button className="yx-key yx-space" onPress={()=>setQuery(previous=>previous+' ')}>{t.space}</Button><Button className="yx-key" aria-label="Backspace" onPress={()=>setQuery(previous=>previous.slice(0,-1))}>{icon('backspace')}</Button><Button className="yx-key" onPress={()=>{setKeyboardOpen(false);submitSearch();}}>{t.search}</Button></div></div></PopoverContent></Popover>
              <Button className="yx-tool" isIconOnly onPress={voice} aria-label={t.voice}>{icon('microphone')}</Button>
              <Button className="yx-tool" isIconOnly as="a" href="https://yandex.ru/images/" aria-label={t.visual}>{icon('scan')}</Button>
            </div>}/>
            <Button type="submit" className="yx-search-submit">{t.search}</Button>
          </form>
          <nav className="yx-shortcuts" aria-label={t.apps}>{shortcuts.map(item=><a key={item.id} className="yx-shortcut" href={item.url} data-shortcut={item.id} title={lang==='ru' ? 'Правая кнопка мыши — изменить ярлык' : 'Right-click to edit shortcut'} onContextMenu={event=>{event.preventDefault();editShortcut(item);}} onKeyDown={event=>{if(event.shiftKey && event.key==='F10'){event.preventDefault();editShortcut(item);}}}><span className="yx-shortcut-tile">{item.icon ? <img src={asset(item.icon)} alt=""/> : icon('world')}</span><span>{item[lang] || item.name}</span></a>)}{shortcuts.length<8 && <Button className="yx-shortcut yx-add-shortcut" onPress={()=>editShortcut()} aria-label={t.addShortcut}><span className="yx-shortcut-tile">{icon('plus')}</span><span>{t.add}</span></Button>}</nav>
        </section>
        <section className="yx-dashboard" aria-label={lang==='ru' ? 'Сервисы и информация' : 'Services and information'}>
          <Card className="yx-card yx-weather-card" shadow="none"><CardBody className="yx-card-body">
            <div className="yx-weather-top"><img className="yx-weather-art" src={asset('yandex-weather.svg')} alt=""/><strong>{unavailable ? '—' : degree(current?.temperature_2m ?? 12)}</strong><div><p>{unavailable ? '—' : condition(current?.weather_code ?? 0)}</p><small>{current ? live.place || settings.city : unavailable ? settings.city : t.feels+' +10°'}</small></div></div>
            <div className="yx-forecast">{forecast.map((hour,index)=><div className="yx-forecast-hour" key={index}><span>{hour.label}</span>{icon(hour.icon,hour.icon==='sun-filled' ? 'yx-sun' : '')}<span>{unavailable ? '—' : degree(hour.temp)}</span></div>)}</div>
            <div className="yx-weather-source">{live ? <a href="https://open-meteo.com/">Open-Meteo · {weatherError ? t.savedWeather : t.liveWeather}</a> : <Button className="yx-sample-button" onPress={()=>weatherError ? setWeatherAttempt(value=>value+1) : controller.current.openSettings?.()} title={weatherError ? t.weatherFailed : t.sampleHelp}>{weatherError ? t.retryWeather : t.sample}</Button>}</div>
          </CardBody></Card>
          <Card className="yx-card yx-news-card" shadow="none"><CardBody className="yx-card-body"><div className="yx-card-heading"><a href="https://dzen.ru/news/">{t.main}{icon('chevron-right')}</a><Chip className="yx-example-chip" size="sm" variant="flat">{t.selection}</Chip></div><div className="yx-news-list">{NEWS.map(item=><a key={item.id} href={searchURL(item.query)}><img src={asset(`yandex-news-${item.id}.jpg`)} alt=""/><span>{item[lang]}</span></a>)}</div></CardBody></Card>
          <Card className="yx-card yx-plus-card" shadow="none"><CardBody className="yx-card-body"><div className="yx-card-heading"><a href="https://plus.yandex.ru/">{t.plus}{icon('chevron-right')}</a></div><p>{t.plusBody}</p><img className="yx-plus-art" src={asset('yandex-plus.png')} alt=""/><Button as="a" className="yx-plus-try" href="https://plus.yandex.ru/">{t.try}</Button></CardBody></Card>
          <Card className="yx-card yx-mail-card" shadow="none"><CardBody className="yx-card-body"><div className="yx-card-heading"><a href="https://mail.yandex.ru/">{t.mail}{icon('chevron-right')}</a></div><div className="yx-mail-folders">{[['inbox','#inbox','yx-inbox'],['starred','#label/1','yx-starred'],['sent','#sent','yx-sent'],['drafts','#draft','yx-drafts']].map(([name,hash,color])=><a key={name} href={'https://mail.yandex.ru/'+hash}><span className={`yx-folder-dot ${color}`}/>{t[name]}</a>)}</div><Button as="a" href="https://mail.yandex.ru/" className="yx-mail-signin">{t.mailSignin}</Button></CardBody></Card>
        </section>
      </main>
      <footer className="yx-footer"><a href="https://yandex.ru/support/">{t.help}</a><Button className="yx-footer-settings" onPress={()=>controller.current.openSettings?.()} startContent={icon('settings')}>{t.settings}</Button></footer>
      {notice && <div className="yx-toast" role="status">{notice}</div>}
      <div ref={setPortal} className="yx-portals"/>
      {portal && <Modals settings={settings} lang={lang} assetBase={assetBase} backgroundImage={background} container={portal} controller={controller.current} onDelete={deleteShortcut}/>}
    </div>
  </div></HeroUIProvider>;
}

async function mount(container,options){
  const initial=await store.get();
  const font=new FontFace('Inter',`url(${options.assetBase}assets/fonts/Inter.ttf)`,{weight:'100 900'});document.fonts.add(font);font.load().catch(()=>{});
  const root=createRoot(container);flushSync(()=>root.render(<YandexPage initial={initial} {...options}/>));
  return()=>root.unmount();
}
window.YandexGlass={mount};
