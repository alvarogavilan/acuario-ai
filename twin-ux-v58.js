(()=>{'use strict';
function patchTwin(t){if(!t||t.__ux58)return;t.__ux58=true;const canvas=t.renderer?.domElement;if(canvas){canvas.style.touchAction='none';canvas.style.cursor='grab';canvas.setAttribute('aria-label','Gemelo 3D: arrastra para girar libremente y pellizca para acercar o alejar');}
const oldAdd=t.addEquipment;t.addEquipment=(q={})=>oldAdd?.({...q,sizeCm:q.sizeCm||({wavemaker:6,pump:6,fan:12,sensor:2}[q.type]||8)});
}
function apply(){patchTwin(window.__TWIN__)}
window.addEventListener('pointerdown',apply,{passive:true});new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true});setInterval(apply,700);
})();