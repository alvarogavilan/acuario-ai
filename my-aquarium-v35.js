(()=>{'use strict';
const scriptSrc=document.currentScript?.src||'';
const BUILD_ID=(()=>{try{return new URL(scriptSrc,location.href).searchParams.get('v')||'twin-dev'}catch{return'twin-dev'}})();
const HOST_ID='myAquariumTwinCanonical';
let active=null,seq=0;
const $=(s,r=document)=>r.querySelector(s);

function canonicalTwinView(){
  return `<div class="page-intro" data-canonical-twin="1">
    <p class="kicker">MI ACUARIO · TWIN ENGINE 0.5.2</p>
    <h2>Mi acuario real</h2>
    <p>Gemelo digital aislado de los renderers antiguos. Reconstrucción basada en tus fotografías, medidas y urna Fluval Flex Marine 123 con frontal curvo.</p>
  </div>
  <section class="info-card" data-canonical-twin="1" style="padding:0;overflow:hidden;position:relative">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;background:#082630;border-bottom:1px solid rgba(112,245,236,.22)">
      <div><small style="display:block;color:#72efe8;font-weight:800;letter-spacing:.1em">RENDERER CANÓNICO</small><b style="color:#fff">TWIN BUILD ${BUILD_ID}</b></div>
      <span style="padding:6px 9px;border-radius:999px;background:#123d36;color:#7cf5b0;font:800 10px system-ui">NUEVO MOTOR</span>
    </div>
    <div id="${HOST_ID}" style="min-height:560px;position:relative;background:#06131d">
      <div style="padding:32px 20px;text-align:center;color:#dff7fb"><b>Cargando Twin Engine 0.5.2…</b><p style="opacity:.7">Urna curva · aquascape recalibrado · fauna específica</p></div>
    </div>
    <div class="twin-cam-bar" role="group" aria-label="Vistas de cámara">
      <button type="button" data-twin-view="home">⟲</button>
      <button type="button" data-twin-view="front">Frontal</button>
      <button type="button" data-twin-view="left">Izq.</button>
      <button type="button" data-twin-view="right">Der.</button>
      <button type="button" data-twin-view="top">Superior</button>
    </div>
  </section>`;
}

async function mount(){
  const host=document.getElementById(HOST_ID);
  if(!host||host.dataset.twinBoot===BUILD_ID)return;
  const id=++seq;
  host.dataset.twinBoot=BUILD_ID;
  try{active?.dispose?.()}catch{}
  try{
    const mod=await import(`./twin-engine/engine.js?v=${encodeURIComponent(BUILD_ID)}`);
    if(id!==seq||!document.body.contains(host))return;
    host.innerHTML='';
    active=await mod.bootMyAquarium(host,`./twin-engine/aquascape.manifest.json?v=${encodeURIComponent(BUILD_ID)}`);
    const verify=document.createElement('div');
    verify.textContent=`CANONICAL · ${BUILD_ID}`;
    verify.style.cssText='position:absolute;right:10px;bottom:10px;z-index:100;padding:6px 8px;border-radius:8px;background:rgba(0,0,0,.78);color:#7ff7ef;font:800 9px system-ui;letter-spacing:.06em;pointer-events:none';
    host.style.position='relative';
    host.appendChild(verify);
  }catch(e){
    console.error('[Canonical Twin]',e);
    if(id!==seq)return;
    host.innerHTML=`<div style="padding:28px;color:#fff"><b>No se pudo cargar el renderer canónico.</b><p>${String(e?.message||e)}</p><small>${BUILD_ID}</small></div>`;
  }
}

// El proyecto arrastraba varios renderers históricos que redefinían render().
// Este script se carga el último y toma posesión exclusiva de la vista twin.
const previousRender=typeof render==='function'?render:null;
if(previousRender){
  render=function(){
    if(typeof state!=='undefined'&&state.view==='twin'){
      try{active?.dispose?.()}catch{}
      if(typeof main!=='undefined'&&main){
        main.innerHTML=canonicalTwinView();
        if(typeof bindDynamic==='function')bindDynamic();
        if(typeof updateHealth==='function')updateHealth();
        requestAnimationFrame(mount);
      }
      return;
    }
    return previousRender();
  };
  window.render=render;
}

// Si un observer legado intenta repintar la vista, restauramos el host canónico.
new MutationObserver(()=>{
  if(typeof state!=='undefined'&&state.view==='twin'){
    const canonical=document.querySelector('[data-canonical-twin="1"]');
    if(!canonical&&typeof main!=='undefined'&&main){
      main.innerHTML=canonicalTwinView();
      if(typeof bindDynamic==='function')bindDynamic();
    }
    mount();
  }
}).observe(document.documentElement,{subtree:true,childList:true});

// En una navegación ya abierta en twin, fuerza la primera sustitución.
if(typeof state!=='undefined'&&state.view==='twin'&&typeof render==='function')render();
})();
