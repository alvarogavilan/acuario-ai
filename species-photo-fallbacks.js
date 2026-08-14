(()=>{'use strict';
const sources={
 'Pez payaso común · pareja':['https://commons.wikimedia.org/wiki/Special:Redirect/file/Amphiprion%20ocellaris.jpg?width=900'],
 'Cirujano azul / Dory':['https://commons.wikimedia.org/wiki/Special:Redirect/file/Paracanthurus%20hepatus.JPG?width=900'],
 'Damisela azul de cola amarilla':['https://commons.wikimedia.org/wiki/Special:Redirect/file/Chrysiptera%20parasema.JPG?width=900'],
 'Caracol abeja / Engina rayada':['https://commons.wikimedia.org/wiki/Special:Redirect/file/Engina%20mendicaria%20unilineata.jpg?width=772','https://commons.wikimedia.org/wiki/Special:Redirect/file/Naturalis%20Biodiversity%20Center%20-%20RMNH.MOL.201154%20-%20Engina%20mendicaria%20(Linnaeus,%201758)%20-%20Buccinidae%20-%20Mollusc%20shell.jpeg?width=800']
};
const scientific={
 'Amphiprion ocellaris':'Pez payaso común · pareja',
 'Paracanthurus hepatus':'Cirujano azul / Dory',
 'Chrysiptera parasema':'Damisela azul de cola amarilla',
 'Engina mendicaria':'Caracol abeja / Engina rayada'
};
function animalFrom(el){const card=el.closest?.('[data-entity-type="livestock"][data-entity-id]');if(!card)return null;return window.state?.data?.livestock?.find(v=>v.id===card.dataset.entityId)||null}
function listFor(label,animal){return sources[label]||sources[animal?.commonName]||sources[scientific[animal?.scientificName]]||[]}
function wire(img,animal=null){const label=(img.alt||animal?.commonName||'').replace(/^Foto no disponible · /,'');const list=listFor(label,animal);if(!list.length||img.dataset.speciesPhoto==='ready')return;img.dataset.speciesPhoto='ready';img.referrerPolicy='no-referrer';img.loading='eager';img.decoding='async';img.style.objectFit='cover';let i=0;const next=()=>{if(i>=list.length){img.style.objectFit='contain';img.style.background='#0a222c';img.alt=`Foto no disponible · ${label}`;return}img.src=list[i++]};img.onerror=next;next()}
function ensurePhoto(holder){const animal=animalFrom(holder);const label=animal?.commonName;const list=listFor(label,animal);let img=holder.querySelector('img');if(!img&&list.length){img=document.createElement('img');img.alt=label||animal?.scientificName||'Habitante';img.style.cssText='width:100%;height:100%;object-fit:cover;display:block';const placeholder=holder.querySelector('.placeholder-fish,span:not(.count-badge):not(em)');if(placeholder)placeholder.replaceWith(img);else holder.prepend(img)}if(img)wire(img,animal)}
function apply(root=document){root.querySelectorAll?.('.life-photo,.mini-photo,.species-detail-photo').forEach(ensurePhoto);root.querySelectorAll?.('.life-photo img,.mini-photo img,.species-detail-photo img').forEach(img=>wire(img,animalFrom(img)))}
const oldShow=window.showEntity;
if(typeof oldShow==='function')window.showEntity=function(type,id){
  if(type!=='livestock')return oldShow(type,id);
  const x=state?.data?.livestock?.find(v=>v.id===id);if(!x)return oldShow(type,id);
  const dlg=document.querySelector('#entityDialog'),c=document.querySelector('#entityDialogContent');if(!dlg||!c)return;
  const count=x.countIsEstimate?`${x.countMin}–${x.countMax} estimados`:`${x.count||1} registrados`;
  const first=listFor(x.commonName,x)[0]||x.image||'';
  c.innerHTML=`<div class="sheet-head"><div><p class="eyebrow">HABITANTE REAL</p><h2>${esc(x.commonName)}</h2></div><button class="icon-btn" id="closeEntity">×</button></div><div class="species-detail-photo life-photo" data-entity-type="livestock" data-entity-id="${esc(x.id)}" style="height:250px;border-radius:18px;overflow:hidden;margin:0 0 14px;background:#08202a">${first?`<img src="${esc(first)}" alt="${esc(x.commonName)}" style="width:100%;height:100%;object-fit:cover;display:block">`:`<div class="placeholder-fish">${x.kind==='invertebrate'?'🐌':'🐟'}</div>`}</div><div class="detail-grid"><div class="detail-stat"><small>Especie</small><strong>${esc(x.scientificName||'Pendiente')}</strong></div><div class="detail-stat"><small>Registro actual</small><strong>${esc(count)}</strong></div></div><article class="info-card"><b>Identificación y notas</b><p>${esc(x.notes||'Sin notas todavía.')}</p></article>`;
  const close=()=>{if(dlg.open)dlg.close();document.documentElement.style.overflow='';document.body.style.overflow=''};document.querySelector('#closeEntity').onclick=close;dlg.addEventListener('close',()=>{document.documentElement.style.overflow='';document.body.style.overflow=''},{once:true});dlg.showModal();apply(c);
};
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)apply(n)}).observe(document.documentElement,{subtree:true,childList:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>apply());else apply();
window.AQUARIUM_SPECIES_PHOTOS={version:52,apply};
})();