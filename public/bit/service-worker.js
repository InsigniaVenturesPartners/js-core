if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise((async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()}))),s.then((()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]}))},s=(s,r)=>{Promise.all(s.map(e)).then((e=>r(1===e.length?e[0]:e)))},r={require:Promise.resolve(s)};self.define=(s,i,t)=>{r[s]||(r[s]=Promise.resolve().then((()=>{let r={};const c={uri:location.origin+s.slice(1)};return Promise.all(i.map((s=>{switch(s){case"exports":return r;case"module":return c;default:return e(s)}}))).then((e=>{const s=t(...e);return r.default||(r.default=s),r}))})))}}define("./service-worker.js",["./workbox-c210816f"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.clientsClaim(),e.precacheAndRoute([{url:"/index.html",revision:"81b786ac034097e2abf46f5ad33433c7"},{url:"/static/css/789.ad3e2d0b.css",revision:null},{url:"/static/js/789.c0cd05dc.js",revision:null},{url:"/static/js/789.c0cd05dc.js.LICENSE.txt",revision:"5c0432266b15cfd12ce3cbc0ba259411"},{url:"/static/js/main.d56ff689.js",revision:null},{url:"/static/js/runtime-main.5c1f89f3.js",revision:null}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("public/index.html"),{denylist:[/^\/_/,/\/[^/?]+\.[^/]+$/]}))}));