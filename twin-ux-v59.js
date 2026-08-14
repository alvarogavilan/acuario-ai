(()=>{'use strict';
let patched=null,raf=0;
function patch(){const t=window.__TWIN__;if(!t||t===patched)return;patched=t;cancelAnimationFrame(raf);const c=t.renderer?.domElement,cam=t.camera;if(!c||!cam)return;
  c.style.touchAction='none';c.style.cursor='grab';
  let az=0,pol=1.46,r=142,azT=0,polT=1.46,rT=142,drag=null,pinch=0,active=false;
  const target={x:0,y:16,z:-2},clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  c.addEventListener('pointerdown',e=>{active=true;c.setPointerCapture?.(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};c.style.cursor='grabbing';e.preventDefault();e.stopImmediatePropagation()},{capture:true});
  c.addEventListener('pointermove',e=>{if(!active||!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;azT-=dx*.010;polT=clamp(polT-dy*.007,.18,Math.PI-.18);e.preventDefault();e.stopImmediatePropagation()},{capture:true});
  const end=e=>{if(drag?.id===e.pointerId){drag=null;active=false;c.style.cursor='grab'}e.stopImmediatePropagation()};c.addEventListener('pointerup',end,{capture:true});c.addEventListener('pointercancel',end,{capture:true});
  c.addEventListener('wheel',e=>{rT=clamp(rT+e.deltaY*.08,86,205);e.preventDefault();e.stopImmediatePropagation()},{capture:true,passive:false});
  c.addEventListener('touchstart',e=>{if(e.touches.length===2)pinch=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)},{capture:true,passive:false});
  c.addEventListener('touchmove',e=>{if(e.touches.length!==2||!pinch)return;const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);rT=clamp(rT*pinch/d,86,205);pinch=d;e.preventDefault();e.stopImmediatePropagation()},{capture:true,passive:false});
  const oldSet=t.setView;t.setView=v=>{if(v==='front'){azT=0;polT=1.46;rT=142}else if(v==='left'){azT=-Math.PI/2;polT=1.46;rT=142}else if(v==='right'){azT=Math.PI/2;polT=1.46;rT=142}else if(v==='top'){azT=0;polT=.22;rT=136}else if(v==='home'){azT=0;polT=1.32;rT=148}else oldSet?.(v)};
  t.scene?.traverse?.(o=>{if(o?.isGroup&&Array.isArray(o.userData?.materials)){o.scale.setScalar(1.32);o.userData.visualScaleV59=1.32}});
  const loop=()=>{if(window.__TWIN__!==t)return;az+=(azT-az)*.18;pol+=(polT-pol)*.18;r+=(rT-r)*.16;const sp=Math.sin(pol);cam.position.set(target.x+r*sp*Math.sin(az),target.y+r*Math.cos(pol),target.z+r*sp*Math.cos(az));cam.lookAt(target.x,target.y,target.z);raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
}
function equipmentClicks(e){const b=e.target.closest?.('[data-twin-task]');if(!b||!window.__TWIN__)return;const t=b.dataset.twinTask;if(t==='fan'){e.preventDefault();e.stopImmediatePropagation();window.__TWIN__.previewEquipment?.('fan',[0,38.6,-11],[0,0,1],'VENTILADOR · Maqueta a escala sobre el borde superior trasero. La posición final necesita comprobar soporte y distancia a la pantalla antes de fijar.','front')}else if(t==='nero'){e.preventDefault();e.stopImmediatePropagation();window.__TWIN__.previewEquipment?.('nero',[33,22,-9],[-.96,-.04,.27],'NERO 5 · Anclada a la posición registrada de la bomba en el cristal derecho. Flecha = dirección propuesta del flujo.','front')}}
document.addEventListener('click',equipmentClicks,true);new MutationObserver(patch).observe(document.documentElement,{subtree:true,childList:true});setInterval(patch,500);window.addEventListener('load',patch);
})();