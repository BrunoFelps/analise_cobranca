import type { WordFrequency } from '../types';
import { STOP_WORDS } from './stopWords';

export function parseWords(text: string, excludeStopWords = false): WordFrequency[] {
  const normalized = text.toLowerCase().replace(/[^a-záàâãéèêíïóôõöúçñ\s]/gi, '');
  const words = normalized
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .filter((w) => !excludeStopWords || !STOP_WORDS.has(w));

  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
}
