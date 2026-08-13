(()=>{'use strict';
const sources={
 'Pez payaso común · pareja':['https://commons.wikimedia.org/wiki/Special:Redirect/file/Amphiprion%20ocellaris.jpg?width=900'],
 'Cirujano azul / Dory':['https://commons.wikimedia.org/wiki/Special:Redirect/file/Paracanthurus%20hepatus.JPG?width=900'],
 'Damisela azul de cola amarilla':['https://commons.wikimedia.org/wiki/Special:Redirect/file/Chrysiptera%20parasema.JPG?width=900'],
 'Caracol abeja / Engina rayada':['https://commons.wikimedia.org/wiki/Special:Redirect/file/Engina%20mendicaria%20unilineata.jpg?width=772','https://commons.wikimedia.org/wiki/Special:Redirect/file/Naturalis%20Biodiversity%20Center%20-%20RMNH.MOL.201154%20-%20Engina%20mendicaria%20(Linnaeus,%201758)%20-%20Buccinidae%20-%20Mollusc%20shell.jpeg?width=800']
};
function wire(img){const label=(img.alt||'').replace(/^Foto no disponible · /,'');const list=sources[label];if(!list||img.dataset.speciesPhoto==='ready')return;img.dataset.speciesPhoto='ready';img.referrerPolicy='no-referrer';img.loading='eager';let i=0;const next=()=>{if(i>=list.length){img.style.objectFit='contain';img.style.background='#0a222c';img.alt=`Foto no disponible · ${label}`;return}img.src=list[i++]};img.onerror=next;next()}
function apply(root=document){root.querySelectorAll?.('.life-photo img,.mini-photo img,.species-detail-photo img').forEach(wire)}
const oldShow=window.showEntity;
if(typeof oldShow==='function')window.showEntity=function(type,id){
  if(type!=='livestock')return oldShow(type,id);
  const x=state?.data?.livestock?.find(v=>v.id===id);if(!x)return oldShow(type,id);
  const dlg=document.querySelector('#entityDialog'),c=document.querySelector('#entityDialogContent');if(!dlg||!c)return;
  const count=x.countIsEstimate?`${x.countMin}–${x.countMax} estimados`:`${x.count||1} registrados`;
  c.innerHTML=`<div class="sheet-head"><div><p class="eyebrow">HABITANTE REAL</p><h2>${esc(x.commonName)}</h2></div><button class="icon-btn" id="closeEntity">×</button></div><div class="species-detail-photo life-photo" style="height:250px;border-radius:18px;overflow:hidden;margin:0 0 14px;background:#08202a">${x.image?`<img src="${esc(x.image)}" alt="${esc(x.commonName)}" style="width:100%;height:100%;object-fit:cover;display:block">`:`<div class="placeholder-fish">${x.kind==='invertebrate'?'🐌':'🐟'}</div>`}</div><div class="detail-grid"><div class="detail-stat"><small>Especie</small><strong>${esc(x.scientificName||'Pendiente')}</strong></div><div class="detail-stat"><small>Registro actual</small><strong>${esc(count)}</strong></div></div><article class="info-card"><b>Identificación y notas</b><p>${esc(x.notes||'Sin notas todavía.')}</p></article>`;
  const close=()=>{if(dlg.open)dlg.close();document.documentElement.style.overflow='';document.body.style.overflow=''};document.querySelector('#closeEntity').onclick=close;dlg.addEventListener('close',()=>{document.documentElement.style.overflow='';document.body.style.overflow=''},{once:true});dlg.showModal();apply(c);
};
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)apply(n)}).observe(document.documentElement,{subtree:true,childList:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>apply());else apply();
})();