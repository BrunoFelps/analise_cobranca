import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './TextInput.module.css';

interface Props {
  onAnalyze: (text: string) => void;
}

export function TextInput({ onAnalyze }: Props) {
  const { t } = useLanguage();
  const [text, setText] = useState('');

  return (
    <div className={styles.container}>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={2048}
        placeholder={t.textInput.placeholder}
        rows={8}
      />
      <div className={styles.footer}>
        <span className={styles.charCount}>{t.textInput.charCount(text.length)}</span>
        <button className={styles.button} onClick={() => onAnalyze(text)}>
          {t.actions.translate}
        </button>
      </div>
    </div>
  );
}
