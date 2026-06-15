import { describe, it, expect } from 'vitest';
import { composite } from './composite.js';
import { CANVAS_W, CANVAS_H, HEAD_CHIN_ROW } from './constants.js';
import { normalizePart } from './normalize.js';

describe('composite', () => {
  it('returns an all-space grid of correct dimensions for empty parts list', () => {
    const result = composite([]);
    const rows = result.split('\n');
    expect(rows).toHaveLength(CANVAS_H);
    expect(rows.every((r) => r.length === CANVAS_W && r === ' '.repeat(CANVAS_W))).toBe(
      true
    );
  });

  it('stacks parts in z-order with top layer overwriting bottom', () => {
    const head = normalizePart({
      id: 'head',
      category: 'head',
      anchor: { x: 0, y: 0 },
      rows: ['####'],
    });
    const mouth = normalizePart({
      id: 'mouth',
      category: 'mouth',
      anchor: { x: 0, y: 0 },
      rows: ['oooo'],
    });
    const result = composite([mouth, head]);
    expect(result.split('\n')[0].slice(0, 4)).toBe('oooo');
  });

  it('treats spaces in parts as transparent', () => {
    const head = normalizePart({
      id: 'head',
      category: 'head',
      anchor: { x: 0, y: 0 },
      rows: ['####'],
    });
    const eyes = normalizePart({
      id: 'eyes',
      category: 'eyes',
      anchor: { x: 1, y: HEAD_CHIN_ROW },
      rows: [' o '],
    });
    const result = composite([head, eyes]);
    expect(result.split('\n')[HEAD_CHIN_ROW].slice(0, 4)).toBe('##o#');
  });

  it('clips parts at the canvas edge', () => {
    const part = {
      id: 'edge',
      category: 'head',
      anchor: { x: CANVAS_W - 2, y: CANVAS_H - 1 },
      rows: ['ABCD', 'EFGH'],
      width: 4,
      height: 2,
    };
    const result = composite([part]);
    const rows = result.split('\n');
    expect(rows[CANVAS_H - 1]).toBe(' '.repeat(CANVAS_W - 2) + 'AB');
    expect(rows[CANVAS_H - 1].length).toBe(CANVAS_W);
  });
});
