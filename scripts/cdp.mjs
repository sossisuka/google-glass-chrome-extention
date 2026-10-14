import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export class CDP {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Map();
    this.ready = new Promise((resolve,reject) => {
      this.socket.addEventListener('open', resolve, { once:true });
      this.socket.addEventListener('error', reject, { once:true });
    });
    this.socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        clearTimeout(pending.timeout);
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
        else pending.resolve(message.result);
      } else {
        for (const fn of this.listeners.get(message.method) || []) fn(message.params);
      }
    });
  }
  on(method,fn) {
    if (!this.listeners.has(method)) this.listeners.set(method,new Set());
    this.listeners.get(method).add(fn);
    return () => this.listeners.get(method).delete(fn);
  }
  async send(method,params={}) {
    await this.ready;
    return new Promise((resolve,reject) => {
      const id = ++this.nextId;
      const timeout = setTimeout(() => { this.pending.delete(id); reject(new Error(`Timed out: ${method}`)); },20000);
      this.pending.set(id,{resolve,reject,timeout});
      this.socket.send(JSON.stringify({id,method,params}));
    });
  }
  async evaluate(expression) {
    const response = await this.send('Runtime.evaluate',{ expression, returnByValue:true, awaitPromise:true, userGesture:true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text + ': ' + response.exceptionDetails.exception?.description);
    return response.result.value;
  }
  close() { this.socket.close(); }
}

export const delay = milliseconds => new Promise(resolve => setTimeout(resolve,milliseconds));
export async function until(fn, timeout=15000) {
  const start = Date.now();
  let last;
  while (Date.now()-start < timeout) {
    try { last = await fn(); if (last) return last; } catch { /* Retry during navigation. */ }
    await delay(100);
  }
  throw new Error(`Condition timed out (${last})`);
}

export async function launch({ extension, port=9333 }={}) {
  const browser = process.env.CHROME_BINARY || 'C:/Users/Eduard/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe';
  const profile = await mkdtemp(path.join(os.tmpdir(),'google-glass-'));
  const args = ['--headless=new','--no-first-run','--no-default-browser-check',`--user-data-dir=${profile}`,`--remote-debugging-port=${port}`,'--remote-allow-origins=*'];
  if (extension) args.push(`--load-extension=${extension}`,`--disable-extensions-except=${extension}`);
  args.push('about:blank');
  const child = spawn(browser,args,{ windowsHide:true, stdio:['ignore','ignore','pipe'] });
  let log = '';
  child.stderr.on('data',chunk => { log += chunk; });
  child.on('error',error => { log += error.message; });
  const endpoint = `http://127.0.0.1:${port}`;
  await until(async () => (await fetch(`${endpoint}/json/version`)).ok);
  const connection = new CDP((await (await fetch(`${endpoint}/json/version`)).json()).webSocketDebuggerUrl);
  async function page(url='about:blank') {
    const target = await (await fetch(`${endpoint}/json/new?${encodeURIComponent(url)}`,{method:'PUT'})).json();
    const cdp = new CDP(target.webSocketDebuggerUrl);
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    return cdp;
  }
  async function stop() {
    try { await connection.send('Browser.close'); } catch { child.kill(); }
    connection.close();
    await mkdir('qa',{recursive:true});
    await writeFile('qa/browser.log',log);
  }
  return { page, stop, endpoint, connection, profile };
}
