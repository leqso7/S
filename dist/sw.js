if(!self.define){let e,s={};const i=(i,r)=>(i=new URL(i+".js",r).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,n)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let o={};const l=e=>i(e,t),d={module:{uri:t},exports:o,require:l};s[t]=Promise.all(r.map((e=>d[e]||l(e)))).then((e=>(n(...e),o)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/browser-DFS7k-QI.js",revision:null},{url:"assets/index-CASljAMu.js",revision:null},{url:"assets/index-kQJbKSsj.css",revision:null},{url:"index.html",revision:"c2c5012f5199ee42e9d72c268f1c6232"},{url:"registerSW.js",revision:"bd57fd9ab175ef520807e29b8979bc2f"},{url:"vite.svg",revision:"8e3a10e157f75ada21ab742c022d5430"},{url:"vite.svg",revision:"8e3a10e157f75ada21ab742c022d5430"},{url:"manifest.webmanifest",revision:"2038f41dfd902122208c625cd0bf6f40"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
