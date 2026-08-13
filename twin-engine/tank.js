import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';

export function frontArc(tank) {
  const a = tank.outerWidth / 2;
  const s = tank.frontBow;
  const R = (a * a + s * s) / (2 * s);
  const apex = tank.frontEdgeZ + s;
  const zc = apex - R;
  return { R, zc, apex, halfWidth: a };
}

export function footprintPath(tank, inset = 0, segments = 48) {
  const { R, zc, halfWidth } = frontArc(tank);
  const hw = halfWidth - inset;
  const zBack = -tank.outerDepth / 2 + inset;
  const Ri = R - inset;
  const pts = [];
  pts.push(new THREE.Vector2(-hw, zBack));
  pts.push(new THREE.Vector2(hw, zBack));
  for (let i = 0; i <= segments; i++) {
    const x = hw - (2 * hw * i) / segments;
    const inner = Math.max(0, Ri * Ri - x * x);
    pts.push(new THREE.Vector2(x, zc + Math.sqrt(inner)));
  }
  return pts;
}

function shapeFromPath(pts) {
  const shape = new THREE.Shape();
  shape.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i].x, pts[i].y);
  shape.closePath();
  return shape;
}
function extrudeUp(shape, height, holeShape) {
  if (holeShape) shape.holes.push(holeShape);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 24 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, height, 0);
  return geo;
}
function reversedShape(pts) {
  const s = new THREE.Shape();
  const r = [...pts].reverse();
  s.moveTo(r[0].x, r[0].y);
  for (let i = 1; i < r.length; i++) s.lineTo(r[i].x, r[i].y);
  s.closePath();
  return s;
}
const GLASS_VERT = `
  varying vec3 vNormalView;
  varying vec3 vViewPos;
  void main(){
    vNormalView = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;
function refractiveGlass(resolution, tint) {
  return new THREE.ShaderMaterial({
    uniforms: { tScene: { value: null }, uResolution: { value: resolution }, uStrength: { value: 0.028 }, uTint: { value: new THREE.Color(tint) } },
    vertexShader: GLASS_VERT,
    fragmentShader: `
      uniform sampler2D tScene; uniform vec2 uResolution; uniform float uStrength; uniform vec3 uTint;
      varying vec3 vNormalView; varying vec3 vViewPos;
      void main(){
        vec3 n=normalize(vNormalView); vec3 v=normalize(-vViewPos); vec2 uv=gl_FragCoord.xy/uResolution;
        vec2 off=n.xy*uStrength*(1.0-abs(n.z));
        vec3 col=texture2D(tScene,clamp(uv+off,vec2(0.001),vec2(0.999))).rgb;
        float fres=pow(1.0-clamp(dot(n,v),0.0,1.0),3.0);
        col=mix(col,uTint,0.05+fres*0.10); col+=vec3(0.55,0.72,0.86)*fres*0.30;
        gl_FragColor=vec4(col,1.0); #include <colorspace_fragment>
      }`
  });
}
function simpleGlass(tint) {
  return new THREE.ShaderMaterial({
    transparent:true, depthWrite:false, uniforms:{uTint:{value:new THREE.Color(tint)}}, vertexShader:GLASS_VERT,
    fragmentShader:`uniform vec3 uTint; varying vec3 vNormalView; varying vec3 vViewPos; void main(){vec3 n=normalize(vNormalView);vec3 v=normalize(-vViewPos);float fres=pow(1.0-clamp(dot(n,v),0.0,1.0),3.0);gl_FragColor=vec4(mix(uTint,vec3(0.62,0.79,0.9),fres),0.10+fres*0.45);}`
  });
}
export function buildTank(tank, quality, resolution) {
  const group = new THREE.Group(); group.name='tank';
  const t=tank.glassThickness, outer=footprintPath(tank,0), inner=footprintPath(tank,t);
  const wallGeo=extrudeUp(shapeFromPath(outer),tank.outerHeight-tank.rimHeight,reversedShape(inner));
  const glassMat=quality.refraction?refractiveGlass(resolution,'#bfe3ea'):simpleGlass('#9fd3de');
  const glass=new THREE.Mesh(wallGeo,glassMat); glass.name='glass'; glass.layers.set(1); group.add(glass);
  const baseGeo=extrudeUp(shapeFromPath(outer),t); const baseMat=new THREE.MeshStandardMaterial({color:0x0b0f12,roughness:.5,metalness:.1});
  const base=new THREE.Mesh(baseGeo,baseMat); base.position.y=-t; group.add(base);
  const rimOuter=extrudeUp(shapeFromPath(footprintPath(tank,-.35)),tank.rimHeight,reversedShape(footprintPath(tank,t)));
  const rim=new THREE.Mesh(rimOuter,new THREE.MeshStandardMaterial({color:0x14181b,roughness:.35,metalness:.15})); rim.position.y=tank.outerHeight-tank.rimHeight; group.add(rim);
  const chamberZ=-tank.outerDepth/2+tank.rearChamberDepth;
  const chamber=new THREE.Mesh(new THREE.PlaneGeometry(tank.outerWidth-2*t,tank.outerHeight-2),new THREE.MeshStandardMaterial({color:0x0d1113,roughness:.7,side:THREE.DoubleSide}));
  chamber.position.set(0,(tank.outerHeight-2)/2,chamberZ); chamber.name='rear-chamber'; group.add(chamber);
  const waterShape=shapeFromPath(footprintPath(tank,t+.05)); const waterGeo=new THREE.ShapeGeometry(waterShape,24); waterGeo.rotateX(-Math.PI/2);
  const waterMat=new THREE.MeshStandardMaterial({color:0x9ed7e8,transparent:true,opacity:.28,roughness:.12,side:THREE.DoubleSide});
  waterMat.userData.uniforms={uTime:{value:0}}; waterMat.onBeforeCompile=shader=>{shader.uniforms.uTime=waterMat.userData.uniforms.uTime;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;').replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.y += sin(position.x*0.35 + uTime*1.1)*0.16 + sin(position.z*0.5 - uTime*0.8)*0.12;')};
  const water=new THREE.Mesh(waterGeo,waterMat); water.position.y=tank.waterLevel; water.name='water-surface'; group.add(water);
  const {R,zc,halfWidth}=frontArc(tank),inset=t+.4;
  function insideWater(x,y,z,margin=0){const m=inset+margin;if(y<margin||y>tank.waterLevel-margin)return false;if(Math.abs(x)>halfWidth-m)return false;if(z<chamberZ+m)return false;return Math.hypot(x,z-zc)<R-m}
  function containment(x,y,z,margin,out){out.set(0,0,0);const m=inset+margin,hx=halfWidth-m;if(x>hx)out.x-=x-hx;if(x<-hx)out.x-=x+hx;if(y<margin)out.y+=margin-y;const top=tank.waterLevel-margin;if(y>top)out.y-=y-top;const zb=chamberZ+m;if(z<zb)out.z+=zb-z;const dz=z-zc,d=Math.hypot(x,dz),lim=R-m;if(d>lim){const k=(d-lim)/(d||1);out.x-=x*k;out.z-=dz*k}return out}
  return {group,glass,water,glassMaterial:glassMat,materials:[waterMat],insideWater,containment,chamberZ,frontApexZ:zc+R,center:new THREE.Vector3(0,tank.outerHeight*.45,0),outerRadius:Math.max(halfWidth,tank.outerDepth/2)+6};
}
