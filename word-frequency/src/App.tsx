import { useState } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { useWordFrequency } from './hooks/useWordFrequency';
import { TextInput } from './components/TextInput/TextInput';
import { UrlInput } from './components/UrlInput/UrlInput';
import { FrequencyTable } from './components/FrequencyTable/FrequencyTable';
import { FrequencyChart } from './components/FrequencyChart/FrequencyChart';
import { WordCloud } from './components/WordCloud/WordCloud';
import { StatsPanel } from './components/StatsPanel/StatsPanel';
import { TextHighlight } from './components/TextHighlight/TextHighlight';
import { ErrorMessage } from './components/ErrorMessage/ErrorMessage';
import { exportCsv } from './utils/exportCsv';
import { parseBigrams } from './utils/bigramParser';
import styles from './App.module.css';

type InputMode = 'text' | 'url';
type ViewMode = 'table' | 'chart' | 'cloud' | 'bigrams';

const SUBTITLE = {
  en: 'Analyze word frequency in any text or webpage',
  pt: 'Analise a frequência de palavras em textos ou páginas web',
};

export default function App() {
  const { t, lang, setLang } = useLanguage();
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  const { results, rawText, error, excludeStopWords, analyze, setError, toggleStopWords, reset } =
    useWordFrequency();

  const bigrams = viewMode === 'bigrams' ? parseBigrams(rawText, excludeStopWords) : [];

  function handleInputModeChange(next: InputMode) {
    setInputMode(next);
    reset();
  }

  function handleAnalyze(text: string) {
    if (!text.trim()) {
      setError(t.errors.emptyInput);
      return;
    }
    analyze(text);
  }

  return (
    <div className={styles.page}>
      <main className={styles.card}>

        {/* ── Header ── */}
        <header className={styles.cardHeader}>
          <div className={styles.brand}>
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.subtitle}>{SUBTITLE[lang]}</p>
          </div>
          <button
            className={styles.langToggle}
            onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}
            title="Switch language / Trocar idioma"
          >
            {lang === 'en' ? '🇧🇷 PT' : '🇺🇸 EN'}
          </button>
        </header>

        {/* ── Body ── */}
        <div className={styles.cardBody}>

          {/* Input mode tabs */}
          <div className={styles.tabs}>
            {(['text', 'url'] as InputMode[]).map((m) => (
              <button
                key={m}
                className={`${styles.tab} ${inputMode === m ? styles.tabActive : ''}`}
                onClick={() => handleInputModeChange(m)}
              >
                {t.tabs[m]}
              </button>
            ))}
          </div>

          {inputMode === 'text' ? (
            <TextInput onAnalyze={handleAnalyze} />
          ) : (
            <UrlInput onAnalyze={analyze} onError={setError} />
          )}

          <label className={styles.stopWordsToggle}>
            <input
              type="checkbox"
              checked={excludeStopWords}
              onChange={(e) => toggleStopWords(e.target.checked)}
            />
            {t.stopWords}
          </label>

          <ErrorMessage message={error} />

          {results.length > 0 && (
            <div className={styles.resultsSection}>
              <StatsPanel data={results} />

              <div className={styles.resultsControls}>
                <span className={styles.totalCount}>{t.results.uniqueWords(results.length)}</span>
                <div className={styles.actions}>
                  <button className={styles.actionButton} onClick={() => exportCsv(results)}>
                    {t.actions.exportCsv}
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.clearButton}`}
                    onClick={reset}
                  >
                    {t.actions.clear}
                  </button>
                </div>
              </div>

              <div className={styles.viewTabs}>
                {(['table', 'chart', 'cloud', 'bigrams'] as ViewMode[]).map((v) => (
                  <button
                    key={v}
                    className={`${styles.viewTab} ${viewMode === v ? styles.viewTabActive : ''}`}
                    onClick={() => setViewMode(v)}
                  >
                    {t.views[v]}
                  </button>
                ))}
              </div>

              {viewMode === 'table' && (
                <>
                  <FrequencyTable data={results} onWordHover={setHoveredWord} />
                  <TextHighlight text={rawText} highlight={hoveredWord} />
                </>
              )}
              {viewMode === 'chart' && <FrequencyChart data={results} />}
              {viewMode === 'cloud' && <WordCloud data={results} />}
              {viewMode === 'bigrams' && (
                bigrams.length > 0 ? (
                  <FrequencyTable data={bigrams} />
                ) : (
                  <p className={styles.emptyBigrams}>{t.bigrams.empty}</p>
                )
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
