(()=>{'use strict';
const scriptSrc=document.currentScript?.src||'';
const BUILD_ID=(()=>{try{return new URL(scriptSrc,location.href).searchParams.get('v')||'twin-dev'}catch{return'twin-dev'}})();
let active=null,seq=0;
const $=(s,r=document)=>r.querySelector(s);
async function mount(){
  const host=$('#myAquarium3d');
  if(!host||host.dataset.twinBoot===BUILD_ID)return;
  const id=++seq;
  host.dataset.twinBoot=BUILD_ID;
  try{active?.dispose?.()}catch{}
  host.innerHTML=`<div style="padding:24px;text-align:center"><div style="display:inline-block;margin-bottom:10px;padding:7px 10px;border-radius:999px;background:#0d4250;color:#8ff7f0;font:800 11px system-ui;letter-spacing:.08em">TWIN BUILD ${BUILD_ID}</div><br><b>Cargando Twin Engine 0.5.2…</b><p>Reconstruyendo urna curva, aquascape y fauna.</p></div>`;
  const intro=host.closest('section')?.previousElementSibling;
  if(intro){const k=intro.querySelector('.kicker');if(k)k.textContent=`MI ACUARIO · TWIN ENGINE 0.5.2 · ${BUILD_ID}`;const h=intro.querySelector('h2');if(h)h.textContent='Mi acuario real';const p=intro.querySelector('p:last-child');if(p)p.textContent='Reconstrucción 3D basada en tus fotografías y medidas. Geometría en calibración fotográfica activa.'}
  try{
    const mod=await import(`./twin-engine/engine.js?v=${encodeURIComponent(BUILD_ID)}`);
    if(id!==seq)return;
    host.innerHTML='';
    active=await mod.bootMyAquarium(host,`./twin-engine/aquascape.manifest.json?v=${encodeURIComponent(BUILD_ID)}`);
    const verify=document.createElement('div');
    verify.textContent=`BUILD ${BUILD_ID}`;
    verify.style.cssText='position:absolute;right:10px;bottom:10px;z-index:50;padding:6px 8px;border-radius:8px;background:rgba(0,0,0,.72);color:#7ff7ef;font:800 9px system-ui;letter-spacing:.06em;pointer-events:none';
    host.style.position='relative';host.appendChild(verify);
  }catch(e){
    console.error('[Twin Engine]',e);
    if(id!==seq)return;
    host.innerHTML=`<div style="padding:24px"><b>No se pudo cargar Twin Engine 0.5.2</b><p>${String(e?.message||e)}</p><small>BUILD ${BUILD_ID}</small></div>`;
  }
}
new MutationObserver(mount).observe(document.documentElement,{subtree:true,childList:true});
mount();
})();
