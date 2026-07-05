import type { WordFrequency } from '../types';
import { STOP_WORDS } from './stopWords';

export function parseBigrams(text: string, excludeStopWords = false): WordFrequency[] {
  const normalized = text.toLowerCase().replace(/[^a-záàâãéèêíïóôõöúçñ\s]/gi, '');
  const words = normalized.split(/\s+/).filter((w) => w.length > 0);

  const counts = new Map<string, number>();

  for (let i = 0; i < words.length - 1; i++) {
    const a = words[i];
    const b = words[i + 1];
    if (excludeStopWords && (STOP_WORDS.has(a) || STOP_WORDS.has(b))) continue;
    const bigram = `${a} ${b}`;
    counts.set(bigram, (counts.get(bigram) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .filter(({ count }) => count > 1)
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
}
