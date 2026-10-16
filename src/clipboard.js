// Clipboard writes can be denied by a host site's permissions even in a content script.
export async function writeClipboard(text,container){
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return;}}catch{ /* Use a direct copy action from the user's click. */ }
  const doc=container?.ownerDocument || document;
  let active=doc.activeElement;
  while(active?.shadowRoot?.activeElement)active=active.shadowRoot.activeElement;
  const selection=(active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement) && typeof active.selectionStart==='number' ? {start:active.selectionStart,end:active.selectionEnd} : null;
  const field=doc.createElement('textarea');field.value=text;field.readOnly=true;field.tabIndex=-1;
  field.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;padding:0;border:0;opacity:0;pointer-events:none;';
  (container || doc.body).append(field);
  try{field.focus({preventScroll:true});field.select();if(!doc.execCommand('copy'))throw Error('Clipboard unavailable');}
  finally{field.remove();if(active?.isConnected){active.focus({preventScroll:true});if(selection)active.setSelectionRange(selection.start,selection.end);}}
}
