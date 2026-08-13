import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';
import {buildFin,SWIM_CHUNK} from './fauna-common.js';

/**
 * Chrysiptera parasema (damisela cola amarilla). Cuerpo alto y en disco
 * (más chato/rechoncho que el cirujano, halfWidth≈0.40·halfHeight),
 * hocico romo corto, caudal con horquilla poco profunda, dorsal alta
 * continua. No reutiliza geometría ni shader de las otras dos especies.
 */
function halfHeight(t){const rise=Math.sin(Math.pow(Math.min(1,t*1.35),0.6)*Math.PI),pedTaper=Math.pow(Math.max(0,(t-0.72)/0.28),1.8);return Math.max(0.026,0.078+0.30*rise-0.19*pedTaper)}
function halfWidth(t){return halfHeight(t)*0.40+0.006}
function centerY(t){return 0.014*Math.sin(t*Math.PI*0.9)}
const SECTIONS=26,RING=14;
function buildBody(L){const bodyLen=L*0.70,positions=[],uvs=[],indices=[];for(let i=0;i<SECTIONS;i++){const t=i/(SECTIONS-1),z=bodyLen*(0.5-t),hh=halfHeight(t)*L,hw=halfWidth(t)*L,cy=centerY(t)*L;for(let j=0;j<RING;j++){const a=(j/RING)*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),x=hw*Math.sign(ca)*Math.pow(Math.abs(ca),0.72),y=cy+hh*Math.sign(sa)*Math.pow(Math.abs(sa),0.88);positions.push(x,y,z);uvs.push(t,j/RING)}}for(let i=0;i<SECTIONS-1;i++)for(let j=0;j<RING;j++){const j2=(j+1)%RING,a=i*RING+j,b=i*RING+j2,cIdx=(i+1)*RING+j2,d=(i+1)*RING+j;indices.push(a,b,cIdx,a,cIdx,d)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();return geo}
function dorsalFin(L){const bodyLen=L*0.70,s=[],n=18;for(let i=0;i<n;i++){const k=i/(n-1),t=0.14+k*0.66,z=bodyLen*(0.5-t),by=(centerY(t)+halfHeight(t))*L*0.97,h=(0.06+Math.sin(k*Math.PI)*0.085)*L;s.push({bx:0,by,bz:z,tx:0,ty:by+h,tz:z+h*0.12})}return buildFin(s)}
function analFin(L){const bodyLen=L*0.70,s=[],n=10;for(let i=0;i<n;i++){const k=i/(n-1),t=0.55+k*0.30,z=bodyLen*(0.5-t),by=(centerY(t)-halfHeight(t))*L*0.97,h=Math.sin(k*Math.PI)*0.07*L;s.push({bx:0,by,bz:z,tx:0,ty:by-h,tz:z+h*0.2})}return buildFin(s)}
function caudalFin(L){const bodyLen=L*0.70,z0=-bodyLen*0.5,hh=halfHeight(1)*L,s=[],n=12;for(let i=0;i<n;i++){const k=i/(n-1),a=(k-0.5)*2,lobe=Math.pow(Math.abs(a),2.2),by=a*hh*1.9,len=(0.155*lobe+0.06)*L;s.push({bx:0,by,bz:z0,tx:0,ty:a*hh*2.7,tz:z0-len})}return buildFin(s)}
function pectoralFin(L,side){const bodyLen=L*0.70,t=0.34,z=bodyLen*(0.5-t),hw=halfWidth(t)*L,s=[],n=7;for(let i=0;i<n;i++){const k=i/(n-1),a=(k-0.5)*1.4,by=Math.sin(a)*0.045*L;s.push({bx:side*hw*0.9,by,bz:z,tx:side*(hw*0.9+Math.cos(a)*0.085*L),ty:by+Math.sin(a)*0.045*L,tz:z-0.04*L})}return buildFin(s)}
function bodyMaterial(seed){return new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uAmp:{value:0.7},uFreq:{value:6.4},uWave:{value:5.4},uFin:{value:0},uSeed:{value:seed},uLight:{value:new THREE.Vector3(0.25,1,0.35)}},vertexShader:`${SWIM_CHUNK} varying vec2 vUv;varying vec3 vN;varying vec3 vViewPos;void main(){vUv=uv;vec3 p=swim(position,uv.x);vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(p,1.0);vViewPos=mv.xyz;gl_Position=projectionMatrix*mv;}`,fragmentShader:`varying vec2 vUv;varying vec3 vN;varying vec3 vViewPos;uniform float uSeed;uniform vec3 uLight;float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
void main(){
  float u=vUv.x,v=vUv.y;
  vec3 blueDeep=vec3(0.06,0.24,0.68),blueElectric=vec3(0.16,0.46,0.98),blueGlow=vec3(0.32,0.64,1.0),yellow=vec3(1.0,0.83,0.09),black=vec3(0.03,0.03,0.05);
  vec3 col=mix(blueDeep,blueElectric,smoothstep(0.1,0.85,v));
  col=mix(col,blueGlow,pow(max(0.0,1.0-abs(v-0.5)*1.5),3.0)*0.45);
  float sparkle=n2(vec2(u*30.0+uSeed,v*24.0));
  col+=vec3(0.10,0.14,0.18)*smoothstep(0.82,1.0,sparkle);
  float tailMix=smoothstep(0.66,0.85,u);
  col=mix(col,yellow,tailMix);
  float eyeRing=smoothstep(0.08,0.02,abs(u-0.085))*smoothstep(0.72,0.58,v);
  col=mix(col,black,eyeRing*0.4);
  float scale=n2(vec2(u*50.0,v*40.0))*0.05-0.022;col+=scale;
  vec3 N=normalize(vN);vec3 V=normalize(-vViewPos);
  float diff=clamp(dot(N,normalize(uLight)),0.0,1.0),rim=pow(1.0-abs(N.z),2.0),spec=pow(clamp(dot(reflect(-normalize(uLight),N),V),0.0,1.0),16.0);
  col*=0.42+0.72*diff;col+=vec3(0.35,0.60,0.80)*rim*0.30;col+=vec3(1.0)*spec*0.14;
  gl_FragColor=vec4(col,1.0);#include <colorspace_fragment>
}`})}
function finMaterial(seed,kind){const yellowFin=kind==='caudal';return new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:true,uniforms:{uTime:{value:0},uAmp:{value:0.7},uFreq:{value:6.4},uWave:{value:5.4},uFin:{value:kind==='pectoral'?1:0},uSeed:{value:seed}},vertexShader:`${SWIM_CHUNK} varying vec2 vUv;void main(){vUv=uv;float u=uFin>0.5?0.35:clamp(0.5-position.z/6.0,0.0,1.2);vec3 p=swim(position,u);if(uFin>0.5){float f=sin(uTime*uFreq*2.1+uSeed)*0.5,k=uv.y;p.x+=f*k*abs(p.x)*0.95;p.z-=abs(f)*k*0.09;}p.y+=sin(uTime*3.6+uv.x*7.0+uSeed)*uv.y*0.04;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,fragmentShader:`varying vec2 vUv;void main(){vec3 blue=vec3(0.18,0.48,0.95),black=vec3(0.04,0.04,0.06),yellow=vec3(1.0,0.83,0.09);vec3 col=${yellowFin?'yellow':'blue'};col=mix(col,black,smoothstep(0.88,1.0,vUv.y)*0.6);gl_FragColor=vec4(col,0.9);#include <colorspace_fragment>}`})}
export function createParasema(lengthCm,seed=Math.random()*10){const L=lengthCm,group=new THREE.Group(),mats=[],bMat=bodyMaterial(seed);mats.push(bMat);group.add(new THREE.Mesh(buildBody(L),bMat));const add=(geo,kind)=>{const m=finMaterial(seed,kind);mats.push(m);group.add(new THREE.Mesh(geo,m))};add(dorsalFin(L),'dorsal');add(analFin(L),'anal');add(caudalFin(L),'caudal');add(pectoralFin(L,1),'pectoral');add(pectoralFin(L,-1),'pectoral');const bodyLen=L*0.70,eyeT=0.11,eyeZ=bodyLen*(0.5-eyeT),eyeGeo=new THREE.SphereGeometry(L*0.052,12,10),eyeMat=new THREE.MeshBasicMaterial({color:0x080809});for(const s of[1,-1]){const e=new THREE.Mesh(eyeGeo,eyeMat);e.position.set(s*halfWidth(eyeT)*L*0.88,centerY(eyeT)*L+L*0.055,eyeZ);group.add(e)}group.userData.materials=mats;return group}
