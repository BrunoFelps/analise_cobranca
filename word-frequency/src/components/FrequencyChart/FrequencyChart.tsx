import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import type { WordFrequency } from '../../types';
import styles from './FrequencyChart.module.css';

interface Props {
  data: WordFrequency[];
}

type ChartType = 'bar' | 'pie';

const COLORS = [
  '#4f46e5', '#7c3aed', '#db2777', '#ea580c',
  '#16a34a', '#0891b2', '#9333ea', '#b45309',
  '#0369a1', '#be185d', '#15803d', '#c2410c',
];

export function FrequencyChart({ data }: Props) {
  const { t } = useLanguage();
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [topN, setTopN] = useState(20);

  if (data.length === 0) return null;

  const max = Math.min(data.length, 50);
  const chartData = data.slice(0, Math.min(topN, data.length));

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.typeToggle}>
          <button
            className={`${styles.typeBtn} ${chartType === 'bar' ? styles.typeBtnActive : ''}`}
            onClick={() => setChartType('bar')}
          >
            {t.chart.barType}
          </button>
          <button
            className={`${styles.typeBtn} ${chartType === 'pie' ? styles.typeBtnActive : ''}`}
            onClick={() => setChartType('pie')}
          >
            {t.chart.pieType}
          </button>
        </div>

        <label className={styles.sliderLabel}>
          {t.chart.topN(Math.min(topN, data.length))}
          <input
            type="range"
            min={5}
            max={max}
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className={styles.slider}
          />
        </label>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        {chartType === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 64 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="word" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fill: '#eef2ff' }} />
            <Bar dataKey="count" name={t.chart.barType} radius={[4, 4, 0, 0]}>
              {chartData.map((_entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="word"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ word, percent }) =>
                percent > 0.03 ? `${word} (${(percent * 100).toFixed(0)}%)` : ''
              }
            >
              {chartData.map((_entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
