(() => {
  // Recolor rendered mail locally. Never read, persist or transmit message text.
  const html=document.documentElement;
  const adapted=new Map();
  const attributes=['data-hg-gmail-ink','data-hg-gmail-surface','data-hg-gmail-edge'];
  const properties=['--hg-mail-ink','--hg-mail-surface','--hg-mail-edge'];
  let timer;
  function rgb(value) {
    const hex=value.match(/^#([a-f\d]{3}|[a-f\d]{6})$/i);
    if(hex){const full=hex[1].length===3 ? [...hex[1]].map(c=>c+c).join('') : hex[1];return [0,2,4].map(index=>parseInt(full.slice(index,index+2),16)).concat(1);}
    const match=value.match(/^rgba?\(([^)]+)\)$/);
    if(!match)return null;
    const values=match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return values.length>=3 ? [...values.slice(0,3),values[3] ?? 1] : null;
  }
  const neutral=color=>Math.max(...color.slice(0,3))-Math.min(...color.slice(0,3))<=18;
  const css=color=>color[3]<1 ? `rgba(${color.slice(0,3).map(Math.round).join(', ')}, ${color[3]})` : `rgb(${color.slice(0,3).map(Math.round).join(', ')})`;
  function luminance(color) {
    const values=color.slice(0,3).map(c=>{c/=255;return c<=.04045 ? c/12.92 : ((c+.055)/1.055)**2.4;});
    return .2126*values[0]+.7152*values[1]+.0722*values[2];
  }
  function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  function blend(front,back){return front.slice(0,3).map((c,i)=>c*front[3]+back[i]*(1-front[3])).concat(1);}
  function clear(element,state) {
    for(let i=0;i<attributes.length;i++){
      if(state.attributes[i]===null)element.removeAttribute(attributes[i]);else element.setAttribute(attributes[i],state.attributes[i]);
      if(state.properties[i])element.style.setProperty(properties[i],state.properties[i]);else element.style.removeProperty(properties[i]);
    }
    if(state.styleWasAbsent && !element.style.length)element.removeAttribute('style');
    state.writtenStyle=element.getAttribute('style');
  }
  function reset() {for(const [element,state] of adapted)clear(element,state);}
  function sync() {
    reset();
    if(!html.hasAttribute('data-hg-gmail') || html.dataset.hgMode!=='dark'){adapted.clear();return;}
    const theme=getComputedStyle(html);
    const panel=rgb(theme.getPropertyValue('--hg-panel').trim()) || [13,16,21,1];
    const raised=rgb(theme.getPropertyValue('--hg-elevated').trim()) || [28,34,43,1];
    const text=rgb(theme.getPropertyValue('--hg-text').trim()) || [233,237,245,1];
    const muted=rgb(theme.getPropertyValue('--hg-muted').trim()) || [161,170,187,1];
    const changes=[];
    const live=new Set();
    for(const root of document.querySelectorAll('.a3s')){
      if(root.closest('[contenteditable=true]') || !root.getClientRects().length)continue;
      // Read styles before writing overrides so nested inheritance stays consistent.
      const backgrounds=new Map();
      const foregrounds=new Map();
      for(const element of [root,...root.querySelectorAll('*')]){
        if(element.matches('img,picture,source,video,canvas,svg,svg *,style,script'))continue;
        const style=getComputedStyle(element);
        const originalBg=rgb(style.backgroundColor) || [0,0,0,0];
        const parentBg=backgrounds.get(element.parentElement) || panel;
        let nextBg=originalBg;
        if(originalBg[3]>.5 && neutral(originalBg) && luminance(originalBg)>.45)nextBg=luminance(originalBg)>.9 ? panel : raised;
        const effectiveBg=blend(nextBg,parentBg);
        backgrounds.set(element,effectiveBg);
        const originalInk=rgb(style.color) || text;
        // Inherited text must follow its adapted parent; authored colors stay local.
        let nextInk=foregrounds.get(element.parentElement)?.original===style.color ? foregrounds.get(element.parentElement).color : originalInk;
        if(originalInk[3]>0 && neutral(originalInk) && luminance(originalInk)<.45 && luminance(effectiveBg)<.3)nextInk=luminance(originalInk)<.08 ? text : muted;
        if(originalInk[3]>0 && contrast(blend(nextInk,effectiveBg),effectiveBg)<4.5){
          const endpoint=contrast(text,effectiveBg)>contrast([20,25,32,1],effectiveBg) ? text : [20,25,32,1];
          for(let step=1;step<=20;step++){
            const amount=step/20;
            nextInk=originalInk.slice(0,3).map((c,i)=>Math.round(c*(1-amount)+endpoint[i]*amount)).concat(1);
            if(contrast(nextInk,effectiveBg)>=4.5)break;
          }
        }
        foregrounds.set(element,{original:style.color,color:nextInk});
        const border=rgb(style.borderLeftColor);
        const edge=border && neutral(border) && luminance(border)>.45 && style.borderLeftStyle!=='none';
        const surface=css(nextBg)!==css(originalBg) && originalBg[3]>.5;
        const ink=css(nextInk)!==css(originalInk);
        if(ink || surface || edge){live.add(element);changes.push({element,ink:ink ? css(nextInk) : null,surface:surface ? css(nextBg) : null,edge:edge ? 'var(--hg-gmail-edge)' : null});}
      }
    }
    for(const element of adapted.keys())if(!live.has(element))adapted.delete(element);
    for(const change of changes){
      const {element}=change;
      if(!adapted.has(element))adapted.set(element,{attributes:attributes.map(name=>element.getAttribute(name)),properties:properties.map(name=>element.style.getPropertyValue(name)),styleWasAbsent:!element.hasAttribute('style')});
      for(const [index,key] of ['ink','surface','edge'].entries())if(change[key]){element.setAttribute(attributes[index],'');element.style.setProperty(properties[index],change[key]);}
      adapted.get(element).writtenStyle=element.getAttribute('style');
    }
  }
  function schedule(){if(!timer)timer=setTimeout(()=>{timer=undefined;sync();},100);}
  new MutationObserver(records=>{
    if(records.some(record=>{
      if(record.target===html)return true;
      if(record.type==='attributes' && record.attributeName==='style' && adapted.get(record.target)?.writtenStyle===record.target.getAttribute('style'))return false;
      if(record.target.nodeType===1 && (record.target.closest('.a3s') || record.type==='attributes' && record.target.querySelector('.a3s')))return true;
      return record.type==='childList' && [...record.addedNodes,...record.removedNodes].some(node=>node.nodeType===1 && (node.matches('.a3s') || node.querySelector('.a3s')));
    }))schedule();
  }).observe(html,{childList:true,subtree:true,attributes:true,attributeFilter:['data-hg-gmail','data-hg-mode','style','bgcolor','color','class','hidden']});
  window.addEventListener('hg-route',schedule);
  window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('DOMContentLoaded',schedule,{once:true});
  window.HeroGoogleBoot?.ready.then(schedule);schedule();
})();
