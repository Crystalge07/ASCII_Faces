import { describe, it, expect } from 'vitest';
import { composite } from './composite.js';
import { normalizePart } from './normalize.js';
import { LAYER_ORDER } from './constants.js';
import manifest from '../data/parts.json';
import { FAVICON_FACE } from './faviconFace.js';

describe('favicon face', () => {
  it('composites the configured preset parts', () => {
    const parts = LAYER_ORDER.map((cat) =>
      normalizePart(manifest.parts.find((p) => p.id === FAVICON_FACE[cat]))
    );
    const face = composite(parts);

    expect(face).toContain('.------.');
    expect(face).toContain('.    .');
    expect(face).toContain('J');
    expect(face).toContain('\\--/');
  });
});
