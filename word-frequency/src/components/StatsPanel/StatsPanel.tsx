import { useLanguage } from '../../contexts/LanguageContext';
import type { WordFrequency } from '../../types';
import styles from './StatsPanel.module.css';

interface Props {
  data: WordFrequency[];
}

export function StatsPanel({ data }: Props) {
  const { t } = useLanguage();
  if (data.length === 0) return null;

  const totalWords = data.reduce((sum, r) => sum + r.count, 0);
  const uniqueWords = data.length;
  const topWord = data[0];

  return (
    <div className={styles.panel}>
      <div className={styles.card}>
        <span className={styles.value}>{totalWords.toLocaleString()}</span>
        <span className={styles.label}>{t.stats.totalWords}</span>
      </div>
      <div className={styles.card}>
        <span className={styles.value}>{uniqueWords.toLocaleString()}</span>
        <span className={styles.label}>{t.stats.uniqueWords}</span>
      </div>
      <div className={styles.card}>
        <span className={styles.value}>{topWord.word}</span>
        <span className={styles.label}>{t.stats.topWord(topWord.count)}</span>
      </div>
      <div className={styles.card}>
        <span className={styles.value}>
          {((uniqueWords / totalWords) * 100).toFixed(1)}%
        </span>
        <span className={styles.label}>{t.stats.lexicalDiversity}</span>
      </div>
    </div>
  );
}
