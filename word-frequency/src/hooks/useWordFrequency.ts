import { useState } from 'react';
import { parseWords } from '../utils/wordParser';
import type { WordFrequency } from '../types';

interface UseWordFrequencyReturn {
  results: WordFrequency[];
  rawText: string;
  error: string;
  excludeStopWords: boolean;
  analyze: (text: string) => void;
  setError: (message: string) => void;
  toggleStopWords: (exclude: boolean) => void;
  reset: () => void;
}

export function useWordFrequency(): UseWordFrequencyReturn {
  const [rawText, setRawText] = useState('');
  const [results, setResults] = useState<WordFrequency[]>([]);
  const [error, setError] = useState('');
  const [excludeStopWords, setExcludeStopWords] = useState(false);

  function analyze(text: string) {
    setError('');
    setRawText(text);
    setResults(parseWords(text, excludeStopWords));
  }

  function toggleStopWords(exclude: boolean) {
    setExcludeStopWords(exclude);
    if (rawText) {
      setResults(parseWords(rawText, exclude));
    }
  }

  function reset() {
    setResults([]);
    setError('');
    setRawText('');
  }

  return { results, rawText, error, excludeStopWords, analyze, setError, toggleStopWords, reset };
}
