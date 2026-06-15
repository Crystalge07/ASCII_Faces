import { describe, it, expect } from 'vitest';
import { normalizePart } from './normalize.js';
import { CANVAS_W, CANVAS_H, HEAD_CHIN_ROW, FACE_CENTER_X } from './constants.js';

describe('normalizePart', () => {
  it('pads uneven rows to uniform width', () => {
    const part = normalizePart({
      id: 'test',
      category: 'head',
      anchor: { x: 0, y: 0 },
      rows: ['AB', 'CDE'],
    });
    expect(part.rows).toEqual(['AB ', 'CDE']);
    expect(part.width).toBe(3);
    expect(part.height).toBe(2);
  });

  it('throws on non-ASCII characters', () => {
    expect(() =>
      normalizePart({
        id: 'bad',
        category: 'head',
        anchor: { x: 0, y: 0 },
        rows: ['( ◕   ◕ )'],
      })
    ).toThrow(/non-ASCII/);
  });

  it('throws when anchor + size overflows the canvas', () => {
    expect(() =>
      normalizePart({
        id: 'overflow',
        category: 'head',
        anchor: { x: 0, y: 0 },
        rows: ['A'.repeat(CANVAS_W + 1)],
      })
    ).toThrow(/overflows canvas/);
  });

  it('throws on empty rows', () => {
    expect(() =>
      normalizePart({
        id: 'empty',
        category: 'head',
        anchor: { x: 0, y: 0 },
        rows: [],
      })
    ).toThrow(/no rows/);
  });

  it('bottom-aligns head parts to HEAD_CHIN_ROW', () => {
    const part = normalizePart({
      id: 'short',
      category: 'head',
      anchor: { x: 2, y: 5 },
      rows: ['  .--.  ', ' /    \\ ', " '----' "],
    });
    expect(part.anchor.y).toBe(HEAD_CHIN_ROW - 2);
  });

  it('horizontally centers face features on FACE_CENTER_X', () => {
    const eyes = normalizePart({
      id: 'eyes',
      category: 'eyes',
      anchor: { x: 0, y: 5 },
      rows: ['.    .'],
    });
    expect(eyes.anchor.x + (eyes.width - 1) / 2).toBe(FACE_CENTER_X);
  });

  it('allows asymmetric nose placement via ink centering', () => {
    const nose = normalizePart({
      id: 'nose',
      category: 'nose',
      anchor: { x: 0, y: 6 },
      rows: ['J'],
    });
    expect(nose.anchor.x).toBe(10);
  });
});
