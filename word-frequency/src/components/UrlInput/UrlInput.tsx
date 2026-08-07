import { useState } from 'react';
import { fetchUrlText } from '../../utils/fetchUrlText';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './UrlInput.module.css';

interface Props {
  onAnalyze: (text: string) => void;
  onError: (message: string) => void;
}

export function UrlInput({ onAnalyze, onError }: Props) {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleFetch() {
    if (!url.trim()) {
      onError(t.errors.emptyUrl);
      return;
    }

    setLoading(true);
    onError('');

    try {
      const text = await fetchUrlText(url.trim());
      if (!text.trim()) {
        onError(t.errors.noText);
        return;
      }
      onAnalyze(text);
    } catch (err) {
      onError(err instanceof Error ? err.message : t.errors.fetchFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={t.urlInput.placeholder}
        onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
      />
      <button className={styles.button} onClick={handleFetch} disabled={loading}>
        {loading ? t.actions.fetching : t.actions.fetchAndAnalyze}
      </button>
    </div>
  );
}
