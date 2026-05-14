import React from 'react';
import { CATEGORY_BARS } from '../../data/mockData';
import Card from '../ui/Card';

const CategoryChart = () => (
  <Card>
    <div className="text-[11px] font-medium text-[var(--text3)] uppercase tracking-[.06em] mb-3">
      Ticket categories today
    </div>

    {CATEGORY_BARS.map((bar) => (
      <div key={bar.label} className="flex items-center gap-2 mb-2">
        <span className="text-[11px] text-[var(--text2)] w-[80px] flex-shrink-0">
          {bar.label}
        </span>
        <div className="flex-1 h-[6px] bg-[var(--surface2)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-[600ms] ease-out"
            style={{ width: `${bar.percentage}%`, background: bar.color }}
          />
        </div>
        <span className="text-[11px] text-[var(--text3)] w-6 text-right flex-shrink-0">
          {bar.count}
        </span>
      </div>
    ))}
  </Card>
);

export default CategoryChart;
