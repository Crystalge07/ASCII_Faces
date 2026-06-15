import { describe, it, expect, vi, afterEach } from 'vitest';
import { randomSelection } from './randomFace.js';
import { CATEGORY_ORDER } from './constants.js';

describe('randomSelection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('picks one part id per category', () => {
    const partsByCategory = {
      head: [{ id: 'head_a' }, { id: 'head_b' }],
      eyes: [{ id: 'eyes_a' }],
      nose: [{ id: 'nose_a' }, { id: 'nose_b' }],
      mouth: [{ id: 'mouth_a' }],
      hair: [{ id: 'hair_a' }, { id: 'hair_b' }],
      facial_hair: [{ id: 'beard_a' }],
    };

    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const selection = randomSelection(partsByCategory);

    for (const cat of CATEGORY_ORDER) {
      expect(selection[cat]).toBe(partsByCategory[cat].at(-1).id);
    }
  });
});
