import { useLanguage } from '../../contexts/LanguageContext';
import styles from './TextHighlight.module.css';

interface Props {
  text: string;
  highlight: string | null;
}

function escapeRegex(word: string) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function TextHighlight({ text, highlight }: Props) {
  const { t } = useLanguage();
  if (!highlight) return null;

  const regex = new RegExp(`(\\b${escapeRegex(highlight)}\\b)`, 'gi');
  const parts = text.split(regex);

  return (
    <div className={styles.container}>
      <p className={styles.hint}>{t.highlight.hint(highlight)}</p>
      <div className={styles.text}>
        {parts.map((part, i) =>
          // split with a capturing group → odd indices are the captured matches
          i % 2 === 1 ? (
            <mark key={i} className={styles.mark}>
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </div>
    </div>
  );
}
