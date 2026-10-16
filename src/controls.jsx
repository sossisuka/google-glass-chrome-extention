import React, {useState, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {HeroUIProvider, Button, Input, Switch, Tabs, Tab, RadioGroup, Radio, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Chip} from '@heroui/react';
import {Selectors} from './search-selectors.jsx';

const copy = {
  en:{title:'Make it yours',subtitle:'Small details. Your space.',appearance:'Appearance',sites:'Sites',search:'Search',theme:'Color theme',dark:'Dark',light:'Light',system:'System',background:'Your background',upload:'Upload image',reset:'Remove image',backgroundHelp:'For the Google homepage and New Tab. JPG, PNG, WebP or AVIF, up to 8 MB. Saved on this device.',uploadError:'Choose a supported image under 8 MB.',decodeError:'This image could not be opened. Try another file.',siteHelp:'Choose where Google Glass is applied.',google:'Google',youtube:'YouTube',gmail:'Gmail',homepage:'Google homepage',results:'Search results',ai:'AI Mode',weather:'Live weather',city:'City',weatherHelp:'Open-Meteo receives your city and IP address when enabled.',regionHelp:'Country applies to your next Google search.',save:'Save changes',cancel:'Cancel',close:'Close',newtab:'Open new tab',settings:'Page settings',name:'Name',url:'Website URL',urlHelp:'Use an HTTP or HTTPS address.',add:'Add a shortcut',edit:'Edit shortcut',remove:'Delete shortcut',saved:'Saved',saving:'Saving…',saveError:'Could not save. Try again.'},
  ru:{title:'Ваше пространство',subtitle:'Детали, которые делают его вашим.',appearance:'Оформление',sites:'Сайты',search:'Поиск',theme:'Цветовая тема',dark:'Тёмная',light:'Светлая',system:'Системная',background:'Ваш фон',upload:'Загрузить изображение',reset:'Удалить изображение',backgroundHelp:'Для главной Google и новой вкладки. JPG, PNG, WebP или AVIF до 8 МБ. Хранится на этом устройстве.',uploadError:'Выберите подходящее изображение до 8 МБ.',decodeError:'Не удалось открыть изображение. Попробуйте другой файл.',siteHelp:'Выберите, где применять Google Glass.',google:'Google',youtube:'YouTube',gmail:'Gmail',homepage:'Главная Google',results:'Результаты поиска',ai:'Режим ИИ',weather:'Актуальная погода',city:'Город',weatherHelp:'Если включено, Open-Meteo получает название города и ваш IP-адрес.',regionHelp:'Страна применяется к следующему поиску Google.',save:'Сохранить',cancel:'Отмена',close:'Закрыть',newtab:'Открыть новую вкладку',settings:'Настройки страницы',name:'Название',url:'Адрес сайта',urlHelp:'Используйте адрес HTTP или HTTPS.',add:'Добавить ярлык',edit:'Изменить ярлык',remove:'Удалить ярлык',saved:'Сохранено',saving:'Сохранение…',saveError:'Не удалось сохранить. Попробуйте снова.'}
};
Object.assign(copy.en,{homepageProvider:'New tab homepage',yandex:'Yandex',translate:'Translate',backgroundHelp:'For Google, Yandex, Translate and New Tab. JPG, PNG, WebP or AVIF, up to 8 MB. Saved on this device.'});
Object.assign(copy.ru,{homepageProvider:'Главная новой вкладки',yandex:'Яндекс',translate:'Переводчик',backgroundHelp:'Для Google, Яндекса, Переводчика и новой вкладки. JPG, PNG, WebP или AVIF до 8 МБ. Хранится на этом устройстве.'});
export const resolveTheme = settings => settings.theme === 'light' || (settings.theme === 'system' && matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
const inputClasses = {base:'hg-field',inputWrapper:'hg-field-wrapper',input:'hg-field-input',label:'hg-field-label'};
const modalClasses = {wrapper:'hg-modal-wrapper',backdrop:'hg-modal-backdrop',base:'hg-modal',header:'hg-modal-header',body:'hg-modal-body',footer:'hg-modal-footer',closeButton:'hg-modal-close'};
const modalMotion = {variants:{enter:{opacity:1,y:0,scale:1,transition:{duration:.2,ease:'easeOut'}},exit:{opacity:0,y:8,scale:.98,transition:{duration:.15}}}};
const roots = new WeakMap();

async function prepareImage(file) {
  if(!file || !['image/png','image/jpeg','image/webp','image/avif'].includes(file.type) || file.size > 8*1024*1024) throw new Error('type');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1,2560/Math.max(bitmap.width,bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1,Math.round(bitmap.width*scale));
    canvas.height = Math.max(1,Math.round(bitmap.height*scale));
    canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
    const data = canvas.toDataURL('image/webp',.86);
    if(data.length > 3*1024*1024) throw new Error('size');
    return data;
  } finally {bitmap.close();}
}

function Fields({initial,lang,assetBase,backgroundImage='',onChange,onBackground,onBusy,popup=false}) {
  const [draft,setDraft] = useState(()=>({theme:'dark',homepageProvider:'google',homepageEnabled:true,resultsEnabled:true,aiEnabled:true,liveWeather:false,city:'Minsk',...initial,sites:Object.fromEntries(['google','yandex','translate','youtube','gmail'].map(site=>[site,(initial.sites?.[site] ?? initial[`${site}Enabled`]) !== false]))}));
  // HeroUI retains tab contents between renders. Read the latest draft inside
  // retained callbacks so changing another field cannot restore older values.
  const draftRef = useRef(draft);
  const [background,setBackground] = useState(backgroundImage);
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const fileInput = useRef(null);
  const t = copy[lang];
  const theme = resolveTheme(draft);
  function change(key,value) {
    const next = {...draftRef.current,[key]:value};
    draftRef.current = next;
    setDraft(next);
    onChange?.(key,value,next);
  }
  function changeSite(site,value) {
    const sites = {...draftRef.current.sites,[site]:value};
    change('sites',sites);
  }
  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if(!file)return;
    setError('');setBusy(true);onBusy?.(true);
    try {const data = await prepareImage(file);setBackground(data);await onBackground?.(data);}
    catch(error){setError(error.message === 'type' ? t.uploadError : t.decodeError);}
    finally{setBusy(false);onBusy?.(false);}
  }
  const toggle = (key,label) => <Switch key={key} name={key} id={key==='homepageEnabled' ? 'homepage' : key==='resultsEnabled' ? 'results' : key} isSelected={Boolean(draft[key])} onValueChange={value=>change(key,value)} classNames={{base:'hg-switch-row',wrapper:'hg-switch-track',thumb:'hg-switch-thumb',label:'hg-switch-label'}}>{label}</Switch>;
  return <div className={`${theme} hg-heroui-controls hg-control-fields`}>
    <input type="hidden" name="hgSettings" value={JSON.stringify(draft)}/>
    <input type="hidden" name="backgroundImage" value={background}/>
    <Tabs aria-label={t.title} variant="solid" fullWidth classNames={{base:'hg-control-tabs',tabList:'hg-tab-list',tab:'hg-tab',cursor:'hg-tab-cursor',tabContent:'hg-tab-content',panel:'hg-tab-panel'}}>
      <Tab key="appearance" title={t.appearance}>
        <RadioGroup label={t.theme} orientation="horizontal" value={draft.theme} onValueChange={value=>change('theme',value)} classNames={{base:'hg-theme-picker',wrapper:'hg-theme-options',label:'hg-section-label'}}>
          {['dark','light','system'].map(mode=><Radio key={mode} value={mode} classNames={{base:'hg-theme-radio',label:'hg-theme-radio-label',wrapper:'hg-radio-ring'}}>{t[mode]}</Radio>)}
        </RadioGroup>
        <RadioGroup label={t.homepageProvider} orientation="horizontal" value={draft.homepageProvider} onValueChange={value=>change('homepageProvider',value)} classNames={{base:'hg-provider-picker',wrapper:'hg-theme-options',label:'hg-section-label'}}>
          {['google','yandex','translate'].map(provider=><Radio key={provider} value={provider} classNames={{base:'hg-theme-radio',label:'hg-theme-radio-label',wrapper:'hg-radio-ring'}}>{t[provider]}</Radio>)}
        </RadioGroup>
        <div className="hg-background-preview" data-custom={Boolean(background)} style={background ? {backgroundImage:`url("${background}")`} : undefined}><span>{t.background}</span></div>
        <input ref={fileInput} id="background-upload" type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={upload} hidden/>
        <div className="hg-upload-actions"><Button className="hg-button hg-secondary" isLoading={busy} onPress={()=>fileInput.current.click()}>{t.upload}</Button>{background && <Button className="hg-button hg-quiet" onPress={async()=>{setBackground('');await onBackground?.('');}}>{t.reset}</Button>}</div>
        <p className="hg-help">{t.backgroundHelp}</p>
        {error && <p role="alert" className="hg-error">{error}</p>}
      </Tab>
      <Tab key="sites" title={t.sites}>
        <p className="hg-help">{t.siteHelp}</p>
        {['google','yandex','translate','youtube','gmail'].map(site=><Switch key={site} name={`site-${site}`} isSelected={draft.sites?.[site] !== false} onValueChange={value=>changeSite(site,value)} classNames={{base:'hg-switch-row',wrapper:'hg-switch-track',thumb:'hg-switch-thumb',label:'hg-switch-label'}}><span className="hg-site-label"><img src={`${assetBase}assets/${site==='google' ? 'icons/brand-google.svg' : site==='yandex' ? 'yandex-mark.png' : site==='translate' ? 'translate-mark.png' : `${site}.svg`}`} alt=""/>{t[site]}</span></Switch>)}
        <div className="hg-subsettings">{toggle('homepageEnabled',t.homepage)}{toggle('resultsEnabled',t.results)}{toggle('aiEnabled',t.ai)}</div>
      </Tab>
      <Tab key="search" title={t.search}>
        <Selectors settings={draft} lang={lang} assetBase={assetBase} mode={popup ? 'popup' : 'settings'} onChange={(key,value)=>change(key,value)}/>
        <p className="hg-help">{t.regionHelp}</p>
        {toggle('liveWeather',t.weather)}
        <Input name="city" label={t.city} labelPlacement="outside" value={draft.city} maxLength={100} onValueChange={value=>change('city',value)} classNames={inputClasses}/>
        <p className="hg-help">{t.weatherHelp}</p>
      </Tab>
    </Tabs>
  </div>;
}

