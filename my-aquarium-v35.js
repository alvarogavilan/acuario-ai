(()=>{'use strict';
const BUILD_ID='twin-0.5.2-iosfix-20260813';
let active=null,seq=0;
const $=(s,r=document)=>r.querySelector(s);
async function mount(){
  const host=$('#myAquarium3d');
  if(!host||host.dataset.twinBoot===BUILD_ID)return;
  const id=++seq;
  host.dataset.twinBoot=BUILD_ID;
  try{active?.dispose?.()}catch{}
  host.innerHTML='<div style="padding:28px;text-align:center"><b>Cargando Twin Engine 0.5.2…</b><p>Reconstruyendo urna curva, aquascape y fauna.</p></div>';
  const intro=host.closest('section')?.previousElementSibling;
  if(intro){const k=intro.querySelector('.kicker');if(k)k.textContent='MI ACUARIO · TWIN ENGINE 0.5.2';const h=intro.querySelector('h2');if(h)h.textContent='Mi acuario real';const p=intro.querySelector('p:last-child');if(p)p.textContent='Reconstrucción 3D basada en tus fotografías y medidas. La geometría actual está marcada como foto-estimación hasta completar calibración ortogonal.'}
  try{
    const mod=await import(`./twin-engine/engine.js?v=${BUILD_ID}`);
    if(id!==seq)return;
    host.innerHTML='';
    active=await mod.bootMyAquarium(host,`./twin-engine/aquascape.manifest.json?v=${BUILD_ID}`);
  }catch(e){
    console.error('[Twin Engine]',e);
    if(id!==seq)return;
    host.innerHTML=`<div style="padding:24px"><b>No se pudo cargar Twin Engine 0.5.2</b><p>${String(e?.message||e)}</p></div>`;
  }
}
new MutationObserver(mount).observe(document.documentElement,{subtree:true,childList:true});
mount();
})();
