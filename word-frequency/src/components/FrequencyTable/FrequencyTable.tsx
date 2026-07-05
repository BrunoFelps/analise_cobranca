import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { WordFrequency } from '../../types';
import styles from './FrequencyTable.module.css';

interface Props {
  data: WordFrequency[];
  onWordHover?: (word: string | null) => void;
}

export function FrequencyTable({ data, onWordHover }: Props) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  if (data.length === 0) return null;

  const filtered = search
    ? data.filter(({ word }) => word.includes(search.toLowerCase()))
    : data;

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder={t.table.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className={styles.count}>{t.table.wordCount(filtered.length, data.length)}</span>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.header}>{t.table.word}</th>
            <th className={styles.header}>{t.table.frequency}</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map(({ word, count }) => (
              <tr
                key={word}
                className={styles.row}
                onMouseEnter={() => onWordHover?.(word)}
                onMouseLeave={() => onWordHover?.(null)}
              >
                <td className={styles.cell}>{word}</td>
                <td className={styles.cell}>{count}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className={styles.empty} colSpan={2}>
                {t.table.noMatch}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
