import { buildFaviconFaceLines } from './engine/faviconFace.js';

const INK = '#000000';
const PAPER = '#ffffff';
const OUT_SIZE = 128;

/** @param {string[]} lines */
function faceToDataUrl(lines) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('canvas unsupported');

  const rows = lines.length;
  const cols = Math.max(...lines.map((line) => line.length));
  const pad = 6;
  const cell = Math.floor(
    Math.min((OUT_SIZE - pad * 2) / cols, (OUT_SIZE - pad * 2) / rows)
  );
  const gridW = cols * cell;
  const gridH = rows * cell;
  const startX = Math.floor((OUT_SIZE - gridW) / 2);
  const startY = Math.floor((OUT_SIZE - gridH) / 2);

  canvas.width = OUT_SIZE;
  canvas.height = OUT_SIZE;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, OUT_SIZE, OUT_SIZE);
  ctx.fillStyle = INK;

  lines.forEach((line, row) => {
    [...line].forEach((ch, col) => {
      if (ch === ' ') return;
      ctx.fillRect(startX + col * cell, startY + row * cell, cell, cell);
    });
  });

  return canvas.toDataURL('image/png');
}

export function setFavicon() {
  const href = faceToDataUrl(buildFaviconFaceLines());

  for (const rel of ['icon', 'shortcut icon']) {
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = href;
  }
}
