import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import manifest from '../data/parts.json';
import schema from '../data/parts.schema.json';
import { normalizePart } from '../engine/normalize.js';
import { HEAD_CHIN_ROW, FACE_CENTER_X } from '../engine/constants.js';

describe('parts manifest', () => {
  it('validates against parts.schema.json', () => {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(manifest);
    if (!valid) {
      console.error(validate.errors);
    }
    expect(valid).toBe(true);
  });

  it('every part passes normalizePart without throwing', () => {
    expect(manifest.parts).toHaveLength(40);

    const ids = new Set();
    /** @type {{ id: string, error: string }[]} */
    const failures = [];

    for (const part of manifest.parts) {
      if (ids.has(part.id)) {
        failures.push({ id: part.id, error: 'duplicate id' });
        continue;
      }
      ids.add(part.id);

      try {
        normalizePart(part);
      } catch (error) {
        failures.push({
          id: part.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (failures.length) {
      console.error('Parts that failed normalizePart:', failures);
    }

    expect(failures).toEqual([]);
  });

  it('has at least one part per category', () => {
    for (const category of manifest.categories) {
      const count = manifest.parts.filter((p) => p.category === category).length;
      expect(count).toBeGreaterThan(0);
    }
  });

  it('aligns all head chins to HEAD_CHIN_ROW', () => {
    const heads = manifest.parts
      .filter((p) => p.category === 'head')
      .map(normalizePart);

    for (const head of heads) {
      let inkBottom = -1;
      head.rows.forEach((line, i) => {
        if ([...line].some((ch) => ch !== ' ')) inkBottom = i;
      });
      expect(head.anchor.y + inkBottom).toBe(HEAD_CHIN_ROW);
    }
  });

  it('horizontally centers heads and features on FACE_CENTER_X', () => {
    const symmetric = new Set(['eyes', 'hair', 'facial_hair']);

    for (const part of manifest.parts.map(normalizePart)) {
      if (!part.rows.some((line) => [...line].some((ch) => ch !== ' '))) continue;

      if (symmetric.has(part.category)) {
        const slotCenter = part.anchor.x + (part.width - 1) / 2;
        expect(Math.abs(slotCenter - FACE_CENTER_X)).toBeLessThanOrEqual(0.5);
        continue;
      }

      let inkLeft = Infinity;
      let inkRight = -1;
      part.rows.forEach((line) => {
        [...line].forEach((ch, i) => {
          if (ch !== ' ') {
            inkLeft = Math.min(inkLeft, i);
            inkRight = Math.max(inkRight, i);
          }
        });
      });
      const inkCenter = part.anchor.x + (inkLeft + inkRight) / 2;
      expect(Math.abs(inkCenter - FACE_CENTER_X)).toBeLessThanOrEqual(0.5);

      if (part.category === 'mouth') {
        const inkWidth = inkRight - inkLeft + 1;
        expect(inkWidth % 2).toBe(0);
        expect(inkCenter).toBe(FACE_CENTER_X);
      }

      if (part.category === 'nose' && part.id !== 'nose_curl_01') {
        const inkWidth = inkRight - inkLeft + 1;
        expect(inkWidth % 2).toBe(0);
        expect(inkCenter).toBe(FACE_CENTER_X);
      }
    }
  });
});
