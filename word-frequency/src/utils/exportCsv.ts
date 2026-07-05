import type { WordFrequency } from '../types';

export function exportCsv(data: WordFrequency[]) {
  const rows = ['word,count', ...data.map(({ word, count }) => `${word},${count}`)];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'word-frequency.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}