function Panel({settings,lang,assetBase,backgroundImage,onChange,onBackground,onOpen}) {
  const [draft,setDraft] = useState(settings);
  const [status,setStatus] = useState('');
  const t = copy[lang];
  async function save(key,value,next) {
    setDraft(next);setStatus('saving');
    try {await onChange(key,value,next);setStatus('saved');} catch {setStatus('saveError');}
  }
  return <HeroUIProvider disableAnimation={matchMedia('(prefers-reduced-motion: reduce)').matches}><div className={`${resolveTheme(draft)} hg-panel hg-heroui-controls`}>
    <header className="hg-panel-heading"><span className="hg-panel-symbol"><img src={`${assetBase}assets/icons/sparkles.svg`} alt=""/></span><div><h1>Google Glass</h1><p>{t.subtitle}</p></div><Chip size="sm" variant="flat">1.4.0</Chip></header>
    <Fields initial={settings} lang={lang} assetBase={assetBase} backgroundImage={backgroundImage} onChange={save} onBackground={onBackground} popup/>
    <footer className="hg-panel-footer"><span role="status">{status ? t[status] : ''}</span><Button id="open" className="hg-button hg-primary" onPress={onOpen}>{t.newtab}</Button></footer>
  </div></HeroUIProvider>;
}

export function Modals({settings,lang,assetBase,backgroundImage,container,controller,onDelete}) {
  const [active,setActive] = useState(null);
  const [item,setItem] = useState(null);
  const [uploading,setUploading] = useState(false);
  const t = copy[lang];
  controller.openSettings = ()=>flushSync(()=>{setItem(null);setActive('settings');});
  controller.openShortcut = shortcut=>flushSync(()=>{setItem(shortcut || null);setActive('shortcut');});
  controller.close = ()=>flushSync(()=>setActive(null));
  return <HeroUIProvider disableAnimation={matchMedia('(prefers-reduced-motion: reduce)').matches}><div className={`${resolveTheme(settings)} hg-heroui-controls hg-modal-portals`}>
    <Modal isOpen={Boolean(active)} onClose={()=>setActive(null)} portalContainer={container} placement="center" scrollBehavior="inside" backdrop="blur" classNames={modalClasses} motionProps={modalMotion} aria-label={active==='settings' ? t.title : item ? t.edit : t.add}>
      <ModalContent>
        {()=> <form id={active==='settings' ? 'settings-form' : 'shortcut-form'} className={`${resolveTheme(settings)} hg-modal-form`}>
          <ModalHeader><div><span className="hg-modal-eyebrow">GOOGLE GLASS</span><h2 id="shortcut-title">{active==='settings' ? t.title : item ? t.edit : t.add}</h2>{active==='settings' && <p>{t.subtitle}</p>}</div></ModalHeader>
          <ModalBody>
            {active==='settings' ? <Fields initial={settings} lang={lang} assetBase={assetBase} backgroundImage={backgroundImage} onBusy={setUploading}/> : <>
              <Input key={`name-${item?.id || ''}`} name="name" label={t.name} labelPlacement="outside" defaultValue={item ? (lang==='ru' ? item.ru || item.name : item.name) : ''} maxLength={32} isRequired autoComplete="off" classNames={inputClasses}/>
              <Input key={`url-${item?.id || ''}`} name="url" label={t.url} labelPlacement="outside" defaultValue={item?.url || ''} placeholder="https://example.com" isRequired autoComplete="off" classNames={inputClasses}/>
              <p className="hg-help">{t.urlHelp}</p>
            </>}
            <p className="hg-error" id={active==='settings' ? 'settings-error' : 'shortcut-error'} role="alert"/>
          </ModalBody>
          <ModalFooter>
            {active==='shortcut' && item && <Button id="delete-shortcut" type="button" data-action="delete" className="hg-button hg-danger" onPress={onDelete}>{t.remove}</Button>}
            <Button type="button" className="hg-button hg-secondary" onPress={()=>setActive(null)}>{t.cancel}</Button>
            <Button type="submit" className="hg-button hg-primary" isDisabled={uploading}>{t.save}</Button>
          </ModalFooter>
        </form>}
      </ModalContent>
    </Modal>
  </div></HeroUIProvider>;
}

export function mountPanel(container,options) {
  roots.get(container)?.unmount();
  const root = createRoot(container);roots.set(container,root);
  flushSync(()=>root.render(<Panel {...options}/>));
  return ()=>{root.unmount();roots.delete(container);};
}
export function mountModals(container,options) {
  const root = createRoot(container);
  const controller = {};
  flushSync(()=>root.render(<Modals {...options} container={container} controller={controller}/>));
  controller.destroy = ()=>root.unmount();
  return controller;
}
