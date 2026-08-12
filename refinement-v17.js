(()=>{
const VERIFY='12/08/2026';
const SHIPPING={masterfisch:p=>p>150?0:p>=100?25:29,cetamar:()=>0};
const SELLER_LABEL={MasterFisch:'Entrega a 41020',Cetamar:'Recogida presencial · 0 €'};
function euros(v){return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(v)}
function currentDue(){
  const latest=k=>[...state.measurements].reverse().find(x=>x.key===k);
  const age=x=>x?(Date.now()-new Date(x.at).getTime())/86400000:Infinity;
  const cfg=[
    ['temperature','Temperatura',1,'Hoy','Seguridad térmica y base para decidir refrigeración.'],
    ['salinity','Salinidad',3,'Hoy','Necesaria antes y después de cualquier cambio de agua.'],
    ['nitrate','Nitrato NO₃',7,'Esta semana','Define tendencia nutritiva y ayuda a decidir cambio de agua.'],
    ['phosphate','Fosfato PO₄',7,'Esta semana','Se interpreta junto con NO₃; evita dosificar a ciegas.']
  ];
  return cfg.filter(x=>age(latest(x[0]))>x[2]).map((x,i)=>({key:x[0],name:x[1],when:x[3],why:x[4],order:i+1}));
}
function notificationSupport(){return 'Notification' in window}
async function enableNotices(btn){
  if(!notificationSupport()){btn.textContent='No compatible en este navegador';return}
  const p=await Notification.requestPermission();
  localStorage.setItem('aq_notice_permission',p);
  btn.textContent=p==='granted'?'Avisos activados':'Permiso no concedido';
  if(p==='granted')new Notification('Acuario AI',{body:'Avisos activados. La agenda te mostrará primero lo realmente prioritario.'});
}
function agendaPanel(){
  const due=currentDue();
  return `<section class="director-card aq-v17-agenda"><small>AGENDA DIARIA · PRIORIDAD REAL</small><h3>${due.length?`${due.length} tareas que sí importan ahora`:'Prioridades al día'}</h3><p>${due.length?'No te pediré KH, Ca o Mg por rutina mientras no sean necesarios para una decisión.':'No necesitas medir todo. La app volverá a priorizar cuando venza una medición.'}</p><div class="priority-list">${due.map(x=>`<button class="priority-task" data-v17-measure="${x.key}"><span>${x.order}</span><div><b>${x.name}</b><small>${x.when} · ${x.why}</small></div><em>Registrar ›</em></button>`).join('')||'<div class="blocked-note">Observación visual + estabilidad. Sin compras correctoras a ciegas.</div>'}</div><button class="text-btn" id="aqEnableNotices">${localStorage.getItem('aq_notice_permission')==='granted'?'Avisos del iPhone activados':'Activar avisos del iPhone'}</button><small>Los avisos automáticos con la app completamente cerrada requieren la capa Web Push del servidor; esta versión ya deja preparada la agenda y permiso del dispositivo sin prometer notificaciones que iOS no pueda ejecutar.</small></section>`;
}
function injectAgenda(){
  if(!main)return;
  if(!['home','parameters'].includes(state.view))return;
  if(main.querySelector('.aq-v17-agenda'))return;
  const wrap=document.createElement('div');wrap.innerHTML=agendaPanel();
  const node=wrap.firstElementChild;
  if(state.view==='home')main.insertBefore(node,main.children[1]||null);else main.insertBefore(node,main.firstChild?.nextSibling||null);
  node.querySelectorAll('[data-v17-measure]').forEach(b=>b.onclick=()=>{$('#measurementType').value=b.dataset.v17Measure;$('#measurementDialog').showModal()});
  const n=node.querySelector('#aqEnableNotices');if(n)n.onclick=()=>enableNotices(n);
}
function sellerCostCard(shop,price){
  const key=shop.toLowerCase();
  const ship=key.includes('master')?SHIPPING.masterfisch(price):key.includes('cetamar')?0:null;
  if(ship==null)return '';
  return `<div class="detail-grid aq-v17-total"><div class="detail-stat"><small>${SELLER_LABEL[shop]||'Coste logístico'}</small><strong>${ship===0?'0 €':euros(ship)}</strong></div><div class="detail-stat"><small>Coste total si compras solo esto</small><strong>${euros(price+ship)}</strong></div></div><small>${shop==='MasterFisch'?'Regla verificada: 29 € hasta 100 €, 25 € entre 100–150 €, gratis por encima de 150 €.':'Para ti se prioriza recogida presencial en Cetamar, por tanto portes 0 €.'} Verificado ${VERIFY}.</small>`;
}
function enrichMarketDialog(){
  const c=document.querySelector('#entityDialogContent');if(!c||c.dataset.v17==='1')return;
  const title=c.querySelector('.sheet-head h2')?.textContent?.trim();if(!title)return;
  c.dataset.v17='1';
  [...c.querySelectorAll('article.info-card')].forEach(card=>{
    const txt=card.textContent||'';
    const shop=txt.includes('MasterFisch')?'MasterFisch':txt.includes('Cetamar')?'Cetamar':null;
    if(!shop)return;
    const m=txt.match(/(\d+[\.,]\d{2})\s*€/);if(!m)return;
    const price=Number(m[1].replace(',','.'));
    if(!Number.isFinite(price)||card.querySelector('.aq-v17-total'))return;
    const box=document.createElement('div');box.innerHTML=sellerCostCard(shop,price);while(box.firstChild)card.appendChild(box.firstChild);
  });
  const image=c.querySelector('#proposalPhoto img');
  if(image){image.style.objectFit='contain';image.style.background='transparent'}
}
function cleanProposalGroups(){
  if(state.view!=='proposals')return;
  main.querySelectorAll('.proposal-group').forEach(g=>{const s=g.querySelector('summary b')?.textContent||'';if(/Equipos de limpieza/i.test(s))g.remove()});
}
const oldRender=window.render;
window.render=function(){oldRender();requestAnimationFrame(()=>{injectAgenda();cleanProposalGroups()})};
const obs=new MutationObserver(()=>{const d=document.querySelector('#entityDialog');if(d?.open)enrichMarketDialog()});
obs.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('load',()=>{injectAgenda();cleanProposalGroups()});
})();