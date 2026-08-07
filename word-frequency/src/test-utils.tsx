import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { LanguageProvider } from './contexts/LanguageContext';

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  return render(<LanguageProvider>{ui}</LanguageProvider>, options);
}
