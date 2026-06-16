import manifest from '../data/parts.json';
import { normalizePart } from './normalize.js';
import { composite } from './composite.js';
import { LAYER_ORDER } from './constants.js';

/** 1-based gallery indices: head 1, eyes 10, nose 3, mouth 9, no hair/beard. */
export const FAVICON_FACE = {
  head: 'head_round_01',
  eyes: 'eyes_micro_01',
  nose: 'nose_curl_01',
  mouth: 'mouth_frown_01',
  hair: 'hair_boy_bald_01',
  facial_hair: 'facial_hair_none_01',
};

/** @param {string} face */
export function cropFace(face) {
  const rows = face.split('\n');
  let top = rows.length;
  let bottom = -1;
  let left = Infinity;
  let right = -1;

  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== ' ') {
        top = Math.min(top, y);
        bottom = y;
        left = Math.min(left, x);
        right = Math.max(right, x);
      }
    });
  });

  if (bottom === -1) return ['?'];

  return rows
    .slice(top, bottom + 1)
    .map((row) => row.slice(left, right + 1));
}

export function buildFaviconFaceLines() {
  const parts = LAYER_ORDER.map((cat) => {
    const raw = manifest.parts.find((p) => p.id === FAVICON_FACE[cat]);
    if (!raw) throw new Error(`favicon part missing: ${cat}`);
    return normalizePart(raw);
  });
  return cropFace(composite(parts));
}
