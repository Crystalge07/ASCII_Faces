import { CANVAS_W, CANVAS_H, LAYER_ORDER, TRANSPARENT_CHAR } from './constants.js';

/** @param {import('./normalize.js').NormalizedPart} head */
function headInkTop(head) {
  let top = Infinity;
  head.rows.forEach((line, r) => {
    if ([...line].some((ch) => ch !== ' ')) top = Math.min(top, head.anchor.y + r);
  });
  return top;
}

/** @param {import('./normalize.js').NormalizedPart} hair */
function hairInkBottom(hair) {
  let bottom = -1;
  hair.rows.forEach((line, r) => {
    if ([...line].some((ch) => ch !== ' ')) bottom = Math.max(bottom, hair.anchor.y + r);
  });
  return bottom;
}

/** Seat hair on the head crown so it does not float above shorter heads. */
export function alignHairToHead(parts) {
  const head = parts.find((p) => p.category === 'head');
  const hairIdx = parts.findIndex((p) => p.category === 'hair');
  if (!head || hairIdx === -1) return parts;

  const hair = parts[hairIdx];
  if (!hair.rows.some((line) => [...line].some((ch) => ch !== ' '))) return parts;

  const targetBottom = headInkTop(head) - 1;
  const dy = targetBottom - hairInkBottom(hair);
  if (dy === 0) return parts;

  const aligned = [...parts];
  aligned[hairIdx] = {
    ...hair,
    anchor: { ...hair.anchor, y: hair.anchor.y + dy },
  };
  return aligned;
}

// parts: array of normalized parts (any order). Returns a string with '\n'
// separating rows. Spaces in parts are transparent.
export function composite(parts, w = CANVAS_W, h = CANVAS_H) {
  const grid = Array.from({ length: h }, () => Array(w).fill(' '));
  const ordered = alignHairToHead(parts).sort(
    (a, b) => LAYER_ORDER.indexOf(a.category) - LAYER_ORDER.indexOf(b.category)
  );

  for (const part of ordered) {
    part.rows.forEach((line, r) => {
      const y = part.anchor.y + r;
      if (y < 0 || y >= h) return;
      for (let c = 0; c < line.length; c++) {
        const ch = line[c];
        if (ch === TRANSPARENT_CHAR) continue; // transparent
        const x = part.anchor.x + c;
        if (x < 0 || x >= w) continue;
        grid[y][x] = ch;
      }
    });
  }
  return grid.map((row) => row.join('')).join('\n');
}
