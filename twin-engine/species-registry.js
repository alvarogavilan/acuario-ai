/**
 * Registro de estado de renderer por especie.
 * Antes de esta pieza, engine.js lanzaba una excepción para cualquier
 * especie distinta de Amphiprion ocellaris, lo que tumbaba TODA la
 * reconstrucción 3D en cuanto el manifiesto incluía un pez real más
 * (p. ej. el cirujano azul o la damisela, que sí viven en el acuario).
 * Este registro deja que addFish() decida por especie sin arriesgar
 * el resto de la escena, y sin mostrar nunca una especie con el
 * modelo de otra.
 */
export const RENDER_STATUS = Object.freeze({
  PRODUCTION: 'PRODUCTION',
  BETA: 'BETA',
  PLACEHOLDER: 'PLACEHOLDER',
  NOT_AVAILABLE: 'NOT_AVAILABLE',
});

const REGISTRY = {
  // Segunda pasada de geometría/shader (perfil de cabeza, pedúnculo, bandas,
  // pareja) — sigue PRODUCTION porque es una mejora sobre un renderer que
  // ya se consideraba terminado, no un renderer nuevo sin validar.
  'Amphiprion ocellaris': RENDER_STATUS.PRODUCTION,
  // Renderers propios nuevos, sin validación visual real todavía (no hay
  // forma de renderizar y comparar contra foto en este entorno). BETA
  // hasta que se confirme en dispositivo real que la anatomía/color leen
  // bien y no PRODUCTION solo porque el código compila.
  'Paracanthurus hepatus': RENDER_STATUS.BETA,
  'Chrysiptera parasema': RENDER_STATUS.BETA,
};

export function speciesRenderStatus(species) {
  return REGISTRY[species] || RENDER_STATUS.NOT_AVAILABLE;
}

/** true solo para estados que ya tienen geometría 3D construible. */
export function hasRenderer(species) {
  const status = speciesRenderStatus(species);
  return status === RENDER_STATUS.PRODUCTION || status === RENDER_STATUS.BETA;
}
