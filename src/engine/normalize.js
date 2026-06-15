import { CANVAS_W, CANVAS_H, HEAD_CHIN_ROW, FACE_CENTER_X } from './constants.js';

/** @param {string[]} rows */
function hasInk(rows) {
  for (const line of rows) {
    for (const ch of line) {
      if (ch !== ' ') return true;
    }
  }
  return false;
}
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
  const inkCenter = (inkLeft + inkRight) / 2;
  const idealAnchor = FACE_CENTER_X - inkCenter;
  const inkSpan = inkRight - inkLeft + 1;
  // Odd spans can't sit on 9.5; bias left so ink straddles cols 9–10.
  if (inkSpan % 2 === 1) return Math.floor(idealAnchor + 1e-9);
  return Math.round(idealAnchor);
}

/** Center a part's full row width on the face (symmetric features). */
function centeredAnchorXByWidth(width) {
  return Math.round(FACE_CENTER_X - (width - 1) / 2);
}

const SYMMETRIC_FACE_CATEGORIES = new Set(['eyes', 'hair', 'facial_hair']);

const INK_CENTERED_FACE_CATEGORIES = new Set(['nose', 'mouth']);

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
  if (hasInk(rows)) {
    const bounds = inkBounds(rows);
    if (p.category === 'head') {
      const chinRow =
        p.id === 'head_blob_01'
          ? HEAD_CHIN_ROW - 1
          : HEAD_CHIN_ROW;
      anchor = {
        x: centeredAnchorX(bounds.inkLeft, bounds.inkRight),
        y: chinRow - bounds.inkBottom,
      };
    } else if (INK_CENTERED_FACE_CATEGORIES.has(p.category)) {
      if (p.id !== 'nose_curl_01') {
        anchor = {
          ...anchor,
          x: centeredAnchorX(bounds.inkLeft, bounds.inkRight),
        };
      }
    } else if (SYMMETRIC_FACE_CATEGORIES.has(p.category)) {
      anchor = {
        ...anchor,
        x: centeredAnchorXByWidth(width),
      };
    }
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
