export type Language = 'en' | 'pt';

export interface Translations {
  title: string;
  tabs: { text: string; url: string };
  views: { table: string; chart: string; cloud: string; bigrams: string };
  actions: { translate: string; fetchAndAnalyze: string; fetching: string; exportCsv: string; clear: string };
  stopWords: string;
  textInput: { placeholder: string; charCount: (n: number) => string };
  urlInput: { placeholder: string };
  table: { word: string; frequency: string; searchPlaceholder: string; noMatch: string; wordCount: (shown: number, total: number) => string };
  chart: { barType: string; pieType: string; topN: (n: number) => string };
  stats: { totalWords: string; uniqueWords: string; topWord: (count: number) => string; lexicalDiversity: string };
  errors: { emptyInput: string; emptyUrl: string; noText: string; fetchFailed: string };
  bigrams: { empty: string };
  results: { uniqueWords: (n: number) => string };
  highlight: { hint: (word: string) => string };
}

export const translations: Record<Language, Translations> = {
  en: {
    title: 'Word Frequency Analyzer',
    tabs: { text: 'Text', url: 'URL' },
    views: { table: 'Table', chart: 'Chart', cloud: 'Word Cloud', bigrams: 'Bigrams' },
    actions: { translate: 'Translate', fetchAndAnalyze: 'Fetch & Analyze', fetching: 'Fetching…', exportCsv: 'Export CSV', clear: 'Clear' },
    stopWords: 'Exclude common stop words (a, the, is, of…)',
    textInput: {
      placeholder: 'Enter or paste your text here (max 2048 characters)…',
      charCount: (n) => `${n} / 2048`,
    },
    urlInput: { placeholder: 'https://example.com' },
    table: {
      word: 'Word',
      frequency: 'Frequency',
      searchPlaceholder: 'Search words…',
      noMatch: 'No words match your search.',
      wordCount: (shown, total) => `${shown} / ${total} words`,
    },
    chart: {
      barType: 'Bar',
      pieType: 'Pie',
      topN: (n) => `Top ${n} words`,
    },
    stats: {
      totalWords: 'Total words',
      uniqueWords: 'Unique words',
      topWord: (count) => `Top word (${count}×)`,
      lexicalDiversity: 'Lexical diversity',
    },
    errors: {
      emptyInput: 'Please enter some text before analyzing.',
      emptyUrl: 'Please enter a URL before fetching.',
      noText: 'No readable text found on that page.',
      fetchFailed: 'Failed to fetch the URL.',
    },
    bigrams: { empty: 'No repeated word pairs found. Try a longer text.' },
    results: { uniqueWords: (n) => `${n} unique words` },
    highlight: { hint: (word) => `Occurrences of "${word}" in the original text:` },
  },
  pt: {
    title: 'Analisador de Frequência de Palavras',
    tabs: { text: 'Texto', url: 'URL' },
    views: { table: 'Tabela', chart: 'Gráfico', cloud: 'Nuvem de Palavras', bigrams: 'Bigramas' },
    actions: { translate: 'Analisar', fetchAndAnalyze: 'Buscar e Analisar', fetching: 'Buscando…', exportCsv: 'Exportar CSV', clear: 'Limpar' },
    stopWords: 'Excluir palavras comuns (a, o, de, em, é…)',
    textInput: {
      placeholder: 'Digite ou cole seu texto aqui (máx. 2048 caracteres)…',
      charCount: (n) => `${n} / 2048`,
    },
    urlInput: { placeholder: 'https://exemplo.com' },
    table: {
      word: 'Palavra',
      frequency: 'Frequência',
      searchPlaceholder: 'Buscar palavras…',
      noMatch: 'Nenhuma palavra encontrada.',
      wordCount: (shown, total) => `${shown} / ${total} palavras`,
    },
    chart: {
      barType: 'Barras',
      pieType: 'Pizza',
      topN: (n) => `Top ${n} palavras`,
    },
    stats: {
      totalWords: 'Total de palavras',
      uniqueWords: 'Palavras únicas',
      topWord: (count) => `Palavra top (${count}×)`,
      lexicalDiversity: 'Diversidade léxica',
    },
    errors: {
      emptyInput: 'Insira algum texto antes de analisar.',
      emptyUrl: 'Insira uma URL antes de buscar.',
      noText: 'Nenhum texto legível encontrado nessa página.',
      fetchFailed: 'Falha ao buscar a URL.',
    },
    bigrams: { empty: 'Nenhum par de palavras repetido. Tente um texto mais longo.' },
    results: { uniqueWords: (n) => `${n} palavras únicas` },
    highlight: { hint: (word) => `Ocorrências de "${word}" no texto original:` },
  },
};
