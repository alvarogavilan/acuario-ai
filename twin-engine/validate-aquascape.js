#!/usr/bin/env node
'use strict';
/**
 * Validador de plausibilidad geométrica del aquascape.
 *
 * No compara contra fotografías (no hay acceso a las imágenes originales
 * en este pipeline), así que no puede medir fidelidad fotográfica. Lo que
 * SÍ puede comprobar con los datos que tenemos:
 *   1. Que ningún punto de las siluetas caiga fuera del volumen interior
 *      real de la urna (cristal frontal curvo incluido — misma fórmula
 *      que tank.js usa para el containment de los peces).
 *   2. Consistencia cruzada entre vistas: el rango de x que implica la
 *      silueta 'front' debe parecerse al que implica 'top', y el rango de
 *      y de 'front' debe parecerse al de 'side' — es la comprobación
 *      básica de un visual hull con siluetas independientes.
 *   3. Que las dos islas no invadan el canal central declarado.
 * Errores (fuera del volumen físico) hacen fallar el build. Avisos
 * (inconsistencia entre vistas) no rompen CI pero quedan en el log.
 */
const path = require('path');
const manifest = require(path.join(__dirname, 'aquascape.manifest.json'));
const tank = manifest.tank;

function frontArc(t) {
  const a = t.outerWidth / 2, s = t.frontBow;
  const R = (a * a + s * s) / (2 * s);
  const apex = t.frontEdgeZ + s;
  const zc = apex - R;
  return { R, zc, halfWidth: a };
}
const { R, zc, halfWidth } = frontArc(tank);
function frontLimitZ(x) {
  const inner = Math.max(0, R * R - x * x);
  return zc + Math.sqrt(inner);
}
const backZ = -tank.outerDepth / 2;
const MARGIN = 1.5; // cm de tolerancia (grosor de cristal + margen de trazado)

const errors = [];
const warnings = [];

function range(pts, idx) {
  const vals = pts.map(p => p[idx]);
  return [Math.min(...vals), Math.max(...vals)];
}

for (const island of manifest.scape.islands || []) {
  const s = island.silhouettes;
  if (!s || !s.front || !s.top || !s.side) {
    errors.push(`${island.id}: faltan siluetas front/top/side`);
    continue;
  }
  for (const [x, y] of s.front) {
    if (Math.abs(x) > halfWidth + MARGIN) errors.push(`${island.id} front: x=${x} excede la semianchura interior (${halfWidth.toFixed(1)})`);
    if (y < -MARGIN) errors.push(`${island.id} front: y=${y} por debajo del cristal inferior`);
    if (y > tank.outerHeight + MARGIN) errors.push(`${island.id} front: y=${y} excede la altura interior (${tank.outerHeight})`);
  }
  for (const [x, z] of s.top) {
    if (Math.abs(x) > halfWidth + MARGIN) errors.push(`${island.id} top: x=${x} excede la semianchura interior`);
    if (z < backZ - MARGIN) errors.push(`${island.id} top: z=${z} detrás del cristal trasero (${backZ.toFixed(1)})`);
    const zLimit = frontLimitZ(x);
    if (z > zLimit + MARGIN) errors.push(`${island.id} top: z=${z} sobresale del cristal frontal curvo en x=${x} (límite ${zLimit.toFixed(1)})`);
  }
  for (const [z, y] of s.side) {
    if (y < -MARGIN) errors.push(`${island.id} side: y=${y} por debajo del cristal inferior`);
    if (y > tank.outerHeight + MARGIN) errors.push(`${island.id} side: y=${y} excede la altura interior`);
    if (z < backZ - MARGIN) errors.push(`${island.id} side: z=${z} detrás del cristal trasero`);
  }
  const [fMinX, fMaxX] = range(s.front, 0), [tMinX, tMaxX] = range(s.top, 0);
  const X_TOL = 3;
  if (Math.abs(fMinX - tMinX) > X_TOL || Math.abs(fMaxX - tMaxX) > X_TOL) {
    warnings.push(`${island.id}: rango de x en 'front' (${fMinX.toFixed(1)}..${fMaxX.toFixed(1)}) vs 'top' (${tMinX.toFixed(1)}..${tMaxX.toFixed(1)}) difiere más de ${X_TOL} cm`);
  }
  const [fMinY, fMaxY] = range(s.front, 1), [sMinY, sMaxY] = range(s.side, 1);
  const Y_TOL = 3;
  if (Math.abs(fMinY - sMinY) > Y_TOL || Math.abs(fMaxY - sMaxY) > Y_TOL) {
    warnings.push(`${island.id}: rango de y en 'front' (${fMinY.toFixed(1)}..${fMaxY.toFixed(1)}) vs 'side' (${sMinY.toFixed(1)}..${sMaxY.toFixed(1)}) difiere más de ${Y_TOL} cm`);
  }
}

const channel = manifest.scape.channel;
if (channel) {
  for (const island of manifest.scape.islands || []) {
    const [minX, maxX] = range(island.silhouettes.front, 0);
    if (island.id.includes('izquierda') && maxX > channel.xMin + 0.5) warnings.push(`isla-izquierda invade el canal central (max x=${maxX}, canal empieza en ${channel.xMin})`);
    if (island.id.includes('derecha') && minX < channel.xMax - 0.5) warnings.push(`isla-derecha invade el canal central (min x=${minX}, canal termina en ${channel.xMax})`);
  }
}

console.log(`Aquascape geometric plausibility: ${(manifest.scape.islands || []).length} islas, ${errors.length} errores, ${warnings.length} avisos.`);
for (const w of warnings) console.log(`  AVISO: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`  ERROR: ${e}`);
  process.exit(1);
}
