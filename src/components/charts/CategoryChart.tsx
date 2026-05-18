// src/components/charts/CategoryChart.tsx
import React, { useEffect, useState } from 'react';
import type { CategoryBar } from '../../schema';
import { dashboardApi } from '../../services/api';
import Card from '../ui/Card';

const CategoryChart = () => {
  const [bars,      setBars]      = useState<CategoryBar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getCategories()
      .then(setBars)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Card>
      <div className="text-[11px] font-medium text-[var(--text3)] uppercase tracking-[.06em] mb-3">
        Ticket categories today
      </div>
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="h-[11px] w-[80px] bg-[var(--surface2)] rounded flex-shrink-0" />
              <div className="flex-1 h-[6px] bg-[var(--surface2)] rounded-full" />
              <div className="h-[11px] w-6 bg-[var(--surface2)] rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      ) : bars.length === 0 ? (
        <div className="text-[12px] text-[var(--text3)] text-center py-3">No ticket data yet</div>
      ) : (
        bars.map(bar => (
          <div key={bar.label} className="flex items-center gap-2 mb-2">
            <span className="text-[11px] text-[var(--text2)] w-[80px] flex-shrink-0">{bar.label}</span>
            <div className="flex-1 h-[6px] bg-[var(--surface2)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-[600ms] ease-out"
                style={{ width: `${bar.percentage}%`, background: bar.color }}
              />
            </div>
            <span className="text-[11px] text-[var(--text3)] w-6 text-right flex-shrink-0">{bar.count}</span>
          </div>
        ))
      )}
    </Card>
  );
};

export default CategoryChart;
