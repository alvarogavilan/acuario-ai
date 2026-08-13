/**
 * sw.js — Twin Engine 0.5.0
 * Build-stamped cache. HTML/JS/JSON are network-first so Safari does not
 * silently keep an obsolete renderer after GitHub Pages deploys a new build.
 */
const BUILD_ID = '__BUILD_ID__';
const CACHE = `acuario-ai-${BUILD_ID}`;
const PRECACHE = ['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(n=>n!==CACHE).map(n=>caches.delete(n)));await self.clients.claim();const clients=await self.clients.matchAll({type:'window'});for(const c of clients)c.postMessage({type:'TWIN_BUILD',build:BUILD_ID})})())});
const isFresh=url=>url.pathname.endsWith('.js')||url.pathname.endsWith('.json')||url.pathname.endsWith('.webmanifest');
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;if(req.mode==='navigate'||isFresh(url)){event.respondWith((async()=>{try{const net=await fetch(req,{cache:'no-store'});const cache=await caches.open(CACHE);cache.put(req,net.clone());return net}catch(e){return(await caches.match(req))||Response.error()}})());return}event.respondWith((async()=>{const cache=await caches.open(CACHE),hit=await cache.match(req),net=fetch(req).then(r=>{cache.put(req,r.clone());return r}).catch(()=>hit);return hit||net})())});
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
