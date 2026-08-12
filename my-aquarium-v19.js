(()=>{
'use strict';
const V='1.9';
let bootToken=0;
const qs=(s,r=document)=>r.querySelector(s);
const qsa=(s,r=document)=>[...r.querySelectorAll(s)];

function patchCopy(){
  const intro=qs('.aquarium-intro');
  if(!intro)return false;
  const kicker=qs('.kicker',intro),h=qs('h2',intro),p=qs('p:not(.kicker)',intro);
  if(kicker)kicker.textContent='MI ACUARIO · MODELO 3D CALIBRADO';
  if(h)h.textContent='Tu acuario real, a escala';
  if(p)p.textContent='Reconstrucción geométrica calibrada con fotografías frontal, laterales, superior y cinta métrica. Urna, arena y aquascape quedan fijados; animales y futuros equipos se representan a escala real.';
  const badge=qs('.aq3-head > span'); if(badge)badge.textContent=`v${V} · ESCALA REAL`;
  const notice=qs('.aq3-notice');
  if(notice)notice.innerHTML='<b>Geometría maestra fijada</b><p>La escena usa 82 × 40 × 39 cm como referencia. Los dos Amphiprion ocellaris actuales se han reducido a proporción realista y ya no alteran visualmente la escala del acuario.</p>';
  return true;
}

function loadThree(){
  if(window.THREE)return Promise.resolve(window.THREE);
  return new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';s.onload=()=>ok(window.THREE);s.onerror=no;document.head.appendChild(s)});
}

function boot(){
  if(!patchCopy())return;
  const host=qs('#myAquarium3d'); if(!host||host.dataset.v19==='1')return;
  host.dataset.v19='1'; const token=++bootToken;
  setTimeout(()=>loadThree().then(T=>{if(token===bootToken&&document.body.contains(host))build(host,T)}).catch(()=>{}),80);
}

function build(host,T){
  host.innerHTML='';
  const w=Math.max(300,host.clientWidth),h=Math.max(430,Math.round(w*.76));
  const scene=new T.Scene(); scene.background=new T.Color(0x06111b); scene.fog=new T.FogExp2(0x071622,.020);
  const camera=new T.PerspectiveCamera(35,w/h,.05,80); camera.position.set(0,.22,9.35);
  const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance',alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2)); renderer.setSize(w,h); renderer.outputColorSpace=T.SRGBColorSpace; renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.10; renderer.shadowMap.enabled=true; host.appendChild(renderer.domElement);
  const root=new T.Group(); scene.add(root);
  scene.add(new T.HemisphereLight(0xa7ddff,0x061018,1.42));
  const top=new T.DirectionalLight(0xc9e9ff,3.7); top.position.set(-.8,5,3); top.castShadow=true; scene.add(top);
  const reefBlue=new T.PointLight(0x315dff,18,14,1.7); reefBlue.position.set(.3,3.1,1.5);scene.add(reefBlue);
  const fill=new T.PointLight(0x7ddaff,6.5,10,2);fill.position.set(-3,1.1,2.1);scene.add(fill);

  // Escala maestra: 82 cm = 6.56 unidades (0,08 u/cm)
  const S=.08,tankW=82*S,tankD=40*S,tankH=39*S;
  const glass=new T.MeshPhysicalMaterial({color:0xb8f4ff,transparent:true,opacity:.075,roughness:.025,transmission:.94,thickness:.045,side:T.DoubleSide});
  const water=new T.Mesh(new T.BoxGeometry(tankW-.16,tankH-.22,tankD-.16),new T.MeshPhysicalMaterial({color:0x0b6688,transparent:true,opacity:.075,roughness:.05,transmission:.78,thickness:.16}));water.position.y=.02;root.add(water);
  [-tankW/2,tankW/2].forEach(x=>{const m=new T.Mesh(new T.BoxGeometry(.035,tankH,tankD),glass);m.position.x=x;root.add(m)});
  const rear=new T.Mesh(new T.BoxGeometry(tankW,tankH,.035),glass);rear.position.z=-tankD/2;root.add(rear);
  const rimMat=new T.MeshStandardMaterial({color:0xe7e9e8,roughness:.34});
  const rimTop=new T.Mesh(new T.BoxGeometry(tankW+.12,.11,tankD+.10),rimMat);rimTop.position.y=tankH/2+.03;root.add(rimTop);
  const rimBottom=new T.Mesh(new T.BoxGeometry(tankW+.12,.13,tankD+.10),rimMat);rimBottom.position.y=-tankH/2-.04;root.add(rimBottom);

  // Arena: 3-5 cm reales, irregular como en las fotos.
  const sg=new T.PlaneGeometry(tankW-.22,tankD-.22,52,30),sp=sg.attributes.position;
  for(let i=0;i<sp.count;i++){const x=sp.getX(i),y=sp.getY(i);sp.setZ(i,.022*Math.sin(x*2.8)+.016*Math.cos(y*4.8)+.009*Math.sin((x-y)*8))}sg.computeVertexNormals();
  const sand=new T.Mesh(sg,new T.MeshStandardMaterial({color:0xd9cfb3,roughness:1}));sand.rotation.x=-Math.PI/2;sand.position.y=-1.43;sand.receiveShadow=true;root.add(sand);

  // Fondo técnico central observado en frontal y vistas superiores.
  const tech=new T.Mesh(new T.BoxGeometry(.68,2.58,.19),new T.MeshStandardMaterial({color:0x11181d,roughness:.82}));tech.position.set(.05,-.02,-1.43);root.add(tech);

  const rockMat=(seed)=>new T.MeshStandardMaterial({color:new T.Color().setHSL(.055+.012*Math.sin(seed),.24,.31+.025*Math.cos(seed)),roughness:.96,metalness:0});
  function lump(x,y,z,sx,sy,sz,seed){
    const g=new T.IcosahedronGeometry(1,3),p=g.attributes.position;
    for(let i=0;i<p.count;i++){let a=p.getX(i),b=p.getY(i),c=p.getZ(i);const n=1+.12*Math.sin(a*7+seed)+.08*Math.cos(b*10-seed)+.055*Math.sin(c*15+seed*.7);p.setXYZ(i,a*n,b*n,c*n)}g.computeVertexNormals();
    const m=new T.Mesh(g,rockMat(seed));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(seed*.09,seed*.15,seed*.06);m.castShadow=m.receiveShadow=true;root.add(m);return m;
  }
  function shelf(x,y,z,wid,dep,th,seed){
    const g=new T.BoxGeometry(wid,th,dep,5,2,5),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const a=p.getX(i),b=p.getY(i),c=p.getZ(i);p.setXYZ(i,a*(1+.04*Math.sin(c*9+seed)),b+.035*Math.sin(a*8+seed),c*(1+.05*Math.cos(a*6-seed)))}g.computeVertexNormals();
    const m=new T.Mesh(g,rockMat(seed));m.position.set(x,y,z);m.rotation.set(.02,seed*.035,.015);m.castShadow=m.receiveShadow=true;root.add(m);return m;
  }
  function darkVoid(x,y,z,sx,sy){const m=new T.Mesh(new T.SphereGeometry(1,24,16),new T.MeshBasicMaterial({color:0x05090b,transparent:true,opacity:.97}));m.position.set(x,y,z);m.scale.set(sx,sy,.08);root.add(m)}

  // ISLA IZQUIERDA. Fotos: base ancha, arco central bajo, plataforma horizontal marcada y masa superior redondeada.
  lump(-2.36,-1.10,-.18,.72,.34,.68,1); lump(-1.72,-1.08,-.14,.72,.36,.70,2); lump(-1.02,-1.10,-.12,.70,.34,.64,3); lump(-.48,-1.10,-.14,.46,.28,.54,4);
  lump(-2.18,-.73,-.13,.60,.45,.60,5); lump(-.70,-.72,-.12,.54,.43,.56,6);
  darkVoid(-1.40,-.88,.65,.47,.35); darkVoid(-1.22,-.61,.68,.28,.20);
  shelf(-1.56,-.35,.12,2.70,.82,.24,7); shelf(-.55,-.28,.18,.72,.66,.20,8);
  lump(-2.17,.05,-.18,.66,.40,.60,9);lump(-1.58,.12,-.20,.70,.42,.64,10);lump(-.96,.08,-.18,.66,.40,.62,11);lump(-.48,.02,-.17,.46,.35,.50,12);
  lump(-1.95,.48,-.27,.54,.39,.54,13);lump(-1.40,.54,-.25,.57,.42,.55,14);lump(-.86,.48,-.24,.55,.38,.53,15);lump(-.45,.35,-.18,.39,.31,.43,16);
  // voladizo frontal izquierdo visible
  shelf(-2.54,-.14,.62,1.35,.68,.18,17); shelf(-1.55,-.10,.62,1.05,.62,.17,18);

  // ISLA DERECHA. Fotos: plataforma baja frontal, columna trasera alta y apertura inferior derecha.
  lump(.66,-1.12,-.16,.55,.30,.58,30);lump(1.22,-1.10,-.18,.60,.34,.62,31);lump(1.80,-1.08,-.20,.63,.36,.64,32);lump(2.34,-1.08,-.20,.48,.31,.55,33);
  darkVoid(1.78,-.92,.67,.42,.34);
  shelf(1.14,-.53,.18,1.72,.72,.20,34);lump(2.06,-.58,-.20,.62,.45,.60,35);
  shelf(.84,-.05,.42,1.18,.68,.18,36); lump(1.55,-.08,-.28,.62,.44,.58,37);lump(2.05,-.10,-.30,.58,.45,.55,38);
  lump(1.82,.35,-.40,.58,.48,.53,39);lump(2.15,.67,-.43,.43,.43,.44,40);lump(1.70,.75,-.43,.45,.45,.45,41);lump(2.02,1.03,-.46,.35,.36,.36,42);
  shelf(.88,.28,.28,.92,.58,.16,43);

  // Bombas Nero visibles: compactas y pegadas al cristal, sin sobredimensionar.
  function pump(x,y,z,flip=1){const g=new T.Group();const shell=new T.Mesh(new T.CylinderGeometry(.22,.22,.24,28),new T.MeshStandardMaterial({color:0x10171b,roughness:.4,metalness:.35}));shell.rotation.z=Math.PI/2;g.add(shell);const hub=new T.Mesh(new T.CylinderGeometry(.07,.07,.26,18),new T.MeshStandardMaterial({color:0x39a8d9,roughness:.3,metalness:.2}));hub.rotation.z=Math.PI/2;g.add(hub);g.position.set(x,y,z);g.rotation.y=flip<0?Math.PI:0;root.add(g)}
  pump(-3.03,.63,-.55,1);pump(-3.03,.63,.10,1);pump(3.03,.66,-.45,-1);

  // Ocellaris realistas a escala: ~6 cm y ~5 cm; 1 cm = 0.08 u.
  function clownfish(x,y,z,cm,dir,phase){
    const L=cm*S,grp=new T.Group();grp.userData={phase,baseY:y};
    const orange=new T.MeshStandardMaterial({color:0xe96a18,roughness:.48});const white=new T.MeshStandardMaterial({color:0xf2efe4,roughness:.5});const black=new T.MeshStandardMaterial({color:0x15181a,roughness:.5});
    const body=new T.Mesh(new T.SphereGeometry(1,34,22),orange);body.scale.set(L*.47,L*.24,L*.13);grp.add(body);
    const head=new T.Mesh(new T.SphereGeometry(1,30,20),orange);head.position.x=L*.31;head.scale.set(L*.22,L*.22,L*.13);grp.add(head);
    const tail=new T.Mesh(new T.ConeGeometry(L*.19,L*.30,3),orange);tail.rotation.z=-Math.PI/2;tail.position.x=-L*.55;grp.add(tail);
    // bandas negras de borde + blanco central para lectura más natural
    [[.20,.105],[-.10,.095]].forEach(([px,ww])=>{const b=new T.Mesh(new T.TorusGeometry(L*.205,L*.035,10,28),black);b.rotation.y=Math.PI/2;b.position.x=L*px;grp.add(b);const q=new T.Mesh(new T.TorusGeometry(L*.205,L*.022,10,28),white);q.rotation.y=Math.PI/2;q.position.x=L*px;grp.add(q)});
    const eye=new T.Mesh(new T.SphereGeometry(L*.027,16,12),black);eye.position.set(L*.39,L*.06,L*.12);grp.add(eye);
    const fin=new T.Mesh(new T.ConeGeometry(L*.09,L*.16,3),black);fin.position.set(-L*.03,L*.19,0);fin.rotation.z=Math.PI;grp.add(fin);
    grp.position.set(x,y,z);grp.rotation.y=dir<0?Math.PI:0;root.add(grp);return grp;
  }
  const fish=[clownfish(-2.45,.42,.45,6.2,1,.2),clownfish(-2.08,.18,.16,5.2,1,1.8)];

  // Escala visual permanente.
  const scaleBar=document.createElement('div');scaleBar.className='aq19-scale';scaleBar.innerHTML='<span></span><b>10 cm reales</b><small>peces ≈ 5–6 cm</small>';host.appendChild(scaleBar);
  const cal=document.createElement('div');cal.className='aq19-calibration';cal.innerHTML='<b>CALIBRADO</b><span>82 × 40 × 39 cm</span>';host.appendChild(cal);

  const views={front:[0,.20,9.35],left:[-8.0,.18,2.0],right:[8.0,.18,2.0],top:[0,8.3,.25],free:[4.6,3.0,6.2]};
  qsa('[data-aqview]').forEach(btn=>btn.addEventListener('click',()=>{qsa('[data-aqview]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const v=views[btn.dataset.aqview]||views.front;camera.position.set(...v);camera.lookAt(0,-.05,0)}));
  camera.lookAt(0,-.05,0);

  let drag=false,px=0,py=0,yaw=0,pitch=0;
  renderer.domElement.addEventListener('pointerdown',e=>{drag=true;px=e.clientX;py=e.clientY;renderer.domElement.setPointerCapture?.(e.pointerId)});
  renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-px)*.004;pitch=Math.max(-.32,Math.min(.32,pitch+(e.clientY-py)*.003));px=e.clientX;py=e.clientY;root.rotation.y=yaw;root.rotation.x=pitch});
  renderer.domElement.addEventListener('pointerup',()=>drag=false);

  const clock=new T.Clock();let raf=0;
  function animate(){
    if(!document.body.contains(host)){cancelAnimationFrame(raf);renderer.dispose();return}
    const t=clock.getElapsedTime();fish.forEach((f,i)=>{f.position.y=f.userData.baseY+Math.sin(t*.65+f.userData.phase)*.045;f.rotation.z=Math.sin(t*.8+f.userData.phase)*.025;f.position.x+=Math.sin(t*.37+i)*.00035});
    renderer.render(scene,camera);raf=requestAnimationFrame(animate);
  }animate();
  const ro=new ResizeObserver(()=>{if(!document.body.contains(host))return;const nw=host.clientWidth,nh=Math.max(430,Math.round(nw*.76));camera.aspect=nw/nh;camera.updateProjectionMatrix();renderer.setSize(nw,nh)});ro.observe(host);
}

const obs=new MutationObserver(()=>boot());
obs.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('load',()=>setTimeout(boot,250));
})();