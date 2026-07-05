import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { UrlInput } from './UrlInput';

vi.mock('../../utils/fetchUrlText');
import { fetchUrlText } from '../../utils/fetchUrlText';
const mockFetch = vi.mocked(fetchUrlText);

describe('UrlInput', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders url input and fetch button', () => {
    renderWithProviders(<UrlInput onAnalyze={vi.fn()} onError={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fetch|buscar/i })).toBeInTheDocument();
  });

  it('calls onError when URL is empty', async () => {
    const onError = vi.fn();
    renderWithProviders(<UrlInput onAnalyze={vi.fn()} onError={onError} />);
    await userEvent.click(screen.getByRole('button', { name: /fetch|buscar/i }));
    expect(onError).toHaveBeenCalledWith(expect.stringMatching(/.+/));
  });

  it('shows loading state while fetching', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    renderWithProviders(<UrlInput onAnalyze={vi.fn()} onError={vi.fn()} />);
    await userEvent.type(screen.getByRole('textbox'), 'https://example.com');
    await userEvent.click(screen.getByRole('button', { name: /fetch|buscar/i }));
    expect(screen.getByRole('button', { name: /fetching|buscando/i })).toBeDisabled();
  });

  it('calls onAnalyze with extracted text on success', async () => {
    mockFetch.mockResolvedValue('hello world from page');
    const onAnalyze = vi.fn();
    renderWithProviders(<UrlInput onAnalyze={onAnalyze} onError={vi.fn()} />);
    await userEvent.type(screen.getByRole('textbox'), 'https://example.com');
    await userEvent.click(screen.getByRole('button', { name: /fetch|buscar/i }));
    await waitFor(() => expect(onAnalyze).toHaveBeenCalledWith('hello world from page'));
  });

  it('calls onError when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const onError = vi.fn();
    renderWithProviders(<UrlInput onAnalyze={vi.fn()} onError={onError} />);
    await userEvent.type(screen.getByRole('textbox'), 'https://example.com');
    await userEvent.click(screen.getByRole('button', { name: /fetch|buscar/i }));
    await waitFor(() => expect(onError).toHaveBeenCalledWith('Network error'));
  });

  it('calls onError when page has no readable text', async () => {
    mockFetch.mockResolvedValue('   ');
    const onError = vi.fn();
    renderWithProviders(<UrlInput onAnalyze={vi.fn()} onError={onError} />);
    await userEvent.type(screen.getByRole('textbox'), 'https://example.com');
    await userEvent.click(screen.getByRole('button', { name: /fetch|buscar/i }));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.stringMatching(/.+/)));
  });
});
