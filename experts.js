const specialistTeam=[
  {id:'fish',icon:'🐠',name:'Especialista en peces',scope:'Compatibilidad, conducta, alimentación, tamaño adulto y bienestar',status:'active'},
  {id:'soft',icon:'🌿',name:'Especialista en corales blandos',scope:'Zoanthus, discosomas, sarcophyton y blandos resistentes',status:'standby'},
  {id:'lps',icon:'🪸',name:'Especialista LPS',scope:'Euphyllia, Acanthastrea, Duncan, Caulastrea y LPS',status:'standby'},
  {id:'sps',icon:'◆',name:'Especialista SPS / duros',scope:'Acropora, Montipora, estabilidad, PAR y flujo',status:'blocked'},
  {id:'water',icon:'💧',name:'Especialista en química del agua',scope:'Salinidad, NO3, PO4, KH, pH, Ca, Mg y tendencias',status:'active'},
  {id:'flow',icon:'≈',name:'Especialista en movimiento',scope:'Nero 5, zonas muertas, flujo nocturno y alimentación',status:'active'},
  {id:'light',icon:'☀',name:'Especialista en iluminación',scope:'Fluval, fotoperiodo, espectro, calor y aclimatación',status:'active'},
  {id:'thermal',icon:'🌡',name:'Especialista térmico',scope:'Verano de Sevilla, ventilación, tapa, evaporación y enfriamiento',status:'active'},
  {id:'filtration',icon:'▤',name:'Especialista en filtración',scope:'EHEIM, skimmer, detritus, mantenimiento y exportación',status:'active'},
  {id:'equipment',icon:'⚙',name:'Especialista en equipamiento y compras',scope:'Necesidad real, compatibilidad, alternativas y coste',status:'active'},
  {id:'health',icon:'✚',name:'Especialista en salud y comportamiento',scope:'Signos clínicos, estrés, apetito y observaciones',status:'active'},
  {id:'ops',icon:'✓',name:'Especialista en mantenimiento',scope:'Rutinas mínimas, cambios graduales y calendario',status:'active'}
];

const recommendedProfiles={
  nero:{
    confidence:82,
    title:'Perfil recomendado ahora · recuperación / fish-only',
    reason:'La Nero 5 tiene capacidad sobrada para 130 L y ya hay otras dos bombas sin identificar. Prioridad: flujo amplio sin castigar peces ni levantar el sustrato.',
    schedule:[
      ['00:00–08:30','Random','18%'],['08:30–10:30','Random','22%'],['10:30–19:30','Random','25%'],['19:30–22:00','Random','22%'],['22:00–00:00','Random','18%']
    ],
    feed:'Feed 5% durante 10 min',
    note:'Las otras dos bombas: dejarlas apagadas o al mínimo hasta identificarlas y revisar zonas muertas. Si aparece acumulación de detritus, ajustar dirección antes de subir potencia.',
    future:'Con LPS y estabilidad demostrada: probar 25–35% Random de día, aumentando muy gradualmente y observando pólipos/sustrato.'
  },
  light:{
    confidence:74,
    title:'Perfil recomendado ahora · reducir calor y algas',
    reason:'Sin coral activo no necesitas el pico actual prolongado. La pantalla está dentro de la tapa y el calor es un riesgo conocido; conviene un fotoperiodo más corto y azul, con blanco/rosa contenidos.',
    points:[
      ['11:00','0','0','0','0','0'],
      ['11:30','20','25','30','0','0'],
      ['12:30','55','70','75','8','2'],
      ['18:30','55','70','75','8','2'],
      ['19:30','20','25','30','2','0'],
      ['20:00','0','0','0','0','0']
    ],
    columns:['Hora','Cian','Azul','Morado','Blanco frío','Rosa'],
    note:'Sin luz lunar durante la noche. Cuando entren corales, no subir de golpe: aclimatación progresiva y, para SPS, medir PAR antes de recomendar un perfil definitivo.'
  }
};

