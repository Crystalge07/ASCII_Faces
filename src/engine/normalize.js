import { CANVAS_W, CANVAS_H } from './constants.js';

/**
 * @typedef {Object} RawPart
 * @property {string} id
 * @property {string} category
 * @property {{ x: number, y: number }} anchor
 * @property {string[]} rows
 */

/**
 * @typedef {RawPart & { width: number, height: number }} NormalizedPart
 */

/** Throws on invalid parts. Pads rows to uniform width. */
export function normalizePart(p) {
  if (!p.id || !p.category) throw new Error(`part missing id/category`);
  if (!Array.isArray(p.rows) || p.rows.length === 0)
    throw new Error(`part ${p.id} has no rows`);

  // strict ASCII guard — catch stray Unicode at load time, loudly
  for (const line of p.rows) {
    for (const ch of line) {
      const code = ch.codePointAt(0);
      if (code < 0x20 || code > 0x7e)
        throw new Error(`part ${p.id} has non-ASCII char: ${JSON.stringify(ch)}`);
    }
  }

  const width = Math.max(...p.rows.map((r) => r.length));
  const height = p.rows.length;
  const rows = p.rows.map((r) => r.padEnd(width, ' '));

  // bounds check against canvas
  if (
    p.anchor.x < 0 ||
    p.anchor.y < 0 ||
    p.anchor.x + width > CANVAS_W ||
    p.anchor.y + height > CANVAS_H
  )
    throw new Error(
      `part ${p.id} overflows canvas at anchor ${JSON.stringify(p.anchor)}`
    );

  return { ...p, width, height, rows };
}
