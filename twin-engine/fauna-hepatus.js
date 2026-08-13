import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';
import {buildFin,SWIM_CHUNK} from './fauna-common.js';

/**
 * Paracanthurus hepatus (cirujano azul / "Dory"). Geometría propia:
 * disco oval alto, MUY comprimido lateralmente (halfWidth ≈ 0.30·halfHeight,
 * frente al 0.6 de un ocellaris), caudal ahorquillada de puntas afiladas,
 * dorsal/anal continuas de perfil bajo, y la espina caudal ("scalpel")
 * característica de los Acanthuridae cerca del pedúnculo.
 * No comparte ni geometría ni shader con Amphiprion ocellaris.
 */
function halfHeight(t){const rise=Math.sin(Math.pow(Math.min(1,t*1.05),0.55)*Math.PI),pedTaper=Math.pow(Math.max(0,(t-0.76)/0.24),1.6);return Math.max(0.024,0.095+0.335*rise-0.235*pedTaper)}
function halfWidth(t){return halfHeight(t)*0.30+0.007}
function centerY(t){return 0.012*Math.sin(t*Math.PI*0.8)}
const SECTIONS=30,RING=16;
function buildBody(L){const bodyLen=L*0.72,positions=[],uvs=[],indices=[];for(let i=0;i<SECTIONS;i++){const t=i/(SECTIONS-1),z=bodyLen*(0.5-t),hh=halfHeight(t)*L,hw=halfWidth(t)*L,cy=centerY(t)*L;for(let j=0;j<RING;j++){const a=(j/RING)*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),x=hw*Math.sign(ca)*Math.pow(Math.abs(ca),0.62),y=cy+hh*Math.sign(sa)*Math.pow(Math.abs(sa),0.92);positions.push(x,y,z);uvs.push(t,j/RING)}}for(let i=0;i<SECTIONS-1;i++)for(let j=0;j<RING;j++){const j2=(j+1)%RING,a=i*RING+j,b=i*RING+j2,cIdx=(i+1)*RING+j2,d=(i+1)*RING+j;indices.push(a,b,cIdx,a,cIdx,d)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();return geo}
function dorsalFin(L){const bodyLen=L*0.72,s=[],n=22;for(let i=0;i<n;i++){const k=i/(n-1),t=0.10+k*0.72,z=bodyLen*(0.5-t),by=(centerY(t)+halfHeight(t))*L*0.97,h=Math.sin(k*Math.PI)*0.078*L;s.push({bx:0,by,bz:z,tx:0,ty:by+h,tz:z})}return buildFin(s)}
function analFin(L){const bodyLen=L*0.72,s=[],n=18;for(let i=0;i<n;i++){const k=i/(n-1),t=0.24+k*0.56,z=bodyLen*(0.5-t),by=(centerY(t)-halfHeight(t))*L*0.97,h=Math.sin(k*Math.PI)*0.068*L;s.push({bx:0,by,bz:z,tx:0,ty:by-h,tz:z})}return buildFin(s)}
function caudalFin(L){const bodyLen=L*0.72,z0=-bodyLen*0.5,hh=halfHeight(1)*L,s=[],n=14;for(let i=0;i<n;i++){const k=i/(n-1),a=(k-0.5)*2,lobe=Math.pow(Math.abs(a),1.55),by=a*hh*2.05,len=(0.31*lobe+0.045)*L;s.push({bx:0,by,bz:z0,tx:0,ty:a*hh*3.15,tz:z0-len})}return buildFin(s)}
function pectoralFin(L,side){const bodyLen=L*0.72,t=0.30,z=bodyLen*(0.5-t),hw=halfWidth(t)*L,s=[],n=8;for(let i=0;i<n;i++){const k=i/(n-1),a=(k-0.5)*1.3,by=Math.sin(a)*0.045*L;s.push({bx:side*hw*0.9,by,bz:z,tx:side*(hw*0.9+Math.cos(a)*0.10*L),ty:by+Math.sin(a)*0.045*L,tz:z-0.045*L})}return buildFin(s)}
/** Espina caudal (scalpel) — bulto pálido fijo cerca del pedúnculo, rasgo distintivo de Acanthuridae. */
function buildScalpel(L,side){const geo=new THREE.ConeGeometry(L*0.028,L*0.09,6);geo.rotateZ(side*Math.PI/2);const mat=new THREE.MeshStandardMaterial({color:0xdfe6e2,roughness:0.4});const m=new THREE.Mesh(geo,mat);const t=0.80,bodyLen=L*0.72;m.position.set(side*(halfWidth(t)*L+L*0.02),centerY(t)*L,bodyLen*(0.5-t));return m}
function bodyMaterial(seed){return new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uAmp:{value:0.6},uFreq:{value:4.4},uWave:{value:3.6},uFin:{value:0},uSeed:{value:seed},uLight:{value:new THREE.Vector3(0.25,1,0.35)}},vertexShader:`${SWIM_CHUNK} varying vec2 vUv;varying vec3 vN;varying vec3 vViewPos;void main(){vUv=uv;vec3 p=swim(position,uv.x);vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(p,1.0);vViewPos=mv.xyz;gl_Position=projectionMatrix*mv;}`,fragmentShader:`varying vec2 vUv;varying vec3 vN;varying vec3 vViewPos;uniform float uSeed;uniform vec3 uLight;float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
void main(){
  float u=vUv.x,v=vUv.y;
  vec3 deepBlue=vec3(0.05,0.18,0.52),royal=vec3(0.10,0.34,0.80),bright=vec3(0.22,0.52,0.94),black=vec3(0.03,0.03,0.05),yellow=vec3(0.97,0.80,0.16),pale=vec3(0.75,0.85,0.92);
  vec3 col=mix(deepBlue,royal,smoothstep(0.15,0.75,v));
  col=mix(col,bright,pow(max(0.0,1.0-abs(v-0.62)*2.0),3.0)*0.5);
  float wob=(n2(vec2(v*5.0+uSeed,u*3.0))-0.5)*0.05;
  float bandCurve=0.30+wob+0.22*smoothstep(0.05,0.55,u)-0.10*smoothstep(0.55,0.95,u);
  float bandWidth=0.085+0.05*smoothstep(0.0,0.4,u);
  float dBand=abs(v-bandCurve)-bandWidth;
  col=mix(col,black,smoothstep(0.05,-0.02,dBand));
  float snoutDark=smoothstep(0.10,0.0,u)*0.5;
  col=mix(col,black,snoutDark*smoothstep(0.62,0.5,v));
  float tailMix=smoothstep(0.74,0.92,u);
  col=mix(col,yellow,tailMix);
  col=mix(col,pale,smoothstep(0.94,0.99,v)*0.35+smoothstep(0.06,0.01,v)*0.2);
  float scale=n2(vec2(u*44.0,v*34.0))*0.045-0.02;col+=scale;
  vec3 N=normalize(vN);vec3 V=normalize(-vViewPos);
  float diff=clamp(dot(N,normalize(uLight)),0.0,1.0),rim=pow(1.0-abs(N.z),2.2),spec=pow(clamp(dot(reflect(-normalize(uLight),N),V),0.0,1.0),24.0);
  col*=0.38+0.76*diff;col+=vec3(0.30,0.55,0.75)*rim*0.28;col+=vec3(1.0)*spec*0.12;
  gl_FragColor=vec4(col,1.0);#include <colorspace_fragment>
}`})}
function finMaterial(seed,kind){const yellowFin=kind==='caudal';return new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:true,uniforms:{uTime:{value:0},uAmp:{value:0.6},uFreq:{value:4.4},uWave:{value:3.6},uFin:{value:kind==='pectoral'?1:0},uSeed:{value:seed}},vertexShader:`${SWIM_CHUNK} varying vec2 vUv;void main(){vUv=uv;float u=uFin>0.5?0.35:clamp(0.5-position.z/6.0,0.0,1.2);vec3 p=swim(position,u);if(uFin>0.5){float f=sin(uTime*uFreq*1.7+uSeed)*0.5,k=uv.y;p.x+=f*k*abs(p.x)*0.85;p.z-=abs(f)*k*0.07;}p.y+=sin(uTime*2.6+uv.x*5.0+uSeed)*uv.y*0.03;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,fragmentShader:`varying vec2 vUv;void main(){vec3 blue=vec3(0.14,0.36,0.82),black=vec3(0.04,0.04,0.06),yellow=vec3(0.97,0.80,0.16);vec3 col=${yellowFin?'yellow':'blue'};col=mix(col,black,smoothstep(0.90,1.0,vUv.y)*0.7);gl_FragColor=vec4(col,0.92);#include <colorspace_fragment>}`})}
export function createHepatus(lengthCm,seed=Math.random()*10){const L=lengthCm,group=new THREE.Group(),mats=[],bMat=bodyMaterial(seed);mats.push(bMat);group.add(new THREE.Mesh(buildBody(L),bMat));const add=(geo,kind)=>{const m=finMaterial(seed,kind);mats.push(m);group.add(new THREE.Mesh(geo,m))};add(dorsalFin(L),'dorsal');add(analFin(L),'anal');add(caudalFin(L),'caudal');add(pectoralFin(L,1),'pectoral');add(pectoralFin(L,-1),'pectoral');group.add(buildScalpel(L,1));group.add(buildScalpel(L,-1));const bodyLen=L*0.72,eyeT=0.10,eyeZ=bodyLen*(0.5-eyeT),eyeGeo=new THREE.SphereGeometry(L*0.040,12,10),eyeMat=new THREE.MeshBasicMaterial({color:0x0a0a0c});for(const s of[1,-1]){const e=new THREE.Mesh(eyeGeo,eyeMat);e.position.set(s*halfWidth(eyeT)*L*0.9,centerY(eyeT)*L+L*0.05,eyeZ);group.add(e)}group.userData.materials=mats;return group}
