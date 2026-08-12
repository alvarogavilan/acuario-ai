(()=>{
'use strict';
const V='2.0';
const S=.08;
let buildId=0;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

function loadThree(){
  if(window.THREE)return Promise.resolve(window.THREE);
  return new Promise((ok,no)=>{
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
    s.onload=()=>ok(window.THREE); s.onerror=no; document.head.appendChild(s);
  });
}

function patchCopy(){
  const intro=$('.aquarium-intro'); if(!intro)return;
  const k=$('.kicker',intro),h=$('h2',intro),p=$('p:not(.kicker)',intro);
  if(k)k.textContent='MI ACUARIO · RECONSTRUCCIÓN 3D';
  if(h)h.textContent='Tu Fluval Flex Marine 123, reconstruido';
  if(p)p.textContent='Modelo calibrado con tus fotografías frontal, laterales, superior y cinta métrica. La urna y el aquascape son la referencia fija; animales y propuestas se muestran a escala.';
}

function boot(){
  patchCopy();
  const host=$('#myAquarium3d');
  if(!host||host.dataset.v20==='1')return;
  host.dataset.v20='1';
  const id=++buildId;
  loadThree().then(T=>{if(id===buildId&&document.body.contains(host))build(host,T)}).catch(()=>{
    host.innerHTML='<div class="aq20-error"><b>No se pudo cargar el motor 3D.</b><span>Comprueba conexión y vuelve a abrir Mi acuario.</span></div>';
  });
}

function build(host,T){
  host.innerHTML='';
  const W=Math.max(320,host.clientWidth),H=Math.max(470,Math.round(W*.74));
  const scene=new T.Scene();
  scene.background=new T.Color(0x06111a);
  scene.fog=new T.FogExp2(0x061722,.018);
  const camera=new T.PerspectiveCamera(34,W/H,.05,70);
  camera.position.set(0,.15,9.25);
  const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
  renderer.setSize(W,H); renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.08;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  const world=new T.Group(); scene.add(world);

  scene.add(new T.HemisphereLight(0x9edbff,0x071015,1.25));
  const sun=new T.DirectionalLight(0xd7efff,3.2); sun.position.set(-1.2,5.2,3.4); sun.castShadow=true; scene.add(sun);
  const blue=new T.PointLight(0x315cff,15,14,1.8); blue.position.set(.2,3.1,1.4); scene.add(blue);
  const cyan=new T.PointLight(0x53cfff,5,8,2); cyan.position.set(-2.7,.9,2.1); scene.add(cyan);

  const tankW=82*S,tankD=40*S,tankH=39*S;
  const glassMat=new T.MeshPhysicalMaterial({color:0xbcefff,transparent:true,opacity:.06,roughness:.02,transmission:.96,thickness:.035,side:T.DoubleSide});
  const waterMat=new T.MeshPhysicalMaterial({color:0x0d6280,transparent:true,opacity:.07,roughness:.06,transmission:.82,thickness:.12});
  const water=new T.Mesh(new T.BoxGeometry(tankW-.13,tankH-.20,tankD-.13),waterMat); water.position.y=.01; world.add(water);
  [-tankW/2,tankW/2].forEach(x=>{const g=new T.Mesh(new T.BoxGeometry(.03,tankH,tankD),glassMat);g.position.x=x;world.add(g)});
  const back=new T.Mesh(new T.BoxGeometry(tankW,tankH,.03),glassMat); back.position.z=-tankD/2; world.add(back);
  const rimMat=new T.MeshStandardMaterial({color:0xe9eceb,roughness:.32});
  [[tankH/2+.04,.10],[-tankH/2-.05,.12]].forEach(([y,h])=>{const r=new T.Mesh(new T.BoxGeometry(tankW+.12,h,tankD+.10),rimMat);r.position.y=y;world.add(r)});

  // Sustrato realista, 3–5 cm, con ligera acumulación hacia roca y laterales.
  const sg=new T.PlaneGeometry(tankW-.18,tankD-.18,58,32),pa=sg.attributes.position;
  for(let i=0;i<pa.count;i++){
    const x=pa.getX(i),z=pa.getY(i);
    const dune=.025*Math.sin(x*2.2)+.018*Math.cos(z*4.1)+.012*Math.sin((x+z)*7.4);
    const bank=.035*(Math.abs(x)/(tankW/2)); pa.setZ(i,dune+bank);
  }
  sg.computeVertexNormals();
  const sand=new T.Mesh(sg,new T.MeshStandardMaterial({color:0xd9cfb5,roughness:1})); sand.rotation.x=-Math.PI/2; sand.position.y=-1.42; sand.receiveShadow=true; world.add(sand);

  // Panel técnico posterior central conservado tras retirar el antiguo tabique completo.
  const technical=new T.Mesh(new T.BoxGeometry(.63,2.58,.17),new T.MeshStandardMaterial({color:0x11171c,roughness:.86})); technical.position.set(.04,-.04,-1.45); world.add(technical);

  const rockMaterials=[
    new T.MeshStandardMaterial({color:0x745b4f,roughness:.98}),
    new T.MeshStandardMaterial({color:0x6d544b,roughness:.99}),
    new T.MeshStandardMaterial({color:0x806459,roughness:.98}),
    new T.MeshStandardMaterial({color:0x5f5149,roughness:1})
  ];
  function rock(x,y,z,sx,sy,sz,seed,detail=3){
    const g=new T.IcosahedronGeometry(1,detail),p=g.attributes.position;
    for(let i=0;i<p.count;i++){
      const a=p.getX(i),b=p.getY(i),c=p.getZ(i);
      const n=1+.105*Math.sin(a*8.7+seed)+.075*Math.cos(b*13.2-seed*.8)+.05*Math.sin(c*20.4+seed*1.4)+.03*Math.cos((a+b+c)*31+seed);
      p.setXYZ(i,a*n,b*n,c*n);
    }
    g.computeVertexNormals();
    const m=new T.Mesh(g,rockMaterials[Math.abs(seed)%rockMaterials.length]);
    m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(seed*.07,seed*.13,seed*.045);m.castShadow=m.receiveShadow=true;world.add(m);return m;
  }
  function shelf(x,y,z,w,d,t,seed){
    const g=new T.BoxGeometry(w,t,d,10,3,8),p=g.attributes.position;
    for(let i=0;i<p.count;i++){
      const a=p.getX(i),b=p.getY(i),c=p.getZ(i);
      p.setXYZ(i,a*(1+.045*Math.sin(c*7+seed)),b+.035*Math.sin(a*9+seed)+.018*Math.cos(c*13),c*(1+.05*Math.cos(a*6-seed)));
    }
    g.computeVertexNormals(); const m=new T.Mesh(g,rockMaterials[Math.abs(seed)%4]);
    m.position.set(x,y,z);m.rotation.set(.015,seed*.022,.01);m.castShadow=m.receiveShadow=true;world.add(m);return m;
  }
  function voidMask(x,y,z,sx,sy,rot=0){
    const m=new T.Mesh(new T.SphereGeometry(1,28,18),new T.MeshBasicMaterial({color:0x030708,transparent:true,opacity:.96}));
    m.position.set(x,y,z);m.scale.set(sx,sy,.07);m.rotation.z=rot;world.add(m);
  }
  function pebbleCloud(cx,cy,cz,rx,ry,rz,count,seed){
    for(let i=0;i<count;i++){
      const a=(i*2.399+seed)%6.283, q=((i*37+seed*11)%100)/100;
      rock(cx+Math.cos(a)*rx*q,cy+((i*17)%100)/100*ry,cz+Math.sin(a)*rz*q,.18+.09*((i*13)%7)/7,.12+.08*((i*19)%5)/5,.16+.08*((i*23)%6)/6,seed+i,2);
    }
  }

  // ISLA IZQUIERDA — calibrada a partir de frontal, lateral izquierdo, superior y huecos observados.
  rock(-2.58,-1.12,-.20,.62,.31,.62,1); rock(-2.02,-1.08,-.16,.66,.34,.67,2); rock(-1.42,-1.09,-.13,.66,.33,.65,3); rock(-.83,-1.10,-.12,.60,.32,.59,4); rock(-.38,-1.11,-.16,.40,.26,.45,5);
  rock(-2.35,-.76,-.16,.57,.42,.58,6); rock(-.70,-.76,-.13,.52,.40,.54,7);
  voidMask(-1.47,-.91,.66,.48,.34,.02); voidMask(-1.20,-.66,.67,.28,.18,-.08);
  shelf(-1.55,-.38,.11,2.82,.83,.22,8); shelf(-.48,-.30,.16,.73,.63,.18,9);
  rock(-2.25,.00,-.19,.63,.39,.59,10); rock(-1.70,.10,-.22,.68,.42,.63,11); rock(-1.10,.08,-.20,.66,.40,.61,12); rock(-.55,.02,-.18,.47,.35,.49,13);
  rock(-2.08,.42,-.28,.52,.38,.52,14); rock(-1.56,.50,-.27,.56,.42,.55,15); rock(-1.03,.48,-.25,.53,.39,.52,16); rock(-.56,.36,-.21,.40,.31,.43,17);
  shelf(-2.55,-.13,.61,1.35,.66,.16,18); shelf(-1.55,-.11,.63,1.03,.61,.15,19);
  pebbleCloud(-1.48,.33,-.25,1.18,.44,.52,18,60);

  // ISLA DERECHA — plataforma frontal baja, columna posterior alta, arco inferior derecho y saliente izquierdo.
  rock(.53,-1.12,-.18,.52,.28,.55,30); rock(1.04,-1.11,-.18,.57,.31,.59,31); rock(1.58,-1.10,-.20,.59,.34,.62,32); rock(2.12,-1.10,-.21,.57,.34,.60,33); rock(2.50,-1.10,-.20,.38,.27,.47,34);
  voidMask(1.80,-.91,.67,.42,.33,.03);
  shelf(1.08,-.54,.18,1.76,.70,.19,35); rock(2.05,-.59,-.22,.60,.44,.59,36);
  shelf(.82,-.08,.40,1.12,.66,.17,37); rock(1.48,-.09,-.30,.61,.43,.57,38); rock(2.02,-.10,-.31,.58,.44,.55,39);
  rock(1.77,.33,-.42,.56,.47,.52,40); rock(2.12,.64,-.44,.43,.42,.43,41); rock(1.69,.73,-.44,.45,.45,.45,42); rock(2.02,1.00,-.47,.34,.35,.35,43);
  shelf(.73,.26,.28,.88,.55,.15,44); pebbleCloud(1.76,.38,-.35,.76,.45,.45,13,90);

  // Mancha de coralina visual muy discreta sobre parte alta de la roca.
  const coraline=new T.MeshStandardMaterial({color:0x825f78,roughness:.96,transparent:true,opacity:.42});
  [[-1.6,.58,-.02,.28],[-2.0,.27,.18,.20],[1.82,.76,-.18,.20],[1.36,.10,.20,.16]].forEach(v=>{
    const m=new T.Mesh(new T.SphereGeometry(1,18,12),coraline);m.position.set(v[0],v[1],v[2]);m.scale.set(v[3],.035,v[3]*.75);world.add(m);
  });

  function pump(x,y,z,flip){
    const g=new T.Group(),dark=new T.MeshStandardMaterial({color:0x10171a,roughness:.38,metalness:.25}),accent=new T.MeshStandardMaterial({color:0x2a9ecf,roughness:.3});
    const shell=new T.Mesh(new T.CylinderGeometry(.20,.20,.22,30),dark);shell.rotation.z=Math.PI/2;g.add(shell);
    const face=new T.Mesh(new T.TorusGeometry(.14,.025,8,28),dark);face.rotation.y=Math.PI/2;face.position.x=.12;g.add(face);
    const hub=new T.Mesh(new T.CylinderGeometry(.055,.055,.25,18),accent);hub.rotation.z=Math.PI/2;g.add(hub);
    g.position.set(x,y,z);if(flip)g.rotation.y=Math.PI;world.add(g);
  }
  pump(-3.03,.64,-.57,false);pump(-3.03,.64,.05,false);pump(3.03,.66,-.46,true);

  function finMaterial(color,opacity=.78){return new T.MeshStandardMaterial({color,roughness:.52,transparent:true,opacity,side:T.DoubleSide});}
  function fishBody(length,height,depth,color){
    const g=new T.SphereGeometry(1,42,26);g.scale(length*.49,height*.50,depth*.50);return new T.Mesh(g,new T.MeshStandardMaterial({color,roughness:.42}));
  }
  function tailMesh(L,H,color){
    const shape=new T.Shape();shape.moveTo(0,0);shape.lineTo(-L*.22,H*.36);shape.lineTo(-L*.12,0);shape.lineTo(-L*.22,-H*.36);shape.closePath();
    const geo=new T.ShapeGeometry(shape);const m=new T.Mesh(geo,finMaterial(color));m.rotation.y=Math.PI/2;return m;
  }
  function clown(x,y,z,cm,dir,phase){
    const L=cm*S,H=L*.46,D=L*.24,g=new T.Group();g.userData={phase,home:new T.Vector3(x,y,z),speed:.22+phase*.02,range:.22};
    const orange=0xe46d1b,black=0x121416,white=0xf0eee7;
    g.add(fishBody(L,H,D,orange));
    const nose=new T.Mesh(new T.SphereGeometry(1,28,18),new T.MeshStandardMaterial({color:orange,roughness:.42}));nose.scale.set(L*.17,H*.38,D*.48);nose.position.x=L*.38;g.add(nose);
    const tail=tailMesh(L,H,orange);tail.position.x=-L*.48;g.add(tail);
    [[.18,.10],[-.12,.095]].forEach(([px,w])=>{
      const b=new T.Mesh(new T.TorusGeometry(H*.48,w*L,10,34),new T.MeshStandardMaterial({color:black,roughness:.48}));b.rotation.y=Math.PI/2;b.position.x=px*L;g.add(b);
      const q=new T.Mesh(new T.TorusGeometry(H*.48,w*L*.56,10,34),new T.MeshStandardMaterial({color:white,roughness:.50}));q.rotation.y=Math.PI/2;q.position.x=px*L;g.add(q);
    });
    const dorsal=new T.Mesh(new T.ConeGeometry(H*.18,L*.28,4),finMaterial(black,.70));dorsal.position.set(-L*.05,H*.52,0);dorsal.rotation.z=Math.PI;g.add(dorsal);
    const eye=new T.Mesh(new T.SphereGeometry(L*.026,14,10),new T.MeshStandardMaterial({color:0x050505}));eye.position.set(L*.39,H*.13,D*.46);g.add(eye);
    g.position.set(x,y,z);g.rotation.y=dir<0?Math.PI:0;world.add(g);return g;
  }
  function blueTang(x,y,z,cm,phase){
    const L=cm*S,H=L*.58,D=L*.18,g=new T.Group();g.userData={phase,home:new T.Vector3(x,y,z),speed:.16,range:.46};
    g.add(fishBody(L,H,D,0x1b63cf));
    const black=new T.Mesh(new T.SphereGeometry(1,32,20),new T.MeshStandardMaterial({color:0x10151d,roughness:.46}));black.scale.set(L*.30,H*.28,D*.52);black.position.set(-L*.05,H*.05,0);g.add(black);
    const tail=tailMesh(L,H,0xf2d53b);tail.position.x=-L*.49;g.add(tail);
    const eye=new T.Mesh(new T.SphereGeometry(L*.022,14,10),new T.MeshStandardMaterial({color:0x050505}));eye.position.set(L*.40,H*.13,D*.45);g.add(eye);
    g.position.set(x,y,z);world.add(g);return g;
  }
  function damsel(x,y,z,cm,phase){
    const L=cm*S,H=L*.52,D=L*.20,g=new T.Group();g.userData={phase,home:new T.Vector3(x,y,z),speed:.28,range:.34};
    g.add(fishBody(L,H,D,0x245fc9));const tail=tailMesh(L,H,0xf2d23a);tail.position.x=-L*.48;g.add(tail);
    g.position.set(x,y,z);world.add(g);return g;
  }

  // Habitantes actuales registrados. Tamaños visuales son aproximaciones deliberadas, no mediciones clínicas.
  const swimmers=[
    clown(-2.52,.52,.45,6.0,1,.2), clown(-2.18,.24,.12,5.0,1,1.4),
    blueTang(.72,.30,.04,9.0,2.6), damsel(1.55,.58,-.10,4.5,4.0)
  ];

  const overlay=document.createElement('div');overlay.className='aq20-overlay';
  overlay.innerHTML=`<div class="aq20-badge"><b>v${V}</b><span>82 × 40 × 39 cm</span></div><div class="aq20-scale"><i></i><b>10 cm</b><small>escala física</small></div>`;host.appendChild(overlay);

  const legend=document.createElement('div');legend.className='aq20-legend';
  legend.innerHTML='<b>Habitantes representados</b><span>2 Ocellaris · Cirujano azul · Damisela</span><small>Los tamaños de peces son estimaciones visuales; la roca y la urna son la referencia fija.</small>';
  host.appendChild(legend);

  const views={front:[0,.15,9.25],left:[-8.0,.15,1.8],right:[8.0,.15,1.8],top:[0,8.0,.18],free:[4.7,2.9,6.0]};
  function setView(name){const v=views[name]||views.front;camera.position.set(...v);camera.lookAt(0,-.08,0);world.rotation.set(0,0,0);$$('[data-aqview]').forEach(b=>b.classList.toggle('active',b.dataset.aqview===name));}
  $$('[data-aqview]').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.aqview)));
  setView('front');

  let dragging=false,lastX=0,lastY=0;
  renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture?.(e.pointerId)});
  renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;world.rotation.y+=(e.clientX-lastX)*.0038;world.rotation.x=Math.max(-.28,Math.min(.28,world.rotation.x+(e.clientY-lastY)*.0028));lastX=e.clientX;lastY=e.clientY});
  renderer.domElement.addEventListener('pointerup',()=>dragging=false);
  renderer.domElement.addEventListener('pointercancel',()=>dragging=false);

  const clock=new T.Clock(); let raf=0;
  function animate(){
    if(!document.body.contains(host)){cancelAnimationFrame(raf);renderer.dispose();return;}
    const t=clock.getElapsedTime();
    swimmers.forEach((f,i)=>{
      const u=f.userData,tt=t*u.speed+u.phase;
      f.position.x=u.home.x+Math.sin(tt*1.7)*u.range;
      f.position.y=u.home.y+Math.sin(tt*2.3+i)*.045;
      f.position.z=u.home.z+Math.cos(tt*1.2)*u.range*.36;
      const dx=Math.cos(tt*1.7);f.rotation.y=dx<0?Math.PI:0;
      f.rotation.z=Math.sin(tt*2.0)*.025;
    });
    renderer.render(scene,camera);raf=requestAnimationFrame(animate);
  }
  animate();

  const ro=new ResizeObserver(()=>{if(!document.body.contains(host))return;const w=Math.max(320,host.clientWidth),h=Math.max(470,Math.round(w*.74));camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)});ro.observe(host);
}

new MutationObserver(()=>boot()).observe(document.body,{childList:true,subtree:true});
window.addEventListener('DOMContentLoaded',boot);setTimeout(boot,120);setTimeout(boot,700);
})();