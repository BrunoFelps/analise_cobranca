import { describe, it, expect } from 'vitest';
import { parseWords } from './wordParser';

describe('parseWords', () => {
  it('returns empty array for empty string', () => {
    expect(parseWords('')).toEqual([]);
  });

  it('returns empty array for whitespace-only string', () => {
    expect(parseWords('   ')).toEqual([]);
  });

  it('counts a single word', () => {
    expect(parseWords('hello')).toEqual([{ word: 'hello', count: 1 }]);
  });

  it('counts repeated words', () => {
    const result = parseWords('the cat sat on the mat the');
    expect(result[0]).toEqual({ word: 'the', count: 3 });
  });

  it('is case-insensitive', () => {
    const result = parseWords('Hello hello HELLO');
    expect(result).toEqual([{ word: 'hello', count: 3 }]);
  });

  it('strips punctuation', () => {
    const result = parseWords('hello, world! hello.');
    expect(result[0]).toEqual({ word: 'hello', count: 2 });
  });

  it('sorts by frequency descending', () => {
    const result = parseWords('a a a b b c');
    expect(result.map((r) => r.count)).toEqual([3, 2, 1]);
  });

  it('sorts alphabetically when frequency is equal', () => {
    const result = parseWords('banana apple banana apple cherry cherry');
    const counts = result.map((r) => r.count);
    expect(counts).toEqual([2, 2, 2]);
    expect(result.map((r) => r.word)).toEqual(['apple', 'banana', 'cherry']);
  });
});
