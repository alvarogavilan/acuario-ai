/**
 * Single source of truth for the deployed renderer version.
 * BUILD_SHA is rewritten by CI (see TWIN_ENGINE.md → "Inyección de SHA").
 * If you ever see "dev-local" in the badge on GitHub Pages, CI did not run.
 */
export const TWIN_ENGINE_VERSION = '0.5.2';
export const BUILD_SHA = '__BUILD_SHA__';
export const BUILD_TIME = '__BUILD_TIME__';

/** Used for the SW cache name and for every ?v= query on assets. */
export const BUILD_ID = `${TWIN_ENGINE_VERSION}-${BUILD_SHA}`;
