(()=>{'use strict';
function apply(root=document){root.querySelectorAll?.('[data-species-fallback]').forEach(el=>{if(el.dataset.fallbackReady)return;el.dataset.fallbackReady='1';const src=el.dataset.speciesFallback;if(!src)return;if(el.tagName==='IMG'){el.onerror=()=>{el.onerror=null;el.src=src}}})}
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)apply(n)}).observe(document.documentElement,{subtree:true,childList:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>apply());else apply();
})();