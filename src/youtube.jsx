import React, {useState,useEffect,useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {createPortal,flushSync} from 'react-dom';
import {HeroUIProvider, Button, Input, Card, CardBody, Avatar, Chip, Skeleton} from '@heroui/react';

const copy = {
  en:{search:'Search',create:'Create',signIn:'Sign in',voice:'Search with your voice',menu:'Toggle navigation',notifications:'Notifications',account:'Account',settings:'Settings',play:'Play video',more:'More actions',recommended:'Recommended',subscribe:'Subscribe',view:'View channel',loading:'Loading video',unavailable:'Thumbnail unavailable'},
  ru:{search:'Введите запрос',create:'Создать',signIn:'Войти',voice:'Голосовой поиск',menu:'Открыть меню',notifications:'Уведомления',account:'Аккаунт',settings:'Настройки',play:'Смотреть видео',more:'Другие действия',recommended:'Рекомендованные',subscribe:'Подписаться',view:'Открыть канал',loading:'Видео загружается',unavailable:'Обложка недоступна'}
};
const inputClasses = {base:'yt-search-input',mainWrapper:'yt-search-main',inputWrapper:'yt-search-wrapper',innerWrapper:'yt-search-inner',input:'yt-search-field'};
function Icon({name,assetBase}) {return <img className="yt-icon" src={`${assetBase}assets/icons/${name}.svg`} alt=""/>;}
function IconButton({icon,label,assetBase,onPress,className='',nativeKey}) {
  return <Button isIconOnly disableRipple className={`yt-button yt-icon-button ${className}`} aria-label={label} aria-hidden={nativeKey ? true : undefined} tabIndex={nativeKey ? -1 : undefined} data-hg-native-control={nativeKey} onPress={onPress}><Icon name={icon} assetBase={assetBase}/></Button>;
}
function VideoSkeleton({video,t}) {
  return <Card className={`yt-video-card yt-loading-card ${video.short ? 'yt-short-card' : ''}`} shadow="none" role="group" aria-busy="true" aria-label={t.loading}>
    <CardBody className="yt-video-body">
      <Skeleton className="yt-skeleton yt-thumbnail"/>
      <div className="yt-video-details" aria-hidden="true">
        {!video.short && <Skeleton className="yt-skeleton yt-skeleton-avatar"/>}
        <div className="yt-video-copy yt-skeleton-copy"><Skeleton className="yt-skeleton yt-skeleton-title"/><Skeleton className="yt-skeleton yt-skeleton-title yt-skeleton-second"/><Skeleton className="yt-skeleton yt-skeleton-meta"/></div>
      </div>
    </CardBody>
  </Card>;
}
function Thumbnail({video,assetBase,t,featured}) {
  const [ready,setReady]=useState(false),[failed,setFailed]=useState(false);
  const checkCached=useCallback(img=>{if(img?.complete && img.naturalWidth)setReady(true);},[]);
  return <a className="yt-thumbnail" href={video.href} aria-label={video.title} aria-busy={!ready && !failed}>
    <Skeleton className="yt-skeleton yt-thumbnail-skeleton" classNames={{content:'yt-thumbnail-content'}} isLoaded={ready || failed}>
      <img ref={checkCached} src={video.thumbnail} alt="" loading={featured ? 'eager' : 'lazy'} onLoad={()=>setReady(true)} onError={()=>setFailed(true)} hidden={failed}/>
    </Skeleton>
    {failed && <span className="yt-thumbnail-error">{t.unavailable}</span>}
    {ready && featured && <span className="yt-play"><Icon name="player-play-filled" assetBase={assetBase}/></span>}
    {ready && video.duration && <Chip classNames={{base:'yt-duration',content:'yt-duration-text'}} size="sm">{video.duration}</Chip>}
  </a>;
}
function VideoCard({video,assetBase,t,compact=false,featured=false}) {
  if(video.loading)return <VideoSkeleton video={video} t={t}/>;
  return <Card className={`yt-video-card ${compact ? 'yt-compact-card' : ''} ${featured ? 'yt-featured-card' : ''} ${video.short ? 'yt-short-card' : ''}`} shadow="none">
    <CardBody className="yt-video-body">
      <Thumbnail key={video.thumbnail} video={video} assetBase={assetBase} t={t} featured={featured}/>
      {!featured && <div className="yt-video-details">
        {!compact && video.avatar && <Avatar as="a" href={video.channelHref} src={video.avatar} name={video.channel} classNames={{base:'yt-avatar',img:'yt-avatar-image'}}/>}
        <div className="yt-video-copy"><a className="yt-video-title" href={video.href}>{video.title}</a>{video.channel && <a className="yt-video-channel" href={video.channelHref}>{video.channel}</a>}{video.metadata && <p className="yt-video-metadata">{video.metadata}</p>}</div>
        {video.menuKey && <IconButton icon="dots-vertical" label={`${t.more}: ${video.title}`} assetBase={assetBase} nativeKey={video.menuKey} className="yt-card-menu"/>}
      </div>}
    </CardBody>
  </Card>;
}
function Featured({videos,assetBase,t}) {
  const [video,...related] = videos;
  if(!video)return null;
  return <section className="yt-featured" aria-label={video.title}>
    <VideoCard video={video} assetBase={assetBase} t={t} featured/>
    <div className="yt-featured-copy">
      <a className="yt-featured-title" href={video.href}>{video.title}</a>
      <div className="yt-featured-channel">{video.avatar && <Avatar src={video.avatar} name={video.channel} as="a" href={video.channelHref} classNames={{base:'yt-avatar',img:'yt-avatar-image'}}/>}<div><a href={video.channelHref}>{video.channel}</a><p>{video.metadata}</p></div></div>
      {video.description && <p className="yt-featured-description">{video.description}</p>}
      <Button as="a" href={video.channelHref || video.href} className="yt-button yt-subscribe">{t.view}</Button>
    </div>
    <div className="yt-featured-related">{related.map(item=><VideoCard key={item.key} video={item} assetBase={assetBase} t={t} compact/>)}</div>
  </section>;
}
function Shell({model,assetBase}) {
  const [query,setQuery] = useState(model.searchQuery);
  useEffect(()=>setQuery(model.searchQuery),[model.searchQuery]);
  const t = copy[model.lang] || copy.en;
  return <>
    <header className="yt-header">
      <div className="yt-brand"><IconButton icon="menu-2" label={t.menu} assetBase={assetBase} onPress={model.onToggle}/><a className="yt-logo" href="/" aria-label="YouTube"><img src={`${assetBase}assets/youtube.svg`} alt=""/><span>YouTube</span></a></div>
      <div className="yt-search-area"><form className="yt-search" action="/results" method="get"><Input aria-label={t.search} placeholder={t.search} name="search_query" value={query} onValueChange={setQuery} classNames={inputClasses}/><Button isIconOnly type="submit" aria-label={t.search} className="yt-button yt-search-submit"><Icon name="search" assetBase={assetBase}/></Button></form>{model.actions.voice && <IconButton icon="microphone" label={t.voice} assetBase={assetBase} nativeKey="header:voice"/>}</div>
      <div className="yt-header-actions">{model.actions.create && <Button className="yt-button yt-create" aria-hidden tabIndex={-1} data-hg-native-control="header:create" startContent={<Icon name="plus" assetBase={assetBase}/>}>{t.create}</Button>}{model.actions.notifications && <IconButton icon="bell" label={t.notifications} assetBase={assetBase} nativeKey="header:notifications"/>}{model.actions.settings && <IconButton icon="settings" label={t.settings} assetBase={assetBase} nativeKey="header:settings"/>}{model.actions.account && <Button className="yt-button yt-account" aria-label={model.avatar ? t.account : t.signIn} aria-hidden tabIndex={-1} data-hg-native-control="header:account">{model.avatar ? <Avatar src={model.avatar} classNames={{base:'yt-avatar',img:'yt-avatar-image'}}/> : <><Icon name="user" assetBase={assetBase}/><span>{t.signIn}</span></>}</Button>}</div>
    </header>
    <aside className="yt-sidebar" aria-label="YouTube"><nav>{model.groups.map((group,index)=><div className="yt-nav-group" key={`${index}-${group.title}`}>
      {group.title && <h2>{group.title}</h2>}{group.items.map(item=><Button as="a" href={item.href} key={item.href} className={`yt-button yt-nav-link ${item.active ? 'is-active' : ''}`} aria-current={item.active ? 'page' : undefined} startContent={item.avatar ? <Avatar src={item.avatar} classNames={{base:'yt-nav-avatar',img:'yt-avatar-image'}}/> : <Icon name={item.icon} assetBase={assetBase}/>}><span>{item.title}</span></Button>)}
    </div>)}</nav></aside>
    {model.chipTarget && createPortal(<div className="yt-chips" role="group" aria-label={t.recommended}>{model.chips.map(chip=><Button key={chip.key} className={`yt-button yt-chip ${chip.selected ? 'is-selected' : ''}`} aria-hidden tabIndex={-1} data-hg-native-control={chip.nativeKey} aria-pressed={chip.selected}>{chip.title}</Button>)}</div>,model.chipTarget)}
    {model.featureTarget && createPortal(<><Featured videos={model.featured} t={t} assetBase={assetBase}/><h2 className="yt-section-title">{t.recommended}</h2></>,model.featureTarget)}
    {model.cards.map(({target,video})=>createPortal(<VideoCard video={video} assetBase={assetBase} t={t}/>,target,video.key))}
  </>;
}
window.HeroYoutubeUI = {
  mount(container,{assetBase}) {
    const root = createRoot(container);
    return {
      update(model) {flushSync(()=>root.render(<HeroUIProvider disableAnimation={matchMedia('(prefers-reduced-motion: reduce)').matches}><div className={`yt-ui ${model.mode} ${model.collapsed ? 'is-collapsed' : ''}`}><Shell model={model} assetBase={assetBase}/></div></HeroUIProvider>));},
      destroy() {root.unmount();}
    };
  }
};
