import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';
import {TWIN_ENGINE_VERSION,BUILD_SHA} from './version.js';
import {buildTank,footprintPath} from './tank.js';
import {buildAquascape} from './aquascape.js';
import {RENDERERS,Swimmer} from './fauna.js';
import {speciesRenderStatus,hasRenderer} from './species-registry.js';
import {buildTankBoxHelper,makeEntityMarker,makeDebugPanel} from './debug.js';

function detectQuality(){const dpr=devicePixelRatio||1,mem=navigator.deviceMemory||4,mobile=/iPhone|iPad|Android/i.test(navigator.userAgent);if(!mobile&&mem>=8)return{tier:'high',refraction:true,shadows:true,particles:500,pixelRatio:Math.min(dpr,2)};if(mem>=4)return{tier:'medium',refraction:true,shadows:false,particles:300,pixelRatio:Math.min(dpr,1.7)};return{tier:'low',refraction:false,shadows:false,particles:120,pixelRatio:Math.min(dpr,1.25)}}
function makeBadge(host,q,onTripleTap){const el=document.createElement('div');el.style.cssText='position:absolute;top:8px;left:8px;z-index:20;font:600 10px/1.45 ui-monospace,monospace;letter-spacing:.04em;color:#a9e6f2;background:rgba(4,14,20,.75);padding:5px 8px;border-radius:6px;border:1px solid rgba(120,200,220,.35);white-space:pre;text-transform:uppercase;cursor:pointer';host.appendChild(el);let taps=0,tapT=0;el.addEventListener('pointerdown',()=>{const now=performance.now();taps=now-tapT<650?taps+1:1;tapT=now;if(taps>=3){taps=0;onTripleTap?.()}});return{el,set:(src,tris,fps,missing)=>el.textContent=`TWIN ENGINE ${TWIN_ENGINE_VERSION}\nBUILD ${String(BUILD_SHA).slice(0,7)}\nSCAPE ${src}\n${q.tier} · ${tris} tri · ${fps} fps${missing?`\n⚠ ${missing} sin renderer 3D`:''}`}}
function particles(count,tank){const pos=new Float32Array(count*3);for(let i=0;i<count;i++){pos[i*3]=(Math.random()*2-1)*tank.outerWidth*.46;pos[i*3+1]=Math.random()*tank.waterLevel;pos[i*3+2]=(Math.random()*2-1)*tank.outerDepth*.4}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setDrawRange(0,count);const mat=new THREE.PointsMaterial({color:0xcbeeff,size:.18,transparent:true,opacity:.22,depthWrite:false});return new THREE.Points(geo,mat)}
function controls(dom,camera,target,limits){let az=0,pol=1.3,r=limits.rDefault,azT=0,polT=1.3,rT=r,p=new Map(),last=0;const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const down=e=>{p.set(e.pointerId,{x:e.clientX,y:e.clientY});dom.setPointerCapture(e.pointerId)},up=e=>{p.delete(e.pointerId);last=0},move=e=>{const v=p.get(e.pointerId);if(!v)return;const dx=e.clientX-v.x,dy=e.clientY-v.y;p.set(e.pointerId,{x:e.clientX,y:e.clientY});if(p.size===1){azT=clamp(azT-dx*.006,limits.azMin,limits.azMax);polT=clamp(polT-dy*.005,limits.polMin,limits.polMax)}else if(p.size===2){const a=[...p.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(last)rT=clamp(rT*(last/d),limits.rMin,limits.rMax);last=d}e.preventDefault()};dom.style.touchAction='none';dom.addEventListener('pointerdown',down);dom.addEventListener('pointermove',move,{passive:false});dom.addEventListener('pointerup',up);dom.addEventListener('pointercancel',up);return{apply(){az+=(azT-az)*.15;pol+=(polT-pol)*.15;r+=(rT-r)*.15;const sp=Math.sin(pol);camera.position.set(target.x+r*sp*Math.sin(az),target.y+r*Math.cos(pol),target.z+r*sp*Math.cos(az));camera.lookAt(target)},goto(view){const v={home:[0,1.3,limits.rDefault],front:[0,1.57,limits.rDefault],left:[-.95,1.42,limits.rDefault*.95],right:[.95,1.42,limits.rDefault*.95],top:[0,.28,limits.rDefault*.92]}[view];if(v){[azT,polT,rT]=v}},state:()=>({az,pol,r}),dispose(){dom.removeEventListener('pointerdown',down);dom.removeEventListener('pointermove',move);dom.removeEventListener('pointerup',up);dom.removeEventListener('pointercancel',up)}}}
function equipment(type,size=8){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:0x151a1e,roughness:.55,metalness:.2});if(type==='wavemaker'||type==='pump'){const b=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.4,4.5,20),m);b.rotation.z=Math.PI/2;g.add(b)}else g.add(new THREE.Mesh(new THREE.BoxGeometry(size,4,4),m));return g}
function coral(species,size=8){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:species.includes('zoa')?0x53bd73:0x90bd75,roughness:.7});for(let i=0;i<12;i++){const t=new THREE.Mesh(new THREE.CylinderGeometry(size*.035,size*.06,size*.55,7),m),a=i/12*Math.PI*2;t.position.set(Math.cos(a)*size*.18,size*.3,Math.sin(a)*size*.18);g.add(t)}return g}
export function mountTwin(container,manifest,options={}){
  const quality=Object.assign(detectQuality(),options.quality||{}),renderer=new THREE.WebGLRenderer({antialias:quality.tier!=='low',powerPreference:'high-performance'});
  renderer.setPixelRatio(quality.pixelRatio);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=quality.shadows;renderer.domElement.style.cssText='display:block;width:100%;height:100%';container.style.position='relative';container.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x05121a);scene.fog=new THREE.FogExp2(0x0b3a4d,.0032);
  const camera=new THREE.PerspectiveCamera(38,1,1,900);scene.add(new THREE.HemisphereLight(0x6fd0e8,0x123040,1.15));
  const key=new THREE.DirectionalLight(0xdfefff,2.5);key.position.set(6,120,14);scene.add(key);
  const tank=buildTank(manifest.tank,quality,new THREE.Vector2(1,1));scene.add(tank.group);
  const scape=buildAquascape(manifest,footprintPath(manifest.tank,manifest.tank.glassThickness));scene.add(scape.group);
  const dust=particles(quality.particles,manifest.tank);scene.add(dust);
  const ctl=controls(renderer.domElement,camera,tank.center,{azMin:-1.15,azMax:1.15,polMin:.22,polMax:1.62,rMin:tank.outerRadius+12,rMax:210,rDefault:118});ctl.goto('home');
  const debugGroup=new THREE.Group();debugGroup.name='debug';debugGroup.visible=false;debugGroup.add(buildTankBoxHelper(manifest.tank));scene.add(debugGroup);
  const debugPanel=makeDebugPanel(container);
  let debugOn=new URLSearchParams(location.search).get('debug')==='1';
  function setDebug(v){debugOn=v;debugGroup.visible=v;debugPanel.show(v);if(scape.materials[0])scape.materials[0].wireframe=v}
  const badge=makeBadge(container,quality,()=>setDebug(!debugOn));
  setDebug(debugOn);
  const entities=new Map(),swimmers=[],obstacles=[],debugMarkers=new Map();
  const world={solidity:scape.solidity,containment:tank.containment,waterLevel:manifest.tank.waterLevel,obstacles};
  let next=1;
  function addFish({id,species='Amphiprion ocellaris',lengthCm=6,personality={}}={}){
    const eid=id||`fish-${next++}`,status=speciesRenderStatus(species);
    if(!hasRenderer(species)){entities.set(eid,{type:'fish',species,status,object:null,swimmer:null,data:{lengthCm,personality}});console.warn(`[Twin Engine] Sin renderer 3D para "${species}" (estado ${status}); se registra la entidad sin geometría — nunca con el modelo de otra especie.`);return eid}
    const mesh=RENDERERS[species](lengthCm,Math.random()*10);scene.add(mesh);
    const home=new THREE.Vector3(personality.homeX??0,personality.homeY??12,personality.homeZ??0),sw=new Swimmer({id:eid,species,mesh,lengthCm,personality,home});
    swimmers.push(sw);entities.set(eid,{type:'fish',species,status,object:mesh,swimmer:sw,data:{lengthCm,personality}});
    const marker=makeEntityMarker(species,lengthCm);debugGroup.add(marker);debugMarkers.set(eid,marker);
    return eid;
  }
  function addCoral({id,species='euphyllia',position=[0,6,0],sizeCm=8}={}){const eid=id||`coral-${next++}`,obj=coral(species,sizeCm);obj.position.fromArray(position);scene.add(obj);entities.set(eid,{type:'coral',species,object:obj,data:{position,sizeCm}});return eid}
  function addEquipment({id,type='pump',position=[30,24,-10],rotation=[0,0,0],sizeCm=8}={}){const eid=id||`eq-${next++}`,obj=equipment(type,sizeCm);obj.position.fromArray(position);obj.rotation.fromArray(rotation);scene.add(obj);const ob={id:eid,position:obj.position,radius:sizeCm*0.7};obstacles.push(ob);entities.set(eid,{type:'equipment',species:type,object:obj,obstacle:ob,data:{position,rotation,sizeCm}});return eid}
  function removeEntity(id){const e=entities.get(id);if(!e)return false;if(e.object)scene.remove(e.object);if(e.swimmer)swimmers.splice(swimmers.indexOf(e.swimmer),1);if(e.obstacle){const i=obstacles.indexOf(e.obstacle);if(i>=0)obstacles.splice(i,1)}const marker=debugMarkers.get(id);if(marker){debugGroup.remove(marker);debugMarkers.delete(id)}entities.delete(id);return true}
  function updateEntity(id,patch={}){const e=entities.get(id);if(!e)return false;if(!e.object)return true;if(patch.position)e.object.position.fromArray(patch.position);if(patch.rotation)e.object.rotation.fromArray(patch.rotation);if(patch.visible!==undefined)e.object.visible=patch.visible;return true}
  for(const f of manifest.livestock||[])addFish(f);for(const c of manifest.corals||[])addCoral(c);for(const q of manifest.equipment||[])addEquipment(q);
  const clock=new THREE.Clock();let raf=0,frames=0,acc=0,fps=0,qScale=1;
  const src=manifest.scape.source==='photo-trace'?'FOTO-TRACE':manifest.scape.source==='photo-estimate'?'FOTO-ESTIMACIÓN':'PROVISIONAL';
  const resize=()=>{const w=container.clientWidth||1,h=container.clientHeight||560;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};
  const ro=new ResizeObserver(resize);ro.observe(container);resize();
  function applyQualityScale(){renderer.setPixelRatio(Math.max(0.7,quality.pixelRatio*qScale));dust.geometry.setDrawRange(0,Math.max(20,Math.floor(quality.particles*qScale)))}
  function loop(){
    raf=requestAnimationFrame(loop);
    const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;
    ctl.apply();
    for(const m of scape.materials)if(m.userData.uniforms)m.userData.uniforms.uTime.value=t;
    for(const m of tank.materials)if(m.userData.uniforms)m.userData.uniforms.uTime.value=t;
    for(const s of swimmers)s.update(dt,world,swimmers);
    if(debugOn)for(const s of swimmers){const marker=debugMarkers.get(s.id);if(marker)marker.position.copy(s.pos)}
    renderer.render(scene,camera);
    frames++;acc+=dt;
    if(acc>.75){
      fps=Math.round(frames/acc);
      if(fps<24&&qScale>0.55){qScale=Math.max(0.55,qScale-0.15);applyQualityScale()}
      else if(fps>50&&qScale<1){qScale=Math.min(1,qScale+0.08);applyQualityScale()}
      let missing=0;for(const e of entities.values())if(e.type==='fish'&&!e.object)missing++;
      badge.set(src,Math.round(scape.stats.triangles),fps,missing);
      if(debugOn){const cs=ctl.state(),byStatus={};for(const e of entities.values())if(e.type==='fish')byStatus[e.status]=(byStatus[e.status]||0)+1;debugPanel.set(`CAM az${cs.az.toFixed(2)} pol${cs.pol.toFixed(2)} r${cs.r.toFixed(0)}\nQSCALE ${qScale.toFixed(2)}\n${Object.entries(byStatus).map(([k,v])=>`${k}:${v}`).join(' ')}`)}
      frames=0;acc=0;
    }
  }
  loop();
  return{
    version:TWIN_ENGINE_VERSION,build:BUILD_SHA,quality,stats:scape.stats,scene,camera,renderer,
    addFish,addCoral,addEquipment,removeEntity,updateEntity,
    listEntities:()=>[...entities.keys()],
    snapshotState:()=>({capturedAt:new Date().toISOString(),engine:TWIN_ENGINE_VERSION,build:BUILD_SHA,entities:[...entities.entries()].map(([id,e])=>({id,type:e.type,species:e.species,status:e.status,position:e.object?e.object.position.toArray():null,data:e.data}))}),
    setView:v=>ctl.goto(v),
    setDebug,
    dispose(){cancelAnimationFrame(raf);ro.disconnect();ctl.dispose();renderer.dispose();renderer.domElement.remove();badge.el.remove();debugPanel.el.remove()}
  };
}
export async function bootMyAquarium(container,manifestUrl){const res=await fetch(manifestUrl,{cache:'no-store'});if(!res.ok)throw new Error(`No se pudo cargar el manifiesto: ${res.status}`);const twin=mountTwin(container,await res.json());window.__TWIN__=twin;return twin}