function equipmentIllustration(x){
  const n=(x.name||'').toLowerCase();
  if(n.includes('eheim'))return `<svg viewBox="0 0 220 130" role="img" aria-label="Representación EHEIM Professionel 4+ 250"><rect x="58" y="18" width="104" height="98" rx="17" fill="#20272c"/><rect x="69" y="8" width="82" height="25" rx="10" fill="#2b353b"/><rect x="93" y="10" width="35" height="8" rx="4" fill="#df433f"/><rect x="73" y="46" width="74" height="55" rx="10" fill="#121719"/><path d="M66 24C42 6 35 28 28 49" stroke="#7d8e94" stroke-width="7" fill="none"/><path d="M154 24c24-18 31 4 38 25" stroke="#7d8e94" stroke-width="7" fill="none"/><text x="110" y="78" fill="#9fd4cf" text-anchor="middle" font-size="11">EHEIM 4+ 250</text></svg>`;
  if(n.includes('nero 5'))return `<svg viewBox="0 0 220 130"><circle cx="110" cy="65" r="47" fill="#20262b"/><circle cx="110" cy="65" r="32" fill="#090d10"/><g stroke="#4c575d" stroke-width="5">${[0,30,60,90,120,150].map(a=>`<line x1="110" y1="65" x2="${110+27*Math.cos(a*Math.PI/180)}" y2="${65+27*Math.sin(a*Math.PI/180)}"/>`).join('')}</g><circle cx="110" cy="65" r="8" fill="#303b42"/><text x="110" y="121" fill="#9fd4cf" text-anchor="middle" font-size="11">AI NERO 5</text></svg>`;
  if(n.includes('tunze'))return `<svg viewBox="0 0 220 130"><rect x="73" y="14" width="74" height="105" rx="15" fill="#11171a"/><rect x="84" y="26" width="52" height="55" rx="9" fill="#252e32"/><circle cx="110" cy="100" r="11" fill="#37464c"/><path d="M96 35h28M96 44h28M96 53h28" stroke="#596b71" stroke-width="3"/><text x="110" y="74" fill="#efefef" text-anchor="middle" font-size="10">TUNZE</text></svg>`;
  if(n.includes('fluval'))return `<svg viewBox="0 0 220 130"><rect x="25" y="44" width="170" height="18" rx="9" fill="#20282d"/><g>${[0,1,2,3,4,5,6,7,8].map(i=>`<circle cx="${42+i*17}" cy="53" r="5" fill="${i%3===0?'#526dff':i%3===1?'#7d45ff':'#d9f2ff'}"/>`).join('')}</g><path d="M45 62v34M175 62v34" stroke="#77878d" stroke-width="5"/><text x="110" y="116" fill="#9fd4cf" text-anchor="middle" font-size="11">FLUVAL MARINE</text></svg>`;
  if(n.includes('salinity'))return `<svg viewBox="0 0 220 130"><rect x="85" y="12" width="50" height="105" rx="14" fill="#e7edf0"/><rect x="94" y="28" width="32" height="29" rx="4" fill="#64777b"/><rect x="91" y="70" width="38" height="37" rx="8" fill="#169bc0"/><text x="110" y="65" fill="#20343a" text-anchor="middle" font-size="8">HANNA</text></svg>`;
  if(n.includes('hanna'))return `<svg viewBox="0 0 220 130"><rect x="76" y="28" width="68" height="76" rx="18" fill="#e9edf0"/><rect x="91" y="43" width="38" height="25" rx="4" fill="#667478"/><circle cx="110" cy="84" r="9" fill="#369fbd"/><text x="110" y="119" fill="#9fd4cf" text-anchor="middle" font-size="10">HANNA CHECKER</text></svg>`;
  return `<svg viewBox="0 0 220 130"><rect x="67" y="25" width="86" height="80" rx="20" fill="#1d2b33"/><circle cx="110" cy="65" r="22" fill="#314750"/><text x="110" y="119" fill="#9fd4cf" text-anchor="middle" font-size="10">${esc(x.name||'EQUIPO')}</text></svg>`
}

