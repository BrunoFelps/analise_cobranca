import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('renders textarea and button', () => {
    renderWithProviders(<TextInput onAnalyze={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /translate|analisar/i })).toBeInTheDocument();
  });

  it('calls onAnalyze with current text when button clicked', async () => {
    const onAnalyze = vi.fn();
    renderWithProviders(<TextInput onAnalyze={onAnalyze} />);
    await userEvent.type(screen.getByRole('textbox'), 'hello world');
    await userEvent.click(screen.getByRole('button', { name: /translate|analisar/i }));
    expect(onAnalyze).toHaveBeenCalledWith('hello world');
  });

  it('shows character count', async () => {
    renderWithProviders(<TextInput onAnalyze={vi.fn()} />);
    await userEvent.type(screen.getByRole('textbox'), 'abc');
    expect(screen.getByText('3 / 2048')).toBeInTheDocument();
  });
});
