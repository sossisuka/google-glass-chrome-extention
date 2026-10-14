import React, {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {HeroUIProvider,Input,Button,Card,Tabs,Tab,Dropdown,DropdownTrigger,DropdownMenu,DropdownItem} from '@heroui/react';

const data=[
  {id:'glusk',site:'glusk.gov.by',path:'https://glusk.gov.by',url:'https://glusk.gov.by/',title:'Глусский районный исполнительный комитет',description:'Официальный сайт Глусского районного исполнительного комитета. Новости, экономика, социальная сфера, обращения граждан, контакты.',chips:['Новости','Район','Власть','Обращения граждан','Контакты']},
  {id:'wiki',site:'Википедия',path:'https://ru.wikipedia.org › Глуск',url:'https://ru.wikipedia.org/wiki/Глуск',title:'Глуск — Википедия',description:'Глуск — город в Могилёвской области Беларуси, административный центр Глусского района. Расположен на реке Сож. Население — около 13 тыс. человек.',chips:['История','Население','Экономика','Достопримечательности','Известные люди']},
  {id:'niva',site:'Наша Ніва',path:'https://nashaniva.com › glusk',url:'https://nashaniva.com/?c=search&q=Глуск',title:'Глуск: история, достопримечательности, жизнь города',description:'Материалы о Глуске: история, культура, памятники, интервью с жителями, фоторепортажи и последние новости.'},
  {id:'maps',site:'Яндекс Карты',path:'https://yandex.by › maps › glusk',url:'https://yandex.by/maps/?text=Глуск',title:'Глуск — Яндекс Карты',description:'Глуск на карте: улицы, организации, маршруты, панорамы.',extra:'Стройте маршруты и находите нужные места.'}
];

function ResultsPreview({assetBase}) {
  const [query,setQuery]=useState('Глуск');
  const [country,setCountry]=useState('BY');
  const [searchLanguage,setSearchLanguage]=useState('ru');
  const [keyboard,setKeyboard]=useState(false);
  const [apps,setApps]=useState(false);
  const [notice,setNotice]=useState('');
  const [saved,setSaved]=useState(localStorage.getItem('hg-saved-glusk')==='true');
  const dialog=useRef(null);
  const settingsMount=useRef(null);
  const settingsCleanup=useRef(null);
  const inputRef=useRef(null);
  const icon=(name,className='')=><img className={`results-icon ${className}`} src={`${assetBase}assets/icons/${name}.svg`} alt="" aria-hidden="true"/>;
  const searchURL=(params={})=>{const url=new URL('https://www.google.com/search');url.search=new URLSearchParams({q:query.trim() || 'Глуск',hl:searchLanguage,gl:country.toLowerCase(),...params});return url.href;};
  function search(event) {event?.preventDefault();if(!query.trim()){inputRef.current?.focus();return;}location.assign(searchURL());}
  function voice() {
    const Recognition=window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!Recognition){setNotice('Голосовой ввод недоступен в этом браузере. Введите запрос с клавиатуры.');return;}
    const recognition=new Recognition();recognition.lang='ru-RU';
    recognition.onresult=event=>{setQuery(event.results[0][0].transcript);setNotice('');inputRef.current?.focus();};
    recognition.onerror=()=>setNotice('Проверьте доступ к микрофону и повторите.');
    recognition.onstart=()=>setNotice('Слушаю…');recognition.start();
  }
  async function openSettings() {
    const installed=typeof chrome!=='undefined' && chrome.runtime?.id;
    const settings=installed ? (await chrome.storage.local.get('settings')).settings || {} : JSON.parse(localStorage.getItem('hero-google') || '{}').settings || {};
    settingsCleanup.current?.();
    settingsCleanup.current=window.HeroGoogleUI.mountSelectors(settingsMount.current,{assetBase,settings,lang:'ru'});
    dialog.current.showModal();
  }
  async function saveSettings(event) {
    event.preventDefault();
    const form=event.target;
    const installed=typeof chrome!=='undefined' && chrome.runtime?.id;
    if(installed){const {settings={}}=await chrome.storage.local.get('settings');await chrome.storage.local.set({settings:{...settings,country:form.elements.country.value,language:form.elements.language.value}});}
    else {const stored=JSON.parse(localStorage.getItem('hero-google') || '{}');localStorage.setItem('hero-google',JSON.stringify({...stored,settings:{...stored.settings,country:form.elements.country.value,language:form.elements.language.value}}));}
    setCountry(form.elements.country.value);
    setSearchLanguage(form.elements.language.value==='en'?'en':'ru');
    dialog.current.close();setNotice('Настройки сохранены. Регион будет использован в следующем поиске.');
  }
  useEffect(()=>{
    const installed=typeof chrome!=='undefined' && chrome.runtime?.id;
    const apply=settings=>{setCountry(settings?.country || 'BY');setSearchLanguage(settings?.language==='en'?'en':'ru');};
    if(installed)chrome.storage.local.get('settings').then(({settings})=>apply(settings));
    else{try{apply(JSON.parse(localStorage.getItem('hero-google') || '{}').settings);}catch{}}
    const listener=(changes,area)=>{if(area==='local' && changes.settings)apply(changes.settings.newValue);};
    if(installed)chrome.storage.onChanged.addListener(listener);
    return()=>{settingsCleanup.current?.();if(installed)chrome.storage.onChanged.removeListener(listener);};
  },[]);
  const tabs=[['all','Все',{}],['images','Картинки',{udm:'2'}],['maps','Карты',{}],['news','Новости',{tbm:'nws'}],['video','Видео',{udm:'7'}],['shopping','Покупки',{udm:'28'}],['books','Книги',{tbm:'bks'}]];
  return <HeroUIProvider disableAnimation><div className="dark results-preview">
    <header className="results-header"><a className="results-google" href="newtab.html" aria-label="Главная Google"><img src={`${assetBase}assets/google.png`} alt="Google"/></a>
      <form className="results-search" onSubmit={search}><Input ref={inputRef} name="q" aria-label="Поиск в Google" value={query} onValueChange={setQuery} classNames={{base:'results-input',inputWrapper:'results-input-wrapper',innerWrapper:'results-input-inner',input:'results-input-text'}} endContent={<div className="results-search-tools"><Button type="button" isIconOnly disableRipple aria-label="Очистить запрос" onPress={()=>{setQuery('');inputRef.current?.focus();}}>{icon('x')}</Button><span className="search-tool-divider"/><Button type="button" isIconOnly disableRipple aria-label="Экранная клавиатура" onPress={()=>setKeyboard(!keyboard)}>{icon('keyboard')}</Button><Button type="button" isIconOnly disableRipple aria-label="Голосовой поиск" onPress={voice}>{icon('microphone')}</Button><Button as="a" href="https://lens.google/" isIconOnly disableRipple aria-label="Google Объектив">{icon('scan')}</Button><Button type="submit" isIconOnly disableRipple aria-label="Найти">{icon('search')}</Button></div>}/></form>
      <div className="results-account"><Button type="button" isIconOnly disableRipple aria-label="Приложения Google" onPress={()=>setApps(!apps)}>{icon('grid-dots')}</Button><Button as="a" href="https://myaccount.google.com/" isIconOnly className="results-avatar" aria-label="Аккаунт Google">{icon('user')}</Button></div>
    </header>
    {keyboard && <div className="results-keyboard"><span>Экранная клавиатура</span><Button isIconOnly aria-label="Закрыть клавиатуру" onPress={()=>setKeyboard(false)}>{icon('x')}</Button><div>{[...'йцукенгшщзхъфывапролджэячсмитьбю'].map(key=><Button key={key} onPress={()=>setQuery(query+key)}>{key}</Button>)}<Button onPress={()=>setQuery(query.slice(0,-1))}>Удалить</Button><Button onPress={()=>setQuery(query+' ')}>Пробел</Button></div></div>}
    {apps && <Card className="results-apps"><a href="https://mail.google.com/">Gmail</a><a href="https://maps.google.com/">Карты</a><a href="https://www.youtube.com/">YouTube</a><a href="https://drive.google.com/">Диск</a></Card>}
    <div className="results-tabs-row"><Tabs aria-label="Тип результатов" selectedKey="all" onSelectionChange={key=>{const tab=tabs.find(item=>item[0]===key);if(key==='maps')location.assign(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);else if(tab && key!=='all')location.assign(searchURL(tab[2]));}} classNames={{base:'results-tabs',tabList:'results-tab-list',tab:'results-tab',cursor:'results-tab-cursor',tabContent:'results-tab-label'}}>{tabs.map(([key,label])=><Tab key={key} title={label}/>)}</Tabs><Dropdown placement="bottom-start" classNames={{content:'results-more-menu'}}><DropdownTrigger><Button className="results-more-button" endContent={icon('chevron-down')}>Ещё</Button></DropdownTrigger><DropdownMenu aria-label="Другие типы поиска"><DropdownItem key="web" href={searchURL({udm:'14'})}>Веб</DropdownItem><DropdownItem key="forums" href={searchURL({udm:'18'})}>Форумы</DropdownItem><DropdownItem key="finance" href="https://www.google.com/finance/">Финансы</DropdownItem></DropdownMenu></Dropdown><Button className="results-tools-button" onPress={openSettings} endContent={icon('chevron-down')}>Инструменты</Button></div>
    <main className="results-columns"><section className="results-left" aria-label="Результаты поиска"><p className="results-stats">Результатов: примерно 1 230 000 (0,32 сек.)</p>{data.map(result=><article className={`search-result ${result.chips?'':'result-without-sitelinks'}`} key={result.id}><a className="result-site" href={result.url}><img className="site-favicon" src={`${assetBase}assets/results-${result.id}.png`} alt=""/><div><span className="result-site-name">{result.site}</span><span className="result-path">{result.path}</span></div><span className="result-more">{icon('dots-vertical')}</span></a><h2><a href={result.url}>{result.title}</a></h2><p>{result.description}{result.extra && <><br/>{result.extra}</>}</p>{result.chips && <div className="result-sitelinks">{result.chips.map(chip=><Button key={chip} as="a" href={searchURL({q:`Глуск ${chip} site:${result.id==='wiki'?'ru.wikipedia.org':'glusk.gov.by'}`})} size="sm" disableRipple>{chip}</Button>)}</div>}</article>)}</section>
      <Card className="knowledge-card"><a className="knowledge-collage" href={searchURL({udm:'2'})} aria-label="Посмотреть фотографии Глуска"><img src={`${assetBase}assets/glusk-collage.png`} alt="Церковь у реки, карта Глуска и городская площадь"/></a><div className="knowledge-content"><div className="knowledge-heading"><div><h1>Глуск</h1><p>Город в Беларуси</p></div><Button isIconOnly className="knowledge-share" aria-label="Поделиться" onPress={async()=>{try{await navigator.clipboard.writeText('https://ru.wikipedia.org/wiki/Глуск');setNotice('Ссылка скопирована.');}catch{setNotice('https://ru.wikipedia.org/wiki/Глуск');}}}>{icon('share')}</Button></div><div className="knowledge-description"><p>Глуск — город в Могилёвской области Республики Беларусь, административный центр Глусского района. Расположен на реке Сож. Население — около 13 тысяч человек.</p><a href="https://ru.wikipedia.org/wiki/Глуск">Википедия ›</a></div><dl className="knowledge-facts"><div><dt>Население:</dt><dd>13 059 (2024)</dd></div><div><dt>Область:</dt><dd><a href="https://ru.wikipedia.org/wiki/Могилёвская_область">Могилёвская область</a></dd></div><div><dt>Район:</dt><dd><a href="https://ru.wikipedia.org/wiki/Глусский_район">Глусский район</a></dd></div><div><dt>Основан:</dt><dd>XVI век</dd></div><div><dt>Часовой пояс:</dt><dd>UTC+3 (MSK)</dd></div><div><dt>Телефонный код:</dt><dd>+375 2330</dd></div><div><dt>Почтовый индекс:</dt><dd>213879</dd></div></dl><div className="knowledge-actions"><Button as="a" href="https://www.google.com/maps/dir/?api=1&destination=Glusk%2C+Belarus"><span>{icon('route')}</span>Маршрут</Button><Button onPress={()=>{setSaved(!saved);localStorage.setItem('hg-saved-glusk',String(!saved));}} aria-pressed={saved}><span>{icon(saved?'check':'bookmark')}</span>{saved?'Сохранено':'Сохранить'}</Button><Button as="a" href="https://www.google.com/maps/search/?api=1&query=Glusk+Belarus"><span>{icon('map-pin')}</span>Искать рядом</Button><Button as="a" href="https://maps.google.com/?q=Glusk+Belarus"><span>{icon('device-mobile')}</span>Отправить<br/>на телефон</Button></div></div></Card>
    </main>
    <footer className="results-demo-note">Предпросмотр по референсу · <button onClick={openSettings}>Настройки</button> · <a href={searchURL()}>Открыть настоящий поиск Google</a></footer>
    <dialog className="results-settings-dialog" ref={dialog}><form onSubmit={saveSettings}><div className="results-settings-heading"><h2>Настройки поиска</h2><Button type="button" isIconOnly aria-label="Закрыть" onPress={()=>dialog.current.close()}>{icon('x')}</Button></div><div ref={settingsMount}/><Button type="submit" className="results-settings-save">Сохранить</Button></form></dialog>
    {notice && <div className="results-notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Закрыть сообщение">{icon('x')}</button></div>}
  </div></HeroUIProvider>;
}

export function mountResultsPreview(container,options) {const root=createRoot(container);root.render(<ResultsPreview {...options}/>);return()=>root.unmount();}
