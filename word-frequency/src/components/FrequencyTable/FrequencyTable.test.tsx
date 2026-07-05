import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { FrequencyTable } from './FrequencyTable';

describe('FrequencyTable', () => {
  it('renders nothing when data is empty', () => {
    const { container } = renderWithProviders(<FrequencyTable data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a row for each word', () => {
    const data = [
      { word: 'hello', count: 3 },
      { word: 'world', count: 1 },
    ];
    renderWithProviders(<FrequencyTable data={data} />);
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('world')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    renderWithProviders(<FrequencyTable data={[{ word: 'a', count: 1 }]} />);
    // Use columnheader role to avoid matching the "1 / 1 words" count span
    expect(screen.getByRole('columnheader', { name: /^word$|^palavra$/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /^frequency$|^frequência$/i })).toBeInTheDocument();
  });
});