function equipmentGuide(x){const n=(x.name||'').toLowerCase();
  if(n.includes('eheim'))return {what:'Filtro externo principal. Aloja filtración mecánica y biológica y mueve agua hacia/desde el acuario.',can:['Filtración mecánica','Soporte biológico','Captura de partículas','Uso de medios químicos cuando proceda'],use:'Mantener caudal estable. Limpiar prefiltro/esponjas de forma escalonada y nunca esterilizar todo el material biológico a la vez.',recommend:'Mantenerlo. Es suficiente como base de filtración; no comprar otro filtro ahora.'};
  if(n.includes('nero 5'))return {what:'Bomba de movimiento de alto caudal y control por app.',can:['Random','Constant','Pulse','Feed','Programación 24 h'],use:'Para este 130 L usarla contenida y orientada para crear flujo ancho. Evitar chorro directo sostenido sobre animales.',recommend:'Usar el perfil recomendado por el especialista de flujo y revisar las otras bombas antes de aumentar intensidad.'};
  if(n.includes('tunze'))return {what:'Skimmer interno para exportar compuestos orgánicos mediante espuma.',can:['Oxigenación','Exportación orgánica','Apoyo a estabilidad de nutrientes'],use:'Antes de sustituir: limpiar entrada de aire, venturi, rotor y bomba; revisar profundidad y montaje.',recommend:'Diagnosticar/reparar primero. No comprar sustituto hasta confirmar avería real.'};
  if(n.includes('fluval'))return {what:'Pantalla marina programable mediante FluvalSmart.',can:['Ciclo 24 h','Amanecer/anochecer','Control independiente de canales','Perfiles guardados'],use:'Con tapa cerrada, priorizar fotoperiodo contenido para reducir carga térmica.',recommend:'Aplicar el perfil de recuperación y no optimizar para SPS hasta conocer modelo exacto y PAR.'};
  if(n.includes('hanna')||n.includes('salifert'))return {what:'Instrumento de medición para controlar la química del agua.',can:['Crear línea base','Detectar tendencias','Validar cambios antes de comprar/dosificar'],use:'Comprobar reactivos/calibración y registrar cada lectura en Agua.',recommend:'Aprovechar lo que ya tienes: no duplicar tests salvo caducidad o hueco real.'};
  return {what:'Equipo registrado del sistema.',can:['Seguimiento de estado','Historial de mantenimiento'],use:'Confirmar modelo, estado y función antes de tomar decisiones.',recommend:'No sustituir sin diagnóstico.'}}

function specialistRecommendations(){const have=state.data.parameters.filter(p=>p.latest).length;return {
  fish:{headline:'Población estable, no añadir peces',text:'Los peces actuales llevan años adaptados. Prioridad: estabilidad y confirmar compatibilidad/espacio antes de aumentar carga.'},
  soft:{headline:'Bloqueado hasta línea base',text:'Los blandos serán los primeros candidatos cuando temperatura, agua de reposición y nutrientes estén estables.'},
  lps:{headline:'Preparación, no compra',text:'Antes de LPS: línea base, skimmer/reposición y estabilidad térmica. Después se elegirá una especie de prueba.'},
  sps:{headline:'No recomendado en esta fase',text:'SPS exige más estabilidad y una validación de PAR/flujo que todavía no tenemos.'},
  water:{headline:have<4?'Analítica Día 0 pendiente':'Analítica parcial disponible',text:'Registrar primero temperatura, salinidad, PO₄ y NO₃. Con esos datos recalculamos el resto del plan.'},
  flow:{headline:'Bajar y simplificar flujo',text:'Nero 5 en Random con pico 25% y noche 18%. Mantener las otras dos bombas apagadas/al mínimo hasta identificarlas.'},
  light:{headline:'Reducir fotoperiodo y calor',text:'Perfil de recuperación 11:00–20:00, dominante azul/morado y blanco/rosa bajos. Sin luz lunar.'},
  thermal:{headline:'Temperatura es prioridad nº 1 en verano',text:'La luz dentro de la tapa suma calor. Registrar máximas diarias antes de decidir ventilación o enfriador.'},
  filtration:{headline:'Recuperar skimmer, sin limpieza agresiva',text:'EHEIM se mantiene. Diagnosticar Tunze y limpiar fondo/filtro de forma gradual, nunca todo a la vez.'},
  equipment:{headline:'Comprar solo por bloqueo real',text:'Primero inventario completo. Cada compra futura tendrá compatibilidad, coste, alternativa y confianza.'},
  health:{headline:'Vigilar conducta y apetito',text:'Registrar cambios visibles, respiración, heridas o pérdida de apetito en la ficha individual.'},
  ops:{headline:'Rutina mínima y sostenible',text:'Pequeños cambios, una zona de sustrato cada vez y mantenimiento registrado. Evitar intervenciones masivas.'}
}}

