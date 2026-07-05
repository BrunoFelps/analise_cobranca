import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { FrequencyChart } from './FrequencyChart';

const sampleData = [
  { word: 'hello', count: 10 },
  { word: 'world', count: 7 },
  { word: 'foo', count: 3 },
];

describe('FrequencyChart', () => {
  it('renders nothing when data is empty', () => {
    const { container } = renderWithProviders(<FrequencyChart data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Bar and Pie toggle buttons when data is present', () => {
    renderWithProviders(<FrequencyChart data={sampleData} />);
    expect(screen.getByRole('button', { name: /bar|barras/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pie|pizza/i })).toBeInTheDocument();
  });

  it('renders the topN slider', () => {
    renderWithProviders(<FrequencyChart data={sampleData} />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('switches to Pie chart type when Pie button is clicked', async () => {
    renderWithProviders(<FrequencyChart data={sampleData} />);
    const pieBtn = screen.getByRole('button', { name: /pie|pizza/i });
    await userEvent.click(pieBtn);
    // CSS Modules hash class names — check substring of the full className string
    expect(pieBtn.className).toContain('typeBtnActive');
  });

  it('shows topN label reflecting the data size', () => {
    renderWithProviders(<FrequencyChart data={sampleData} />);
    expect(screen.getByText(/top 3/i)).toBeInTheDocument();
  });
});
