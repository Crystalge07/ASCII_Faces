import { CATEGORY_ORDER } from './constants.js';

/**
 * @param {Record<string, { id: string }[]>} partsByCategory
 * @returns {Record<string, string>}
 */
export function randomSelection(partsByCategory) {
  return CATEGORY_ORDER.reduce((acc, cat) => {
    const variants = partsByCategory[cat];
    if (!variants?.length) return acc;
    const pick = variants[Math.floor(Math.random() * variants.length)];
    acc[cat] = pick.id;
    return acc;
  }, /** @type {Record<string, string>} */ ({}));
}
