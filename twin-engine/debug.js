import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';

/** Caja de referencia del volumen interior real de la urna (cm). */
export function buildTankBoxHelper(tank){
  const box=new THREE.Box3(
    new THREE.Vector3(-tank.outerWidth/2,0,-tank.outerDepth/2),
    new THREE.Vector3(tank.outerWidth/2,tank.outerHeight,tank.outerDepth/2+tank.frontBow)
  );
  const helper=new THREE.Box3Helper(box,new THREE.Color(0x33ffcc));
  helper.name='debug-tank-box';
  return helper;
}

const SPECIES_COLOR={
  'Amphiprion ocellaris':0xff8a3c,
  'Paracanthurus hepatus':0x3ca6ff,
  'Chrysiptera parasema':0x36e0ff,
};
export function speciesDebugColor(species){return SPECIES_COLOR[species]??0xffffff}

/** Marcador de posición + radio de contención aproximado (this.L*0.55) para un pez. */
export function makeEntityMarker(species,lengthCm){
  const color=speciesDebugColor(species),group=new THREE.Group();group.name='debug-marker';
  const dot=new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.6,lengthCm*0.06),8,6),new THREE.MeshBasicMaterial({color}));
  const radius=new THREE.Mesh(new THREE.SphereGeometry(lengthCm*0.55,10,8),new THREE.MeshBasicMaterial({color,wireframe:true,transparent:true,opacity:0.35}));
  group.add(dot,radius);
  return group;
}

/** Panel de texto de depuración (cámara, entidades) — independiente de la insignia. */
export function makeDebugPanel(host){
  const el=document.createElement('div');
  el.style.cssText='position:absolute;bottom:8px;left:8px;z-index:20;font:600 9px/1.5 ui-monospace,monospace;letter-spacing:.03em;color:#9fffcf;background:rgba(4,20,14,.78);padding:5px 8px;border-radius:6px;border:1px solid rgba(120,220,180,.35);pointer-events:none;white-space:pre;max-width:70%;display:none';
  host.appendChild(el);
  return {el,set:text=>{el.textContent=text},show:v=>{el.style.display=v?'block':'none'}};
}
