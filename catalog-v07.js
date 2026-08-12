// Catálogo visual v0.7 — prioriza imagen real de especie/producto y vista compacta en lista.
const AQ_PRODUCT_IMAGES={
 'filter-eheim':'https://www.aquariumproducts.nl/resize/eheim-prof-4-250_10632515715441.png/0/1100/True/eheim-buitenfilter-professionel-4plus-250.png',
 'flow-nero5':'https://cdn.shopify.com/s/files/1/0963/5420/6079/files/ai_nero_5_wave_maker_pump_5.png',
 'skimmer-tunze':'https://www.krakkingkorals.com.au/cdn/shop/files/Comline-DOC-Skimmer-9004-tunze.jpg?v=1764130033',
 'light-fluval':'https://fluvalaquatics.com/us/wp-content/uploads/2018/05/14513_Marine-3.0-LED-FLEX-32.5G.png'
};
const AQ_SPECIES_IMAGES={
 'Amphiprion ocellaris':'https://www.monaconatureencyclopedia.com/wp-content/uploads/2008/08/1-Amphiprion-ocellaris-%C2%A9-Giuseppe-Mazza.jpg',
 'Paracanthurus hepatus':'https://tonysharks.com/Tree_of_life/Eukaryote/Opisthokonta/Nanyouhagi/IMG_0123.JPG',
 'Chrysiptera parasema':'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Chrysiptera_parasema.jpg/640px-Chrysiptera_parasema.jpg'
};
function aqSpeciesImage(x){return ownPhoto?.(x.id,null)||AQ_SPECIES_IMAGES[x.scientificName]||x.image||null}
function aqProductImage(x){return AQ_PRODUCT_IMAGES[x.id]||null}
function aqImg(src,alt,cls=''){return src?`<img class="${cls}" src="${src}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer">`:`<div class="catalog-empty">Sin imagen verificada</div>`}

// Desactiva los modelos 3D sintéticos: si no existe un modelo fiel de la especie, mostramos fotografía real recortada.
window.initFish3D=function(){};

livestockCard=function(x){
 const src=aqSpeciesImage(x),sex=x.individuals?.map(i=>i.label).join(' + '),count=x.countIsEstimate?`${x.countMin}–${x.countMax}`:`${x.count}`;
 return `<button class="catalog-row life-list-row" data-entity-type="livestock" data-entity-id="${x.id}">
   <div class="catalog-thumb species-cutout">${aqImg(src,x.commonName)}</div>
   <div class="catalog-copy"><div class="catalog-title"><h3>${esc(x.commonName)}</h3><span>${count} ud.</span></div><p>${esc(x.scientificName)}</p>${sex?`<small>${esc(sex)}</small>`:''}</div><b class="catalog-chevron">›</b>
 </button>`
};
livestockMini=function(x){const src=aqSpeciesImage(x);return `<button class="mini-list-row" data-entity-type="livestock" data-entity-id="${x.id}"><div class="mini-cutout">${aqImg(src,x.commonName)}</div><div><b>${esc(x.commonName)}</b><small>${x.countIsEstimate?`${x.countMin}–${x.countMax}`:`${x.count} ud.`} · ${esc(x.scientificName)}</small></div><span>›</span></button>`};

const oldEquipmentViewV07=equipmentView;
equipmentView=function(){
 const groups=[['filtration','Filtración'],['flow','Movimiento'],['skimmer','Skimmer'],['lighting','Iluminación'],['topoff','Reposición'],['test','Medición']];
 return `<div class="page-intro"><p class="kicker">EQUIPAMIENTO</p><h2>Inventario real</h2><p>Lista compacta. Toca cualquier equipo para ver descripción, capacidades, estado y recomendación.</p></div>`+groups.map(([k,n])=>{const xs=state.data.equipment.filter(x=>x.category===k);if(!xs.length)return'';return `<div class="list-section-label">${n}</div><div class="catalog-list">${xs.map(x=>{const g=guideFor(x),src=aqProductImage(x);return `<details class="equipment-list-row"><summary><div class="catalog-thumb product-cutout">${aqImg(src,x.name)}</div><div class="catalog-copy"><div class="catalog-title"><h3>${esc(x.name)}</h3><span class="state-dot ${x.status==='broken'?'bad':x.status==='unknown'?'pending':'good'}"></span></div><p>${esc(x.model||g.title||'')}</p></div><b class="catalog-chevron">›</b></summary><div class="equipment-expand"><p>${esc(g.desc||x.notes||'')}</p>${g.specs?.length?`<div class="spec-pills">${g.specs.map(s=>`<span>${esc(s)}</span>`).join('')}</div>`:''}<h4>Qué puede hacer</h4>${(g.capabilities||[]).map(c=>`<p class="check-line">✓ ${esc(c)}</p>`).join('')}<article><small>RECOMENDACIÓN PARA TU ACUARIO</small><p>${esc(g.recommend||'')}</p></article><button class="text-btn" data-entity-type="equipment" data-entity-id="${x.id}">Abrir ficha completa ›</button></div></details>`}).join('')}</div>`}).join('')
};

// Reaplica bindings después de sustituir vistas.
const bindDynamicV07=bindDynamic;bindDynamic=function(){bindDynamicV07();document.querySelectorAll('.equipment-list-row .text-btn[data-entity-id]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();showEntity('equipment',b.dataset.entityId)})};
