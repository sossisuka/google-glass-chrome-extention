import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {Selectors} from './search-selectors.jsx';
import {mountResultsPreview} from './results.jsx';
import {mountPanel,mountModals} from './controls.jsx';
const roots = new WeakMap();
let fontsRequested=false;
function loadFont(assetBase){
  if(fontsRequested)return;
  fontsRequested=true;
  const font=new FontFace('Inter',`url(${assetBase}assets/fonts/Inter.ttf)`,{weight:'100 900',style:'normal'});
  document.fonts.add(font);
  font.load().catch(()=>{});
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
