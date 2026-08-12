(()=>{
const V='1.8';
const originalRender=window.render;
const originalGo=window.go;
const navRename=()=>{
  const map={home:'Inicio',livestock:'Vida',parameters:'Mediciones',equipment:'Equipo',twin:'Mi acuario',advisor:'IA'};
  document.querySelectorAll('.nav-item').forEach(b=>{const s=b.querySelector('small');if(s&&map[b.dataset.view])s.textContent=map[b.dataset.view]});
};
function waterCopy(){
  const intro=document.querySelector('.page-intro');
  if(!intro)return;
  const kicker=intro.querySelector('.kicker'),h=intro.querySelector('h2'),p=intro.querySelector('p:not(.kicker)');
  if(kicker)kicker.textContent='MEDICIONES · CONTROL DEL ACUARIO';
  if(h)h.textContent='Mediciones';
  if(p)p.textContent='La app te pide solo lo que toca medir ahora y deja el resto en segundo plano hasta que aporte una decisión útil.';
}
function homeCopy(){
  document.querySelectorAll('[data-go="twin"] b').forEach(x=>x.textContent='Mi acuario');
  document.querySelectorAll('[data-go="twin"] small').forEach(x=>x.textContent='Recreación 3D de tu urna y tus dos islas de roca');
  document.querySelectorAll('[data-go="parameters"] b').forEach(x=>x.textContent='Mediciones');
}
function aquariumView(){return `<div class="page-intro aquarium-intro"><p class="kicker">MI ACUARIO · RECONSTRUCCIÓN 3D</p><h2>Tu Fluval Flex Marine 123</h2><p>Modelo tridimensional basado en las fotografías aportadas: urna de 82 × 40 × 39 cm, dos islas de roca independientes, arco principal izquierdo, torre derecha, fondo técnico central y equipamiento visible.</p></div>
<section class="aq3-card">
 <div class="aq3-head"><div><small>ESCENA BASE PERMANENTE</small><h3>Aquascape real reconstruido</h3></div><span>v${V} · 3D</span></div>
 <div class="aq3-toolbar" role="group" aria-label="Vista del acuario"><button data-aqview="front" class="active">Frontal</button><button data-aqview="left">Izquierda</button><button data-aqview="right">Derecha</button><button data-aqview="top">Superior</button><button data-aqview="free">Libre</button></div>
 <div id="myAquarium3d" class="my-aquarium-3d"><div class="reef3-loading">Reconstruyendo roca y urna…</div></div>
 <div class="aq3-legend"><span><i class="legend-current"></i>Actual</span><span><i class="legend-equipment"></i>Equipo</span><span><i class="legend-fixed"></i>Estructura fija</span></div>
 <div class="aq3-notice"><b>Base fijada</b><p>La urna y el hardscape no se alteran al probar candidatos. Peces, corales, invertebrados y equipos futuros se añadirán como capas simuladas sobre esta misma geometría.</p></div>
</section>
<section class="aq3-summary"><div><small>ESTRUCTURA</small><strong>2</strong><span>islas de roca</span></div><div><small>ROCA ORIGINAL</small><strong>18 kg</strong><span>AF Rock Mix</span></div><div><small>VOLUMEN NOMINAL</small><strong>123 L</strong><span>urna identificada</span></div></section>
<section class="aq3-detail"><p class="kicker">LECTURA DE LA ESCENA</p><h3>Lo que he reproducido</h3><div class="aq3-list"><article><span>01</span><div><b>Isla izquierda</b><p>Más ancha y baja, con terraza superior amplia, voladizo frontal y hueco/arco en la base.</p></div></article><article><span>02</span><div><b>Isla derecha</b><p>Más estrecha y alta, con torre posterior, repisas intermedias y cavidades para refugio.</p></div></article><article><span>03</span><div><b>Zona técnica</b><p>Columna negra central trasera, bombas de movimiento altas y calentador/equipo lateral representados sin confundirlos con roca.</p></div></article></div></section>`}
function loadThree(){if(window.THREE)return Promise.resolve();return new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
function bindAquarium(){
 const host=document.querySelector('#myAquarium3d');if(!host)return;
 loadThree().then(()=>buildAquarium(host)).catch(()=>{host.innerHTML='<div class="reef3-loading">No se pudo cargar el motor 3D. Reintenta con conexión a internet.</div>'});
}
function buildAquarium(host){
 const T=THREE;host.innerHTML='';
 const w=host.clientWidth,h=Math.max(430,Math.round(w*.78));
 const scene=new T.Scene();scene.background=new T.Color(0x06131c);scene.fog=new T.FogExp2(0x071923,.024);
 const camera=new T.PerspectiveCamera(36,w/h,.05,80);camera.position.set(0,.55,9.1);
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(w,h);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;host.appendChild(renderer.domElement);
 const root=new T.Group();scene.add(root);
 scene.add(new T.HemisphereLight(0x8edcff,0x071016,1.45));
 const key=new T.DirectionalLight(0xd8f8ff,4.4);key.position.set(-1,5,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
 const blue=new T.PointLight(0x258dff,24,16,1.8);blue.position.set(0,3,1.8);scene.add(blue);
 const fill=new T.PointLight(0x74e5ff,9,11,2);fill.position.set(-3,1.3,2.4);scene.add(fill);
 // Urna 82 x 40 x 39 cm: escalada manteniendo proporciones reales.
 const tankW=6.56,tankD=3.20,tankH=3.12;
 const waterMat=new T.MeshPhysicalMaterial({color:0x0b6e91,transparent:true,opacity:.11,roughness:.06,metalness:0,transmission:.72,thickness:.2});
 const water=new T.Mesh(new T.BoxGeometry(tankW-.18,tankH-.24,tankD-.18),waterMat);water.position.y=.03;root.add(water);
 const glassMat=new T.MeshPhysicalMaterial({color:0xb8f4ff,transparent:true,opacity:.10,roughness:.03,transmission:.9,thickness:.06,side:T.DoubleSide});
 const sideGeo=new T.BoxGeometry(.045,tankH,tankD);[-tankW/2,tankW/2].forEach(x=>{const g=new T.Mesh(sideGeo,glassMat);g.position.x=x;root.add(g)});
 const back=new T.Mesh(new T.BoxGeometry(tankW,.04,tankH),glassMat);back.rotation.x=Math.PI/2;back.position.set(0,0,-tankD/2);root.add(back);
 const frontCurve=new T.CubicBezierCurve3(new T.Vector3(-tankW/2,-tankD/2+.04,0),new T.Vector3(-2.0,-tankD/2-.32,0),new T.Vector3(2.0,-tankD/2-.32,0),new T.Vector3(tankW/2,-tankD/2+.04,0));
 const curvePts=frontCurve.getPoints(80);const frontGeom=new T.BufferGeometry().setFromPoints(curvePts);const frontLine=new T.Line(frontGeom,new T.LineBasicMaterial({color:0xaeeeff,transparent:true,opacity:.35}));frontLine.rotation.x=Math.PI/2;frontLine.position.y=-tankH/2;root.add(frontLine);
 // Marcos blancos visibles como en el Flex.
 const rimMat=new T.MeshStandardMaterial({color:0xe7eceb,roughness:.38,metalness:.05});
 const topRim=new T.Mesh(new T.BoxGeometry(tankW+.10,.12,tankD+.10),rimMat);topRim.position.y=tankH/2+.04;root.add(topRim);
 const baseRim=new T.Mesh(new T.BoxGeometry(tankW+.10,.14,tankD+.08),new T.MeshStandardMaterial({color:0xd9dfe0,roughness:.42}));baseRim.position.y=-tankH/2-.06;root.add(baseRim);
 // Arena con relieve sutil y grano.
 const sandGeo=new T.PlaneGeometry(tankW-.28,tankD-.28,48,26);const pos=sandGeo.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i);pos.setZ(i,.025*Math.sin(x*3.2)+.018*Math.cos(y*5.1)+.01*Math.sin((x+y)*7))}sandGeo.computeVertexNormals();
 const sand=new T.Mesh(sandGeo,new T.MeshStandardMaterial({color:0xd8caa7,roughness:1}));sand.rotation.x=-Math.PI/2;sand.position.y=-1.46;sand.receiveShadow=true;root.add(sand);
 const grains=[];for(let i=0;i<580;i++)grains.push((Math.random()-.5)*(tankW-.35),-1.435,(Math.random()-.5)*(tankD-.35));const grainGeo=new T.BufferGeometry();grainGeo.setAttribute('position',new T.Float32BufferAttribute(grains,3));root.add(new T.Points(grainGeo,new T.PointsMaterial({color:0xf0e4c7,size:.018,transparent:true,opacity:.55})));
 // Columna técnica central observada al fondo.
 const tech=new T.Mesh(new T.BoxGeometry(.66,2.66,.20),new T.MeshStandardMaterial({color:0x11191d,roughness:.78}));tech.position.set(.05,.03,-1.43);tech.castShadow=true;root.add(tech);
 function organicRock(x,y,z,sx,sy,sz,seed=1){
  const g=new T.IcosahedronGeometry(1,4);const p=g.attributes.position;const cols=[];
  for(let i=0;i<p.count;i++){
   let vx=p.getX(i),vy=p.getY(i),vz=p.getZ(i);const n=1+.11*Math.sin(vx*7+seed)+.08*Math.sin(vy*11-seed*.7)+.07*Math.cos(vz*13+seed*1.4)+.035*Math.sin((vx+vy+vz)*23);vx*=n;vy*=n;vz*=n;p.setXYZ(i,vx,vy,vz);
   const c=new T.Color();const shade=.40+.10*Math.sin(vx*8+vy*5+seed);c.setHSL(.07,.17,Math.max(.27,Math.min(.52,shade)));cols.push(c.r,c.g,c.b);
  }
  g.setAttribute('color',new T.Float32BufferAttribute(cols,3));g.computeVertexNormals();
  const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.96,metalness:0}));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(seed*.17,seed*.29,seed*.11);m.castShadow=m.receiveShadow=true;root.add(m);return m;
 }
 function cave(x,y,z,sx,sy,sz){const m=new T.Mesh(new T.SphereGeometry(1,30,20),new T.MeshBasicMaterial({color:0x071014,transparent:true,opacity:.95}));m.position.set(x,y,z);m.scale.set(sx,sy,sz);root.add(m);return m}
 function pore(x,y,z,s=.08){const m=new T.Mesh(new T.SphereGeometry(1,14,10),new T.MeshBasicMaterial({color:0x1c1714,transparent:true,opacity:.62}));m.position.set(x,y,z);m.scale.set(s,s*.62,.035);root.add(m)}
 // Isla izquierda: amplia, baja, terraza superior y arco inferior.
 organicRock(-2.18,-1.05,-.02,1.05,.42,.88,1.1);organicRock(-1.45,-1.03,-.05,.92,.48,.78,2.1);organicRock(-.82,-1.05,.03,.72,.38,.70,3.1);
 organicRock(-2.05,-.55,-.08,.78,.52,.70,4.1);organicRock(-1.34,-.49,.06,.88,.46,.77,5.1);organicRock(-.67,-.52,-.04,.63,.38,.62,6.1);
 organicRock(-2.02,.00,-.12,.88,.30,.72,7.1);organicRock(-1.32,.02,-.06,.82,.27,.70,8.1);organicRock(-.64,-.02,-.10,.66,.26,.58,9.1);
 organicRock(-1.78,.45,-.17,.58,.45,.56,10.1);organicRock(-1.15,.48,-.12,.64,.47,.58,11.1);organicRock(-.56,.37,-.13,.52,.36,.50,12.1);
 cave(-1.38,-.92,.64,.55,.44,.10);cave(-1.10,-.62,.72,.35,.25,.08);
 // Repisa frontal izquierda reconocible.
 organicRock(-2.33,-.12,.42,.92,.18,.48,13.3);organicRock(-1.38,-.10,.45,.86,.16,.46,14.3);organicRock(-.62,-.13,.42,.55,.15,.42,15.3);
 // Isla derecha: más alta, estrecha, con torre posterior y repisas.
 organicRock(.90,-1.08,-.02,.88,.40,.78,20.1);organicRock(1.55,-1.03,-.06,.82,.47,.72,21.1);organicRock(2.05,-.99,-.03,.62,.39,.63,22.1);
 organicRock(1.20,-.55,-.12,.76,.45,.68,23.1);organicRock(1.83,-.50,-.12,.77,.48,.68,24.1);
 organicRock(1.48,-.02,-.20,.73,.48,.62,25.1);organicRock(2.05,.02,-.18,.58,.44,.52,26.1);
 organicRock(1.72,.48,-.30,.58,.50,.49,27.1);organicRock(2.03,.84,-.38,.45,.46,.42,28.1);organicRock(1.53,.83,-.34,.42,.40,.41,29.1);
 cave(1.55,-.86,.66,.44,.36,.10);cave(1.76,-.45,.70,.28,.25,.08);
 // Repisas derechas.
 organicRock(.84,-.34,.46,.78,.16,.46,30.1);organicRock(1.44,-.30,.44,.62,.15,.42,31.1);organicRock(1.13,.18,.36,.62,.14,.40,32.1);
 // Poros/sombras para romper el aspecto geométrico.
 [[-2.4,-.52,.83],[-1.9,.25,.78],[-1.15,.55,.70],[-.72,-.33,.72],[.9,-.58,.75],[1.35,.02,.70],[1.85,.42,.64],[2.1,.76,.55],[1.55,-.9,.75]].forEach((q,i)=>pore(q[0],q[1],q[2],.06+(i%3)*.018));
 // Bombas: discos con hélice, situadas altas en laterales.
 function pump(x,y,z,side=1){const group=new T.Group();const shell=new T.Mesh(new T.CylinderGeometry(.27,.27,.28,28),new T.MeshStandardMaterial({color:0x12191d,roughness:.42,metalness:.35}));shell.rotation.z=Math.PI/2;group.add(shell);const ring=new T.Mesh(new T.TorusGeometry(.22,.035,10,32),new T.MeshStandardMaterial({color:0x2a3438,roughness:.5}));ring.rotation.y=Math.PI/2;ring.position.x=side*.15;group.add(ring);for(let i=0;i<3;i++){const blade=new T.Mesh(new T.BoxGeometry(.035,.22,.06),new T.MeshStandardMaterial({color:0x1f84b8,roughness:.3,metalness:.15}));blade.rotation.x=i*Math.PI/3;blade.rotation.z=.7;blade.position.x=side*.18;group.add(blade)}group.position.set(x,y,z);group.rotation.y=side>0?0:Math.PI;root.add(group);return group}
 pump(-3.02,.57,.50,1);pump(-2.55,.45,.36,1);pump(2.95,.62,.42,-1);
 // Calentador a la derecha trasera.
 const heater=new T.Group();const tube=new T.Mesh(new T.CylinderGeometry(.075,.075,1.62,18),new T.MeshPhysicalMaterial({color:0x8c9699,transparent:true,opacity:.52,roughness:.2,metalness:.25}));tube.position.y=-.15;heater.add(tube);const cap=new T.Mesh(new T.CylinderGeometry(.10,.10,.22,18),new T.MeshStandardMaterial({color:0x151b1f}));cap.position.y=.75;heater.add(cap);heater.position.set(2.66,-.05,-1.15);root.add(heater);
 // Peces actuales: formas 3D identificables, sin convertir propuestas en habitantes.
 function fishBody({x,y,z,color,accent,scale=.25,kind='generic',phase=0}){const g=new T.Group();const body=new T.Mesh(new T.SphereGeometry(1,28,18),new T.MeshStandardMaterial({color,roughness:.32,metalness:.03}));body.scale.set(1.7,.82,.36);g.add(body);const tailGeo=new T.BufferGeometry();tailGeo.setAttribute('position',new T.Float32BufferAttribute([-.95,0,0,-1.58,.54,0,-1.58,-.54,0],3));tailGeo.setIndex([0,1,2]);const tail=new T.Mesh(tailGeo,new T.MeshStandardMaterial({color:accent||color,side:T.DoubleSide,roughness:.4}));g.add(tail);const eye=new T.Mesh(new T.SphereGeometry(.085,12,8),new T.MeshBasicMaterial({color:0x050607}));eye.position.set(.98,.20,.28);g.add(eye);if(kind==='clown'){[-.47,.14,.58].forEach((px,i)=>{const band=new T.Mesh(new T.TorusGeometry(.56,.12,10,30),new T.MeshStandardMaterial({color:0xf4f1df,roughness:.42}));band.rotation.y=Math.PI/2;band.scale.set(.58,.88,.84);band.position.x=px;g.add(band)})}if(kind==='tang'){const patch=new T.Mesh(new T.SphereGeometry(.5,18,12),new T.MeshBasicMaterial({color:0x10151d}));patch.scale.set(.8,.34,.12);patch.position.set(.18,.02,.31);g.add(patch)}g.scale.setScalar(scale);g.position.set(x,y,z);g.userData.phase=phase;root.add(g);return g}
 const fish=[];fish.push(fishBody({x:-2.15,y:.90,z:.35,color:0xf07a21,accent:0xf07a21,scale:.34,kind:'clown',phase:0}));fish.push(fishBody({x:-1.70,y:.72,z:.22,color:0xf07a21,accent:0xf07a21,scale:.29,kind:'clown',phase:1.5}));fish.push(fishBody({x:.78,y:.56,z:.28,color:0x1768d5,accent:0xf4d22f,scale:.42,kind:'tang',phase:3}));fish.push(fishBody({x:1.92,y:.82,z:.18,color:0x176ec0,accent:0xf0d324,scale:.28,phase:4.2}));
 // Suspensión/partículas finas y caústicas simuladas.
 const pts=[];for(let i=0;i<310;i++)pts.push((Math.random()-.5)*6.2,(Math.random()*2.8)-1.35,(Math.random()-.5)*2.8);const pg=new T.BufferGeometry();pg.setAttribute('position',new T.Float32BufferAttribute(pts,3));const particles=new T.Points(pg,new T.PointsMaterial({color:0xb9efff,size:.018,transparent:true,opacity:.42}));root.add(particles);
 const surface=new T.Mesh(new T.PlaneGeometry(tankW-.25,tankD-.22,36,18),new T.MeshPhysicalMaterial({color:0x6ad5ff,transparent:true,opacity:.10,roughness:.08,transmission:.72,side:T.DoubleSide}));surface.rotation.x=-Math.PI/2;surface.position.y=1.43;root.add(surface);
 const views={front:{pos:[0,.45,9.2],look:[0,-.1,0]},left:{pos:[-7.4,.35,4.2],look:[-.25,-.1,0]},right:{pos:[7.4,.35,4.2],look:[.25,-.1,0]},top:{pos:[0,8.4,.01],look:[0,-.55,0]}};
 let mode='front',targetPos=new T.Vector3(...views.front.pos),targetLook=new T.Vector3(...views.front.look),drag=false,lastX=0,lastY=0,yaw=0,pitch=.06,dist=9.2,pinch=0;
 document.querySelectorAll('[data-aqview]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-aqview]').forEach(x=>x.classList.remove('active'));b.classList.add('active');mode=b.dataset.aqview;if(views[mode]){targetPos.set(...views[mode].pos);targetLook.set(...views[mode].look)}else{dist=8.7;yaw=.12;pitch=.06}});
 const c=renderer.domElement;c.addEventListener('pointerdown',e=>{if(mode!=='free'){mode='free';document.querySelectorAll('[data-aqview]').forEach(x=>x.classList.toggle('active',x.dataset.aqview==='free'))}drag=true;lastX=e.clientX;lastY=e.clientY;c.setPointerCapture(e.pointerId)});c.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-lastX)*.0055;pitch=Math.max(-.55,Math.min(.75,pitch+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY});c.addEventListener('pointerup',()=>drag=false);c.addEventListener('wheel',e=>{dist=Math.max(5.7,Math.min(12.5,dist+e.deltaY*.007));mode='free';e.preventDefault()},{passive:false});c.addEventListener('touchmove',e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch)dist=Math.max(5.7,Math.min(12.5,dist-(d-pinch)*.017));pinch=d;mode='free';e.preventDefault()}},{passive:false});c.addEventListener('touchend',()=>pinch=0);
 const clock=new T.Clock();
 function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();if(mode==='free'){camera.position.set(Math.sin(yaw)*Math.cos(pitch)*dist,Math.sin(pitch)*dist*.7+.2,Math.cos(yaw)*Math.cos(pitch)*dist);camera.lookAt(0,-.08,0)}else{camera.position.lerp(targetPos,.065);camera.lookAt(targetLook)}fish.forEach((f,i)=>{f.position.x+=Math.sin(t*.34+f.userData.phase+i)*.0012;f.position.y+=Math.sin(t*.85+f.userData.phase)*.0007;f.rotation.y=Math.sin(t*.28+f.userData.phase)*.28});surface.material.opacity=.085+Math.sin(t*.9)*.018;particles.rotation.y=t*.004;renderer.render(scene,camera)}animate();
 const ro=new ResizeObserver(()=>{const nw=host.clientWidth,nh=Math.max(430,Math.round(nw*.78));camera.aspect=nw/nh;camera.updateProjectionMatrix();renderer.setSize(nw,nh)});ro.observe(host);
}
window.render=function(){
 if(state?.view==='twin'){
  main.innerHTML=aquariumView();
  if(typeof bindDynamic==='function')bindDynamic();
  bindAquarium();
  if(typeof updateHealth==='function')updateHealth();
 }else{
  originalRender();
  navRename();
  if(state?.view==='parameters')waterCopy();
  if(state?.view==='home')homeCopy();
 }
 navRename();
};
// Actualiza textos inmediatamente y conserva las claves internas para no romper navegación.
navRename();
setTimeout(()=>{navRename();if(state?.view==='parameters')waterCopy();if(state?.view==='home')homeCopy()},120);
})();