const advisorViewV05=advisorView;advisorView=function(){const rec=specialistRecommendations();return `<div class="page-intro"><p class="kicker">CONSEJO DE EXPERTOS</p><h2>Equipo Reef Intelligence</h2><p>12 especialistas independientes analizan el mismo acuario desde ángulos distintos y priorizan una decisión común.</p></div>
<article class="ai-hero"><span>CONSENSO ACTUAL</span><h3>Estabilizar antes de ampliar</h3><p>Ahora mismo el mejor avance no es comprar corales: es obtener la analítica Día 0, contener temperatura, recuperar reposición/skimmer y simplificar flujo/luz.</p><div><em>Sin compra inmediata</em><em>Revisión continua</em></div></article>
<div class="section-title"><div><p>PERFILES EXACTOS</p><h2>Luz y movimiento</h2></div></div>
${profilePanel('Nero 5',recommendedProfiles.nero)}${lightProfilePanel(recommendedProfiles.light)}
<div class="section-title"><div><p>DEPARTAMENTOS</p><h2>Especialistas</h2></div></div><div class="specialist-grid">${specialistTeam.map(s=>`<button class="specialist-card" data-specialist="${s.id}"><span>${s.icon}</span><div><b>${s.name}</b><small>${s.scope}</small><em class="${s.status}">${s.status==='active'?'ACTIVO':s.status==='blocked'?'BLOQUEADO':'EN ESPERA'}</em></div></button>`).join('')}</div><dialog id="specialistDialog" class="specialist-dialog"></dialog>`}
function profilePanel(name,p){return `<article class="profile-panel"><div class="profile-panel-head"><div><span>ESPECIALISTA MOVIMIENTO</span><h3>${name}</h3></div><b>${p.confidence}% confianza</b></div><p>${p.reason}</p><div class="schedule-list">${p.schedule.map(r=>`<div><strong>${r[0]}</strong><span>${r[1]}</span><b>${r[2]}</b></div>`).join('')}</div><div class="profile-note"><b>Feed</b><span>${p.feed}</span></div><div class="profile-note"><b>Qué hacer con las otras bombas</b><span>${p.note}</span></div></article>`}
function lightProfilePanel(p){return `<article class="profile-panel"><div class="profile-panel-head"><div><span>ESPECIALISTA ILUMINACIÓN</span><h3>Fluval · perfil recuperación</h3></div><b>${p.confidence}% confianza</b></div><p>${p.reason}</p><div class="light-table"><div class="light-row head">${p.columns.map(c=>`<b>${c}</b>`).join('')}</div>${p.points.map(r=>`<div class="light-row">${r.map((v,i)=>i===0?`<strong>${v}</strong>`:`<span>${v}%</span>`).join('')}</div>`).join('')}</div><div class="profile-note"><b>Nota</b><span>${p.note}</span></div></article>`}

const bindDynamicV05=bindDynamic;bindDynamic=function(){bindDynamicV05();document.querySelectorAll('[data-specialist]').forEach(b=>b.onclick=()=>showSpecialist(b.dataset.specialist));requestAnimationFrame(initGeneric3D)};
function showSpecialist(id){const s=specialistTeam.find(x=>x.id===id),r=specialistRecommendations()[id];if(!s||!r)return;let dlg=document.getElementById('specialistDialog');if(!dlg){dlg=document.createElement('dialog');dlg.id='specialistDialog';dlg.className='specialist-dialog';document.body.appendChild(dlg)}dlg.innerHTML=`<div class="specialist-sheet"><button class="icon-btn" id="closeSpecialist">×</button><div class="specialist-big-icon">${s.icon}</div><p class="eyebrow">${s.status==='active'?'ESPECIALISTA ACTIVO':'ESPECIALISTA'}</p><h2>${s.name}</h2><p class="specialist-scope">${s.scope}</p><article><small>RECOMENDACIÓN ACTUAL</small><h3>${r.headline}</h3><p>${r.text}</p></article><div class="info-card"><b>Cómo decide</b><p>Usa el inventario, mediciones que registres, incidencias, historial y limitaciones físicas del Reef 130 L. Si faltan datos, debe decirlo antes de recomendar una compra o un cambio fuerte.</p></div></div>`;dlg.querySelector('#closeSpecialist').onclick=()=>dlg.close();dlg.showModal()}

const equipmentViewV05=equipmentView;equipmentView=function(){const groups=[['filtration','Filtración'],['flow','Movimiento'],['skimmer','Skimmer'],['lighting','Iluminación'],['topoff','Reposición'],['test','Medición']];return `<div class="page-intro"><p class="kicker">SISTEMAS</p><h2>Equipamiento</h2><p>Cada equipo incluye representación visual, función, capacidades, uso recomendado y estado.</p></div>${groups.map(([k,n])=>{const xs=state.data.equipment.filter(x=>x.category===k);return xs.length?`<div class="section-title"><div><p>${n.toUpperCase()}</p><h2>${n}</h2></div></div><div class="equipment-pro-list">${xs.map(x=>equipmentProCard(x)).join('')}</div>`:''}).join('')}`}
function equipmentProCard(x){const g=equipmentGuide(x),bad=x.status==='broken',unknown=x.status==='unknown';return `<details class="equipment-pro"><summary><div class="equipment-visual">${equipmentIllustration(x)}</div><div class="equipment-summary"><div><h3>${esc(x.name)}</h3><p>${esc(x.model||x.category||'')}</p></div><span class="state-tag ${bad?'bad':unknown?'pending':'good'}">${bad?'AVERÍA':unknown?'REVISAR':'OK'}</span></div></summary><div class="equipment-detail"><p>${g.what}</p><div class="capability-chips">${g.can.map(v=>`<span>${v}</span>`).join('')}</div><article><small>USO RECOMENDADO</small><p>${g.use}</p></article><article class="recommend-box"><small>DECISIÓN DEL ESPECIALISTA</small><p>${g.recommend}</p></article><button class="text-btn" data-entity-type="equipment" data-entity-id="${x.id}">Abrir ficha técnica ›</button></div></details>`}

