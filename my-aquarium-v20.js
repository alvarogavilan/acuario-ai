(()=>{
'use strict';
const V='2.1';
const S=.08;
let buildId=0;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

function loadThree(){
  if(window.THREE)return Promise.resolve(window.THREE);
  return new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';s.onload=()=>ok(window.THREE);s.onerror=no;document.head.appendChild(s)});
}

function patchCopy(){
  const intro=$('.aquarium-intro'); if(!intro)return;
  const k=$('.kicker',intro),h=$('h2',intro),p=$('p:not(.kicker)',intro);
  if(k)k.textContent='MI ACUARIO · GEOMETRÍA REAL V2.1';
  if(h)h.textContent='Aquascape reconstruido desde tus fotos';
  if(p)p.textContent='La roca ya no se genera como montones aleatorios. La forma principal de cada isla, sus plataformas, huecos, alturas y voladizos se trazan desde las vistas frontal, laterales y superior con escala 82 × 40 × 39 cm.';
}

function boot(){
  patchCopy(); const host=$('#myAquarium3d'); if(!host||host.dataset.v21==='1')return;
  host.dataset.v21='1'; const id=++buildId;
  loadThree().then(T=>{if(id===buildId&&document.body.contains(host))build(host,T)}).catch(()=>{host.innerHTML='<div class="aq20-error"><b>No se pudo cargar el motor 3D.</b><span>Comprueba conexión y vuelve a abrir Mi acuario.</span></div>'});
}

function build(host,T){
  host.innerHTML='';
  const W=Math.max(320,host.clientWidth),H=Math.max(470,Math.round(W*.74));
  const scene=new T.Scene(); scene.background=new T.Color(0x06111a); scene.fog=new T.FogExp2(0x061722,.016);
  const camera=new T.PerspectiveCamera(33,W/H,.05,70); camera.position.set(0,.08,9.35);
  const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(W,H);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;renderer.shadowMap.enabled=true;host.appendChild(renderer.domElement);
  const world=new T.Group();scene.add(world);
  scene.add(new T.HemisphereLight(0xa4dfff,0x071015,1.20));
  const top=new T.DirectionalLight(0xd7efff,3.0);top.position.set(-1,5,3);top.castShadow=true;scene.add(top);
  const blue=new T.PointLight(0x315cff,13,14,1.8);blue.position.set(.1,3,1.3);scene.add(blue);

  const tankW=82*S,tankD=40*S,tankH=39*S;
  const glass=new T.MeshPhysicalMaterial({color:0xc4f3ff,transparent:true,opacity:.052,roughness:.02,transmission:.97,thickness:.03,side:T.DoubleSide});
  const water=new T.Mesh(new T.BoxGeometry(tankW-.14,tankH-.20,tankD-.14),new T.MeshPhysicalMaterial({color:0x0b607e,transparent:true,opacity:.055,roughness:.04,transmission:.86,thickness:.10}));water.position.y=.01;world.add(water);
  [-tankW/2,tankW/2].forEach(x=>{const m=new T.Mesh(new T.BoxGeometry(.028,tankH,tankD),glass);m.position.x=x;world.add(m)});
  const rear=new T.Mesh(new T.BoxGeometry(tankW,tankH,.028),glass);rear.position.z=-tankD/2;world.add(rear);
  const rimMat=new T.MeshStandardMaterial({color:0xe7e9e8,roughness:.32});
  [[tankH/2+.035,.10],[-tankH/2-.045,.12]].forEach(([y,h])=>{const m=new T.Mesh(new T.BoxGeometry(tankW+.12,h,tankD+.10),rimMat);m.position.y=y;world.add(m)});

  const sg=new T.PlaneGeometry(tankW-.18,tankD-.18,54,30),sp=sg.attributes.position;
  for(let i=0;i<sp.count;i++){const x=sp.getX(i),z=sp.getY(i);sp.setZ(i,.018*Math.sin(x*2.4)+.014*Math.cos(z*4.3)+.008*Math.sin((x-z)*7.2)+.026*Math.abs(x)/(tankW/2))}sg.computeVertexNormals();
  const sand=new T.Mesh(sg,new T.MeshStandardMaterial({color:0xd8cfb7,roughness:1}));sand.rotation.x=-Math.PI/2;sand.position.y=-1.42;sand.receiveShadow=true;world.add(sand);

  const technical=new T.Mesh(new T.BoxGeometry(.61,2.58,.17),new T.MeshStandardMaterial({color:0x11171c,roughness:.88}));technical.position.set(.04,-.04,-1.45);world.add(technical);

  const rockMats=[0x745a4d,0x685146,0x7b6154,0x5d4b43].map(c=>new T.MeshStandardMaterial({color:c,roughness:.99}));
  function poly(points,depth,z,mat=0,bevel=.06){
    const s=new T.Shape();points.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();
    const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,curveSegments:2});g.translate(0,0,-depth/2);g.computeVertexNormals();
    const m=new T.Mesh(g,rockMats[mat%rockMats.length]);m.position.z=z;m.castShadow=m.receiveShadow=true;world.add(m);return m;
  }
  function blob(x,y,z,sx,sy,sz,seed,mat=0){
    const g=new T.DodecahedronGeometry(1,2),p=g.attributes.position;for(let i=0;i<p.count;i++){const a=p.getX(i),b=p.getY(i),c=p.getZ(i);const n=1+.09*Math.sin(a*9+seed)+.06*Math.cos(b*13-seed)+.045*Math.sin(c*17+seed*.7);p.setXYZ(i,a*n,b*n,c*n)}g.computeVertexNormals();
    const m=new T.Mesh(g,rockMats[mat%4]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(seed*.07,seed*.11,seed*.04);m.castShadow=m.receiveShadow=true;world.add(m);return m;
  }
  function hole(x,y,z,sx,sy,rot=0){const m=new T.Mesh(new T.SphereGeometry(1,24,16),new T.MeshBasicMaterial({color:0x020507,transparent:true,opacity:.98}));m.position.set(x,y,z);m.scale.set(sx,sy,.06);m.rotation.z=rot;world.add(m)}
  function pores(cx,cy,cz,rx,ry,n,seed){for(let i=0;i<n;i++){const a=(i*2.399+seed)%6.283,q=.25+.72*((i*37+seed*9)%100)/100;blob(cx+Math.cos(a)*rx*q,cy+Math.sin(a)*ry*q,cz+.03*Math.sin(i),.10+.08*((i*11)%7)/7,.07+.06*((i*13)%5)/5,.09+.06*((i*17)%6)/6,seed+i,i)}}

  // IZQUIERDA: silueta frontal trazada sobre tus fotos. Base ancha, gran hueco central bajo, plataforma horizontal intermedia y corona redondeada baja.
  poly([[-3.00,-1.34],[-2.95,-1.02],[-2.70,-.92],[-2.62,-.58],[-2.42,-.46],[-2.42,-.28],[-2.78,-.18],[-2.96,-.04],[-2.95,.15],[-2.72,.27],[-2.47,.33],[-2.30,.42],[-2.04,.48],[-1.82,.55],[-1.58,.59],[-1.34,.56],[-1.10,.50],[-.92,.43],[-.69,.37],[-.49,.22],[-.40,.03],[-.24,-.02],[-.27,-.22],[-.45,-.31],[-.42,-.55],[-.28,-.69],[-.25,-.91],[-.39,-1.05],[-.65,-1.11],[-.82,-1.34]],1.16,-.30,0,.075);
  // corte visual del arco inferior real
  hole(-1.48,-1.05,.55,.53,.39,-.03);hole(-1.12,-.83,.56,.23,.19,-.08);
  // gran repisa frontal que define el perfil real
  poly([[-3.05,-.30],[-2.93,-.18],[-2.30,-.12],[-1.84,-.10],[-1.34,-.13],[-.86,-.16],[-.44,-.19],[-.32,-.30],[-.45,-.43],[-.98,-.45],[-1.48,-.42],[-2.02,-.41],[-2.60,-.43],[-2.93,-.40]],.64,.54,1,.045);
  // corona de piedras grandes, no nube aleatoria
  [[-2.49,.46,.02,.43,.28,.42,10],[-2.03,.58,-.04,.48,.30,.45,11],[-1.54,.65,-.08,.49,.31,.45,12],[-1.06,.59,-.04,.43,.29,.41,13],[-.66,.46,.00,.37,.25,.36,14],[-2.69,.25,.10,.33,.22,.31,15],[-1.79,.30,.15,.31,.22,.31,16],[-1.28,.31,.16,.31,.22,.30,17]].forEach(v=>blob(...v,2));
  pores(-1.62,.38,.18,1.12,.34,16,60);

  // DERECHA: base abierta, plataforma frontal baja a la izquierda y torre posterior alta en el tercio derecho.
  poly([[.40,-1.34],[.44,-1.10],[.63,-.94],[.72,-.70],[.60,-.56],[.44,-.46],[.41,-.26],[.60,-.13],[.91,-.13],[1.12,-.26],[1.35,-.28],[1.52,-.16],[1.65,.02],[1.66,.28],[1.78,.47],[1.94,.66],[2.03,.92],[2.20,1.14],[2.43,1.22],[2.62,1.08],[2.70,.85],[2.91,.75],[3.02,.54],[2.98,.30],[2.78,.10],[2.84,-.12],[3.02,-.29],[2.99,-.56],[2.78,-.75],[2.69,-1.03],[2.91,-1.20],[2.83,-1.34]],1.08,-.40,2,.075);
  hole(2.17,-1.03,.55,.45,.34,.06);
  // plataforma frontal real, baja y proyectada hacia el cristal
  poly([[.48,-.67],[.66,-.56],[1.08,-.50],[1.50,-.52],[1.83,-.58],[1.90,-.70],[1.72,-.82],[1.24,-.84],[.81,-.82],[.52,-.77]],.72,.55,1,.045);
  // saliente medio izquierdo visible en frontal
  poly([[.48,-.13],[.58,.00],[.86,.08],[1.10,.07],[1.28,-.02],[1.25,-.17],[1.04,-.24],[.71,-.23]],.62,.35,0,.04);
  [[1.56,.15,-.05,.40,.29,.38,30],[1.88,.43,-.10,.44,.34,.42,31],[2.18,.72,-.17,.42,.37,.39,32],[2.49,.92,-.23,.34,.31,.33,33],[2.68,.60,-.12,.31,.28,.31,34],[2.41,.32,.03,.40,.31,.38,35],[2.03,.12,.10,.39,.30,.37,36],[2.71,.08,.08,.31,.24,.30,37],[1.35,-.20,.16,.29,.22,.29,38]].forEach(v=>blob(...v,3));
  pores(2.12,.43,.12,.72,.46,13,90);

  const corMat=new T.MeshStandardMaterial({color:0x805d75,roughness:.98,transparent:true,opacity:.30});
  [[-1.86,.70,.06,.23],[2.23,1.03,-.08,.18],[1.84,.55,.16,.16],[-2.55,.20,.42,.15]].forEach(v=>{const m=new T.Mesh(new T.SphereGeometry(1,16,10),corMat);m.position.set(v[0],v[1],v[2]);m.scale.set(v[3],.025,v[3]*.72);world.add(m)});

  function pump(x,y,z,flip=false){const g=new T.Group(),d=new T.MeshStandardMaterial({color:0x10171a,roughness:.4,metalness:.2}),a=new T.MeshStandardMaterial({color:0x2d9bc9,roughness:.3});const s=new T.Mesh(new T.CylinderGeometry(.19,.19,.21,28),d);s.rotation.z=Math.PI/2;g.add(s);const h=new T.Mesh(new T.CylinderGeometry(.055,.055,.23,18),a);h.rotation.z=Math.PI/2;g.add(h);g.position.set(x,y,z);if(flip)g.rotation.y=Math.PI;world.add(g)}
  pump(-3.02,.62,-.57);pump(-3.02,.62,.04);pump(3.02,.64,-.46,true);

  function simpleFish(x,y,z,cm,color,phase,kind='generic'){
    const L=cm*S,g=new T.Group();g.userData={home:new T.Vector3(x,y,z),phase,speed:.18+.03*phase};
    const body=new T.Mesh(new T.SphereGeometry(1,32,20),new T.MeshStandardMaterial({color,roughness:.42}));body.scale.set(L*.48,L*(kind==='clown'?.23:.27),L*.13);g.add(body);
    const tail=new T.Mesh(new T.ConeGeometry(L*.16,L*.27,3),new T.MeshStandardMaterial({color,roughness:.45,side:T.DoubleSide}));tail.rotation.z=-Math.PI/2;tail.position.x=-L*.56;g.add(tail);
    if(kind==='clown'){
      const w=new T.MeshStandardMaterial({color:0xf0eee7,roughness:.48}),b=new T.MeshStandardMaterial({color:0x161719,roughness:.48});
      [.17,-.13].forEach(px=>{const o=new T.Mesh(new T.TorusGeometry(L*.112,L*.025,9,28),b);o.rotation.y=Math.PI/2;o.position.x=L*px;g.add(o);const q=new T.Mesh(new T.TorusGeometry(L*.112,L*.014,9,28),w);q.rotation.y=Math.PI/2;q.position.x=L*px;g.add(q)});
    }
    g.position.set(x,y,z);world.add(g);return g;
  }
  const fish=[simpleFish(-2.48,.32,.57,6.2,0xe76b1c,.2,'clown'),simpleFish(-2.13,.08,.28,5.2,0xe76b1c,1.1,'clown'),simpleFish(2.20,-.50,.10,8.5,0x2456d8,1.9),simpleFish(1.12,.46,-.05,6.5,0x2e4bb8,2.7)];

  const views={front:[0,.08,9.35],left:[-8.0,.12,1.8],right:[8.0,.12,1.8],top:[0,8.4,.22],free:[4.7,3.0,6.3]};
  $$('[data-aqview]').forEach(btn=>btn.addEventListener('click',()=>{$$('[data-aqview]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const v=views[btn.dataset.aqview]||views.front;camera.position.set(...v);camera.lookAt(0,-.08,0)}));camera.lookAt(0,-.08,0);
  let drag=false,px=0,py=0,yaw=0,pitch=0;renderer.domElement.addEventListener('pointerdown',e=>{drag=true;px=e.clientX;py=e.clientY;renderer.domElement.setPointerCapture?.(e.pointerId)});renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-px)*.004;pitch=Math.max(-.30,Math.min(.30,pitch+(e.clientY-py)*.003));px=e.clientX;py=e.clientY;world.rotation.y=yaw;world.rotation.x=pitch});renderer.domElement.addEventListener('pointerup',()=>drag=false);

  const badge=document.createElement('div');badge.className='aq19-calibration';badge.innerHTML='<b>V2.1 · SILUETA TRAZADA</b><span>82 × 40 × 39 cm</span>';host.appendChild(badge);
  const note=document.createElement('div');note.className='aq19-scale';note.innerHTML='<span></span><b>10 cm reales</b><small>rocas = forma fija · peces ≈ escala real</small>';host.appendChild(note);

  const clock=new T.Clock();let raf=0;function animate(){raf=requestAnimationFrame(animate);const t=clock.getElapsedTime();fish.forEach((f,i)=>{f.position.x=f.userData.home.x+Math.sin(t*f.userData.speed+f.userData.phase)*.14;f.position.y=f.userData.home.y+Math.sin(t*.55+f.userData.phase)*.045;f.rotation.y=Math.sin(t*.22+i)*.12});renderer.render(scene,camera)}animate();
  const ro=new ResizeObserver(()=>{if(!document.body.contains(host)){cancelAnimationFrame(raf);ro.disconnect();return}const nw=Math.max(320,host.clientWidth),nh=Math.max(470,Math.round(nw*.74));camera.aspect=nw/nh;camera.updateProjectionMatrix();renderer.setSize(nw,nh,false)});ro.observe(host);
}

document.addEventListener('click',e=>{if(e.target.closest('[data-view="twin"]'))setTimeout(boot,70)});
const mo=new MutationObserver(()=>{if($('#myAquarium3d'))boot()});mo.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();