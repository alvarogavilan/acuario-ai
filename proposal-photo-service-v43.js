(()=>{'use strict';
const CACHE_KEY='acuario-ai-species-photo-cache-v43';let cache={};try{cache=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')}catch{}
const pending=new Map();
function save(){try{localStorage.setItem(CACHE_KEY,JSON.stringify(cache))}catch{}}
function queryUrl(name){return `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&pithumbsize=900&redirects=1&titles=${encodeURIComponent(name)}`}
async function resolve(scientific){if(!scientific)return null;if(cache[scientific]!==undefined)return cache[scientific]||null;if(pending.has(scientific))return pending.get(scientific);const p=(async()=>{try{const r=await fetch(queryUrl(scientific),{mode:'cors',cache:'force-cache'});if(!r.ok)throw new Error(String(r.status));const j=await r.json(),pages=j?.query?.pages||{},page=Object.values(pages)[0],src=page?.thumbnail?.source||null;cache[scientific]=src||'';save();return src}catch(e){console.warn('[Species photos]',scientific,e);cache[scientific]='';save();return null}finally{pending.delete(scientific)}})();pending.set(scientific,p);return p}
async function hydrate(root=document){const imgs=root.querySelectorAll?.('img[data-species-photo]')||[];for(const img of imgs){if(img.dataset.photoHydrated==='1')continue;img.dataset.photoHydrated='1';const scientific=img.dataset.speciesPhoto,src=await resolve(scientific);if(src){img.referrerPolicy='no-referrer';img.src=src;img.classList.add('photo-loaded')}else{img.closest?.('.proposal-photo')?.classList.add('photo-missing')}}}
window.AcuarioSpeciesPhotos={resolve,hydrate};
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)hydrate(n)}).observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>hydrate());else hydrate();
})();