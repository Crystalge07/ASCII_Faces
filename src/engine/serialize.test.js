import { describe, it, expect } from 'vitest';
import { encode, decode } from './serialize.js';

describe('serialize', () => {
  it('round-trips selection via encode/decode', () => {
    const selection = {
      head: 'head_01',
      eyes: 'eyes_round_01',
      mouth: 'mouth_smile_01',
    };
    expect(decode(encode(selection))).toEqual(selection);
  });

  it('tolerates junk or missing hash', () => {
    expect(decode('')).toEqual({});
    expect(decode('#')).toEqual({});
    expect(decode('not-a-valid-pair')).toEqual({ 'not-a-valid-pair': '' });
  });

  it('encodes special characters in part ids', () => {
    const selection = { head: 'head/with spaces' };
    const encoded = encode(selection);
    expect(decode(encoded)).toEqual(selection);
  });
});
