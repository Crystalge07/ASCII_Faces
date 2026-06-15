import { CANVAS_W, CANVAS_H, HEAD_CHIN_ROW, FACE_CENTER_X } from './constants.js';

/** @param {string[]} rows */
function inkBounds(rows) {
  let inkTop = rows.length;
  let inkBottom = -1;
  let inkLeft = Infinity;
  let inkRight = -1;
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[i].length; j++) {
      if (rows[i][j] !== ' ') {
        inkTop = Math.min(inkTop, i);
        inkBottom = i;
        inkLeft = Math.min(inkLeft, j);
        inkRight = Math.max(inkRight, j);
      }
    }
  }
  if (inkBottom === -1) throw new Error('part has no visible ink');
  return { inkTop, inkBottom, inkLeft, inkRight };
}

/** @param {number} inkLeft @param {number} inkRight */
function centeredAnchorX(inkLeft, inkRight) {
  return Math.round(FACE_CENTER_X - (inkLeft + inkRight) / 2);
}

/**
 * @typedef {import('../data/parts.types.ts').RawPart} RawPart
 * @typedef {import('../data/parts.types.ts').NormalizedPart} NormalizedPart
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

  let anchor = { ...p.anchor };
  const bounds = inkBounds(rows);

  if (p.category === 'head') {
    anchor = {
      x: centeredAnchorX(bounds.inkLeft, bounds.inkRight),
      y: HEAD_CHIN_ROW - bounds.inkBottom,
    };
  } else if (p.category === 'eyes' || p.category === 'nose' || p.category === 'mouth') {
    anchor = {
      ...anchor,
      x: centeredAnchorX(bounds.inkLeft, bounds.inkRight),
    };
  }

  // bounds check against canvas
  if (
    anchor.x < 0 ||
    anchor.y < 0 ||
    anchor.x + width > CANVAS_W ||
    anchor.y + height > CANVAS_H
  )
    throw new Error(
      `part ${p.id} overflows canvas at anchor ${JSON.stringify(anchor)}`
    );

  return { ...p, anchor, width, height, rows };
}
