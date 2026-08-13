/**
 * Punto de entrada de fauna: une los tres renderers específicos por
 * especie y el sistema de nado compartido. engine.js solo conoce este
 * fichero; nunca construye geometría directamente.
 */
export {Swimmer} from './fauna-common.js';
import {createOcellaris} from './fauna-ocellaris.js';
import {createHepatus} from './fauna-hepatus.js';
import {createParasema} from './fauna-parasema.js';

/** especie → fábrica de geometría. Una entrada = un renderer PRODUCTION/BETA real y propio. */
export const RENDERERS={
  'Amphiprion ocellaris':createOcellaris,
  'Paracanthurus hepatus':createHepatus,
  'Chrysiptera parasema':createParasema,
};
