import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import manifest from '../data/parts.json';
import schema from '../data/parts.schema.json';
import { normalizePart } from '../engine/normalize.js';

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
    const ids = new Set();
    for (const part of manifest.parts) {
      expect(() => normalizePart(part)).not.toThrow();
      expect(ids.has(part.id)).toBe(false);
      ids.add(part.id);
    }
  });

  it('has at least one part per category', () => {
    for (const category of manifest.categories) {
      const count = manifest.parts.filter((p) => p.category === category).length;
      expect(count).toBeGreaterThan(0);
    }
  });
});