const livestockCardV05=livestockCard;livestockCard=function(x){return `<div class="life-card-wrap"><div class="generic-3d" data-fish3d="${x.id}" data-species="${esc(x.scientificName)}"><canvas></canvas><span>MODELO 3D BASE · arrastra para girar</span></div>${livestockCardV05(x)}</div>`}

function initGeneric3D(){if(!window.THREE)return;document.querySelectorAll('.generic-3d:not([data-ready])').forEach(holder=>{holder.dataset.ready='1';const canvas=holder.querySelector('canvas'),w=holder.clientWidth||320,h=165,renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(w,h,false);const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,w/h,.1,100);camera.position.set(0,0,5);const light=new THREE.HemisphereLight(0xffffff,0x153347,2.4);scene.add(light);const group=new THREE.Group();scene.add(group);const sp=(holder.dataset.species||'').toLowerCase();
let bodyColor=0x2476d9,tailColor=0xf1c62b,bodyScale=[1.35,.72,.42];if(sp.includes('amphiprion')){bodyColor=0xf07a1f;tailColor=0xf07a1f;bodyScale=[1.35,.72,.48]}if(sp.includes('paracanthurus')){bodyColor=0x2064df;tailColor=0xf2d129;bodyScale=[1.45,.85,.38]}if(sp.includes('chrysiptera')){bodyColor=0x254ee8;tailColor=0xf4d02c;bodyScale=[1.2,.62,.36]}if(sp.includes('snail')||sp.includes('engina')){const shell=new THREE.Mesh(new THREE.SphereGeometry(.78,32,24),new THREE.MeshStandardMaterial({color:0x2c241e,roughness:.65}));shell.scale.set(1,.85,.55);group.add(shell);const foot=new THREE.Mesh(new THREE.SphereGeometry(.4,24,16),new THREE.MeshStandardMaterial({color:0x594536}));foot.position.set(.65,-.25,0);foot.scale.set(1.4,.45,.5);group.add(foot)}else{const body=new THREE.Mesh(new THREE.SphereGeometry(1,40,28),new THREE.MeshStandardMaterial({color:bodyColor,roughness:.38,metalness:.04}));body.scale.set(...bodyScale);group.add(body);const tail=new THREE.Mesh(new THREE.ConeGeometry(.68,.9,3),new THREE.MeshStandardMaterial({color:tailColor,roughness:.45}));tail.rotation.z=-Math.PI/2;tail.position.x=-1.65;tail.scale.z=.45;group.add(tail);const fin=new THREE.Mesh(new THREE.ConeGeometry(.38,.8,3),new THREE.MeshStandardMaterial({color:bodyColor}));fin.position.set(0,-.65,0);fin.rotation.z=Math.PI;fin.scale.z=.25;group.add(fin);const eyeMat=new THREE.MeshBasicMaterial({color:0x050505});const eye=new THREE.Mesh(new THREE.SphereGeometry(.07,16,12),eyeMat);eye.position.set(1.13,.22,.35);group.add(eye);if(sp.includes('amphiprion')){[-.55,.15,.7].forEach(x=>{const band=new THREE.Mesh(new THREE.TorusGeometry(.42,.11,10,28),new THREE.MeshStandardMaterial({color:0xf6f6ee}));band.rotation.y=Math.PI/2;band.position.x=x;band.scale.set(1,1.45,1);group.add(band)})}}
group.rotation.x=.08;let dragging=false,lastX=0;holder.onpointerdown=e=>{dragging=true;lastX=e.clientX;holder.setPointerCapture(e.pointerId)};holder.onpointermove=e=>{if(!dragging)return;group.rotation.y+=(e.clientX-lastX)*.012;lastX=e.clientX};holder.onpointerup=()=>dragging=false;let t=0;function loop(){if(!document.body.contains(holder))return;requestAnimationFrame(loop);if(!dragging){t+=.006;group.rotation.y+=.002}renderer.render(scene,camera)}loop()})}
