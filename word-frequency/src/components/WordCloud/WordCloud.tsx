import type { WordFrequency } from '../../types';
import styles from './WordCloud.module.css';

interface Props {
  data: WordFrequency[];
}

const COLORS = [
  '#4f46e5', '#7c3aed', '#db2777', '#ea580c',
  '#16a34a', '#0891b2', '#9333ea', '#b45309',
  '#0369a1', '#be185d', '#15803d', '#c2410c',
];

const MIN_FONT = 0.85;
const MAX_FONT = 3.2;
const MAX_WORDS = 60;

export function WordCloud({ data }: Props) {
  if (data.length === 0) return null;

  const words = data.slice(0, MAX_WORDS);
  const minCount = words[words.length - 1].count;
  const maxCount = words[0].count;
  const range = maxCount - minCount || 1;

  return (
    <div className={styles.cloud}>
      {words.map(({ word, count }, i) => {
        const size = MIN_FONT + ((count - minCount) / range) * (MAX_FONT - MIN_FONT);
        const color = COLORS[i % COLORS.length];
        return (
          <span
            key={word}
            className={styles.word}
            style={{ fontSize: `${size}rem`, color }}
            title={`${word}: ${count}`}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}
