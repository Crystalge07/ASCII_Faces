import { CANVAS_W, CANVAS_H, LAYER_ORDER, TRANSPARENT_CHAR } from './constants.js';

// parts: array of normalized parts (any order). Returns a string with '\n'
// separating rows. Spaces in parts are transparent.
export function composite(parts, w = CANVAS_W, h = CANVAS_H) {
  const grid = Array.from({ length: h }, () => Array(w).fill(' '));

  // sort by layer so top layers overwrite bottom ones
  const ordered = [...parts].sort(
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
