import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';

/** Cinta de dos bordes (base/punta) usada por todas las aletas. */
export function buildFin(samples){const positions=[],uvs=[],indices=[],n=samples.length;for(let i=0;i<n;i++){const s=samples[i];positions.push(s.bx,s.by,s.bz);uvs.push(i/(n-1),0);positions.push(s.tx,s.ty,s.tz);uvs.push(i/(n-1),1)}for(let i=0;i<n-1;i++){const a=i*2,b=i*2+1,c=i*2+2,d=i*2+3;indices.push(a,b,d,a,d,c)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();return geo}

/** Desplazamiento de nado compartido por cuerpo y aletas (vertex shader). */
export const SWIM_CHUNK=`uniform float uTime;uniform float uAmp;uniform float uFreq;uniform float uWave;uniform float uFin;vec3 swim(vec3 p,float u){float amp=uAmp*(0.06+pow(clamp(u,0.0,1.0),2.0));float phase=uTime*uFreq-u*uWave;p.x+=sin(phase)*amp;p.y+=sin(phase*0.5+1.7)*amp*0.12;return p;}`;

/**
 * Perfil de movimiento por especie. addFish() pasa `species`; si no hay
 * entrada aquí se usa el de ocellaris como base neutra.
 * - wanderFreq: velocidad del rumbo pseudoaleatorio (bajo = trayectorias
 *   amplias y continuas; alto = cambios de dirección más frecuentes).
 * - homePull: fuerza de atracción hacia el ancla territorial.
 * - turnLerp: velocidad de reorientación del morro hacia la velocidad
 *   (bajo = giros amplios/graduales; alto = giros bruscos).
 * - bandTarget: fracción del nivel de agua que la especie prefiere
 *   cruzar (null = sin preferencia vertical explícita).
 * - pairPull: fuerza de atracción hacia personality.pairWith.
 */
export const MOVEMENT_PROFILES={
  'Amphiprion ocellaris':{cruiseMul:1.0,wanderFreq:1.0,homePull:0.35,turnLerp:3.2,burstMin:0.5,burstMax:1.3,burstGapMin:3,burstGapMax:12,burstBoost:1.4,bandTarget:null,pairPull:0.9},
  'Paracanthurus hepatus':{cruiseMul:1.9,wanderFreq:0.42,homePull:0.07,turnLerp:1.5,burstMin:0.8,burstMax:1.7,burstGapMin:5,burstGapMax:14,burstBoost:1.25,bandTarget:0.68,pairPull:0},
  'Chrysiptera parasema':{cruiseMul:1.35,wanderFreq:1.9,homePull:0.85,turnLerp:5.4,burstMin:0.22,burstMax:0.55,burstGapMin:1.1,burstGapMax:3.6,burstBoost:1.9,bandTarget:0.40,pairPull:0},
};
export function profileFor(species){return MOVEMENT_PROFILES[species]||MOVEMENT_PROFILES['Amphiprion ocellaris']}

const _v=new THREE.Vector3(),_probe=new THREE.Vector3(),_corr=new THREE.Vector3(),_g=new THREE.Vector3(),_q=new THREE.Quaternion(),_m=new THREE.Matrix4(),UP=new THREE.Vector3(0,1,0);

export class Swimmer{
  constructor({id,species,mesh,lengthCm,personality,home}){
    this.id=id;this.species=species;this.mesh=mesh;this.L=lengthCm;this.p=personality||{};
    this.pairWith=this.p.pairWith||null;
    this.profile=profileFor(species);
    this.home=home.clone();this.pos=home.clone();
    this.vel=new THREE.Vector3(1,0,0.2).multiplyScalar(lengthCm*1.4);
    this.phase=Math.random()*100;this.burst=0;this.nextBurst=2+Math.random()*6;
    this.mesh.position.copy(this.pos);
  }
  update(dt,world,others){
    const pr=this.profile,cruise=this.L*1.6*(this.p.cruise??1)*pr.cruiseMul,bold=this.p.boldness??0.5;
    this.phase+=dt;
    const w=this.phase*0.55*pr.wanderFreq+this.id.length;
    _v.set(Math.sin(w*0.9)+Math.sin(w*0.37)*0.6,Math.sin(w*0.23)*0.35,Math.cos(w*0.8)+Math.cos(w*0.41)*0.5).normalize();
    const acc=_v.multiplyScalar(cruise*1.6);
    acc.add(_probe.copy(this.home).sub(this.pos).multiplyScalar(pr.homePull*(1.1-bold)));
    if(pr.bandTarget!=null&&world.waterLevel){const targetY=world.waterLevel*pr.bandTarget;acc.y+=(targetY-this.pos.y)*0.05}
    const ahead=_probe.copy(this.vel).normalize().multiplyScalar(this.L*2.2).add(this.pos),s=world.solidity(ahead.x,ahead.y,ahead.z);
    if(s>-this.L*0.9){const h=1.2,gx=world.solidity(ahead.x+h,ahead.y,ahead.z)-world.solidity(ahead.x-h,ahead.y,ahead.z),gy=world.solidity(ahead.x,ahead.y+h,ahead.z)-world.solidity(ahead.x,ahead.y-h,ahead.z),gz=world.solidity(ahead.x,ahead.y,ahead.z+h)-world.solidity(ahead.x,ahead.y,ahead.z-h);acc.add(_g.set(-gx,-gy+0.4,-gz).normalize().multiplyScalar(cruise*7))}
    for(const ob of world.obstacles||[]){const d=this.pos.distanceTo(ob.position),minD=ob.radius+this.L*0.7;if(d<minD&&d>0.001)acc.add(_probe.copy(this.pos).sub(ob.position).multiplyScalar((cruise*2.4)/(d*d)))}
    if(this.pairWith){const partner=others.find(o=>o.id===this.pairWith);if(partner){const d=this.pos.distanceTo(partner.pos);if(d>this.L*3.4)acc.add(_probe.copy(partner.pos).sub(this.pos).multiplyScalar(pr.pairPull*0.4))}}
    for(const o of others){if(o===this)continue;const d=this.pos.distanceTo(o.pos);if(d<0.001)continue;const isPartner=this.pairWith&&o.id===this.pairWith,sepMul=isPartner?0.32:1;if(d<this.L*1.8)acc.add(_probe.copy(this.pos).sub(o.pos).multiplyScalar((cruise*2.2*sepMul)/d))}
    this.nextBurst-=dt;
    if(this.nextBurst<=0){this.burst=pr.burstMin+Math.random()*(pr.burstMax-pr.burstMin);this.nextBurst=pr.burstGapMin+Math.random()*(pr.burstGapMax-pr.burstGapMin)}
    const burstK=this.burst>0?1+(pr.burstBoost-1)*bold:1;
    if(this.burst>0)this.burst-=dt;
    this.vel.addScaledVector(acc,dt);
    const speed=this.vel.length(),target=cruise*burstK;
    if(speed>0.001)this.vel.multiplyScalar(THREE.MathUtils.lerp(speed,target,0.06)/speed);
    this.pos.addScaledVector(this.vel,dt);
    world.containment(this.pos.x,this.pos.y,this.pos.z,this.L*0.55,_corr);
    if(_corr.lengthSq()>0){this.pos.add(_corr);this.vel.addScaledVector(_corr,6)}
    this.mesh.position.copy(this.pos);
    _v.copy(this.pos).addScaledVector(this.vel,1);_m.lookAt(_v,this.pos,UP);_q.setFromRotationMatrix(_m);
    this.mesh.quaternion.slerp(_q,Math.min(1,dt*pr.turnLerp));
    const freq=3.4+(this.vel.length()/Math.max(cruise,0.001))*2.6;
    for(const m of this.mesh.userData.materials){m.uniforms.uTime.value=this.phase;m.uniforms.uFreq.value=freq;m.uniforms.uAmp.value=this.L*0.055}
  }
}
