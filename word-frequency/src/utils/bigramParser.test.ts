import { describe, it, expect } from 'vitest';
import { parseBigrams } from './bigramParser';

describe('parseBigrams', () => {
  it('returns empty array for empty string', () => {
    expect(parseBigrams('')).toEqual([]);
  });

  it('returns empty array for a single word', () => {
    expect(parseBigrams('hello')).toEqual([]);
  });

  it('returns empty when no bigram repeats', () => {
    expect(parseBigrams('one two three')).toEqual([]);
  });

  it('counts a repeated bigram', () => {
    const result = parseBigrams('the cat sat on the cat again');
    expect(result[0]).toEqual({ word: 'the cat', count: 2 });
  });

  it('is case-insensitive', () => {
    const result = parseBigrams('New York is in new york state');
    expect(result[0]).toEqual({ word: 'new york', count: 2 });
  });

  it('sorts by frequency descending', () => {
    const result = parseBigrams('a b a b a b c d c d');
    expect(result[0].count).toBeGreaterThanOrEqual(result[1].count);
  });

  it('excludes bigrams containing stop words when flag is set', () => {
    const result = parseBigrams('the cat the cat the dog', true);
    expect(result.every(({ word }) => !word.split(' ').some((w) => w === 'the'))).toBe(true);
  });
});
