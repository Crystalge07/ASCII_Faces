import manifest from './parts.json';
import { CATEGORY_ORDER } from '../engine/constants.js';
import { normalizePart } from '../engine/normalize.js';

/** @returns {{ ok: true, partsById: Record<string, object>, partsByCategory: Record<string, object[]>, defaults: Record<string, string> } | { ok: false, error: Error }} */
export function loadManifestData() {
  try {
    const normalizedParts = manifest.parts.map(normalizePart);
    const partsById = Object.fromEntries(normalizedParts.map((p) => [p.id, p]));
    const partsByCategory = CATEGORY_ORDER.reduce((acc, cat) => {
      acc[cat] = normalizedParts.filter((p) => p.category === cat);
      return acc;
    }, /** @type {Record<string, typeof normalizedParts>} */ ({}));

    const defaults = CATEGORY_ORDER.reduce((acc, cat) => {
      const first = partsByCategory[cat][0];
      if (!first) throw new Error(`No parts found for category: ${cat}`);
      acc[cat] = first.id;
      return acc;
    }, /** @type {Record<string, string>} */ ({}));

    return { ok: true, partsById, partsByCategory, defaults };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
