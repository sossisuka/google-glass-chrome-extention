import React, { useId, useState, useRef, useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { HeroUIProvider, Popover, PopoverTrigger, PopoverContent, Button, Input, Listbox, ListboxItem, ScrollShadow } from '@heroui/react';
import { countries } from 'countries-list';
import { mountResultsPreview } from './results.jsx';
import { mountPanel, mountModals } from './controls.jsx';

const preferred = ['BY','RU','UA','KZ','DE','PL','LT','LV','EE','US','GB','FR','IT','ES','CA','GE','AM','AZ','TR','FI','SE','NO','DK','NL','CH','AT','CZ','SK','UZ'];
const strings = {
  ru:{country:'Страна',language:'Язык',searchCountry:'Поиск страны...',searchLanguage:'Поиск языка...',all:'Показать все страны',popular:'Популярные страны',empty:'Ничего не найдено',auto:'Автоматически'},
  en:{country:'Country',language:'Language',searchCountry:'Search countries...',searchLanguage:'Search languages...',all:'Show all countries',popular:'Popular countries',empty:'No matches found',auto:'Automatic'}
};
const allCountries = Object.keys(countries);
const roots = new WeakMap();
let fontsRequested=false;
function loadFont(assetBase){
  if(fontsRequested)return;
  fontsRequested=true;
  const font=new FontFace('Inter',`url(${assetBase}assets/fonts/Inter.ttf)`,{weight:'100 900',style:'normal'});
  document.fonts.add(font);
  font.load().catch(()=>{});
}

function Icon({name,assetBase,className=''}) {
  return <img className={`hg-selector-icon ${className}`} src={`${assetBase}assets/icons/${name}.svg`} alt="" aria-hidden="true"/>;
}

function ReferenceSelector({kind='country',value,onChange,lang,assetBase,portalContainer,initialOpen=false,density='regular'}) {
  const [open,setOpen] = useState(initialOpen);
  const [query,setQuery] = useState('');
  const [showAll,setShowAll] = useState(false);
  const labelId = useId();
  const selectorRef = useRef(null);
  useLayoutEffect(()=>{
    const resize=()=>{
      const measured=selectorRef.current?.getBoundingClientRect().width || 0;
      portalContainer.style.setProperty('--trigger-width',`${measured}px`);
    };
    resize();
    const observer=new ResizeObserver(resize);
    if(selectorRef.current)observer.observe(selectorRef.current);
    return()=>observer.disconnect();
  },[portalContainer]);
  const t = strings[lang] || strings.en;
  const names = new Intl.DisplayNames([lang],{type:'region'});
  const country = kind === 'country';
  const languageNames = { auto:t.auto,ru:'Русский',en:'English' };
  const label = country ? t.country : t.language;
  const getName = key => country ? names.of(key) || countries[key]?.name || key : languageNames[key];
  const available = country ? (showAll || query ? allCountries : preferred) : Object.keys(languageNames);
  const options = available.filter(key => `${getName(key)} ${key} ${country ? countries[key]?.name : ''}`.toLocaleLowerCase(lang).includes(query.trim().toLocaleLowerCase(lang)));
  if (country && (showAll || query)) options.sort((a,b)=>getName(a).localeCompare(getName(b),lang));
  function choose(keys) {
    const selected = [...keys][0];
    if (!selected) return;
    onChange(selected);
    setOpen(false);
    setQuery('');
  }
  function openChange(next) { setOpen(next); if (!next) setQuery(''); }
  const flag = key => country ? <img className="hg-country-flag" src={`${assetBase}assets/flags/${key.toLowerCase()}.svg`} alt="" aria-hidden="true"/> : <Icon name="language" assetBase={assetBase}/>;
  return <div ref={selectorRef} className={`hg-reference-select hg-select-${density}`} data-selector={kind}>
    <span className="hg-selector-label" id={labelId}>{label}</span>
    <input type="hidden" name={kind} id={kind === 'language' ? 'language' : 'country'} value={value}/>
    <Popover isOpen={open} onOpenChange={openChange} placement="bottom-start" offset={density==='showcase' ? -2 : 0} containerPadding={density==='showcase' ? 0 : 12} shouldFlip={density !== 'showcase'} shouldCloseOnScroll={false} triggerScaleOnOpen={false} portalContainer={portalContainer} classNames={{content:`hg-selector-popover hg-popover-${density}`,base:'hg-selector-popover-base'}}>
      <PopoverTrigger>
        <Button type="button" disableRipple className="hg-selector-trigger" aria-labelledby={`${labelId} ${labelId}-value`} data-testid={`${kind}-trigger`}>
          {flag(value)}<span className="hg-selector-value" id={`${labelId}-value`}>{getName(value)}</span><Icon name="chevron-down" assetBase={assetBase}/>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="hg-selector-content">
          <Input aria-label={country ? t.searchCountry : t.searchLanguage} placeholder={country ? t.searchCountry : t.searchLanguage} value={query} onValueChange={setQuery} autoFocus={density !== 'showcase'} onKeyDown={event=>{if(event.key==='ArrowDown'){event.preventDefault();portalContainer.querySelector('[role=option]')?.focus();}}} startContent={<Icon name="search" assetBase={assetBase}/>} classNames={{base:'hg-selector-search',inputWrapper:'hg-selector-search-wrapper',input:'hg-selector-search-input',innerWrapper:'hg-selector-search-inner'}}/>
          <ScrollShadow className="hg-selector-scroll" hideScrollBar={false} size={30}>
            <Listbox aria-label={label} selectionMode="single" disallowEmptySelection selectedKeys={new Set([value])} onSelectionChange={choose} onAction={()=>{setOpen(false);setQuery('');}} classNames={{base:'hg-selector-list',list:'hg-selector-options'}} emptyContent={t.empty} hideSelectedIcon>
              {options.map(key => <ListboxItem key={key} textValue={getName(key)} onPress={()=>{if(key===value){setOpen(false);setQuery('');}}} onKeyDown={event=>{if(event.key==='Enter' || event.key===' '){event.preventDefault();event.stopPropagation();onChange(key);setOpen(false);setQuery('');}}} classNames={{base:'hg-selector-option',title:'hg-selector-option-title'}} startContent={flag(key)} endContent={key === value ? <Icon name="check" assetBase={assetBase} className="hg-selector-check"/> : null}>{getName(key)}</ListboxItem>)}
            </Listbox>
          </ScrollShadow>
          {country && !query && <Button type="button" disableRipple className="hg-selector-all" onPress={()=>setShowAll(!showAll)} startContent={<Icon name="world" assetBase={assetBase}/>} endContent={<Icon name="chevron-right" assetBase={assetBase}/>}>{showAll ? t.popular : t.all}</Button>}
        </div>
      </PopoverContent>
    </Popover>
  </div>;
}

export function Selectors({container,settings={},lang='en',assetBase,mode='settings',initialOpen=false,onChange}) {
  const [country,setCountry] = useState(settings.country || 'BY');
  const [language,setLanguage] = useState(settings.language || 'auto');
  const [portal,setPortal] = useState(null);
  const density = mode === 'country' ? 'showcase' : mode === 'popup' ? 'compact' : 'regular';
  const change = (name,value) => {
    if (name === 'country') setCountry(value); else setLanguage(value);
    onChange?.(name,value);
  };
  const theme = settings.theme === 'light' || (settings.theme === 'system' && matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
  return <HeroUIProvider disableAnimation={matchMedia('(prefers-reduced-motion: reduce)').matches}><div className={`${theme} hg-heroui-controls`}>
    <div ref={setPortal} className="hg-selector-portals"/>
    {portal && <>
      {mode !== 'country' && <ReferenceSelector kind="language" value={language} onChange={value=>change('language',value)} lang={lang} assetBase={assetBase} portalContainer={portal} density={density}/>}
      <ReferenceSelector value={country} onChange={value=>change('country',value)} lang={lang} assetBase={assetBase} portalContainer={portal} density={density} initialOpen={initialOpen}/>
    </>}
  </div></HeroUIProvider>;
}

function mountSelectors(container,options) {
  loadFont(options.assetBase);
  roots.get(container)?.unmount();
  const root = createRoot(container);
  roots.set(container,root);
  flushSync(()=>root.render(<Selectors {...options} container={container}/>));
  return () => { if (roots.get(container) === root) { root.unmount(); roots.delete(container); } };
}
window.HeroGoogleUI = {
  mountSelectors,
  mountPanel:(container,options)=>{loadFont(options.assetBase);return mountPanel(container,options);},
  mountModals:(container,options)=>{loadFont(options.assetBase);return mountModals(container,options);},
  mountResultsPreview:(container,options)=>{loadFont(options.assetBase);return mountResultsPreview(container,options);}
};
