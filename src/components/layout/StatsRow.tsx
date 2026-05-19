import React, { useEffect, useState } from 'react';
import type { StatCard, DashboardStats, LiveMetrics } from '../../schema';
import { dashboardApi } from '../../services/api';

const TREND_CLASS: Record<StatCard['trend'], string> = {
  up:      'text-[#3B6D11]',
  down:    'text-[#E24B4A]',
  neutral: 'text-[var(--text3)]',
};

const StatItem = ({ stat }: { stat: StatCard }) => (
  <div className="
    bg-[var(--surface)] border border-[var(--z-border)]
    rounded-[8px] p-[12px_14px] transition-colors duration-200
  ">
    <div className="text-[11px] text-[var(--text3)] mb-1">{stat.label}</div>
    <div className="text-[22px] font-medium text-[var(--text1)] leading-none">{stat.value}</div>
    <div className={`text-[11px] mt-1 ${TREND_CLASS[stat.trend]}`}>{stat.sub}</div>
  </div>
);

function mapToStatCards(data: DashboardStats): StatCard[] {
  return [
    {
      label: 'Open tickets',
      value: String(data.open_tickets),
      sub:   data.open_tickets_sub,
      trend: data.open_tickets_trend,
    },
    {
      label: 'Avg. response',
      value: data.avg_response_minutes != null ? `${Math.round(data.avg_response_minutes)}m` : '—',
      sub:   data.avg_response_sub,
      trend: data.avg_response_trend,
    },
    {
      label: 'CSAT today',
      value: data.csat_today != null ? String(data.csat_today) : '—',
      sub:   data.csat_sub,
      trend: data.csat_trend,
    },
    {
      label: 'Agents online',
      value: String(data.agents_online),
      sub:   `of ${data.agents_scheduled} scheduled`,
      trend: data.agents_online_trend,
    },
  ];
}

const StatsRow = () => {
  const [stats,     setStats]     = useState<StatCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(async (data: DashboardStats) => {
        if (data.avg_response_minutes == null || data.csat_today == null) {
          try {
            const live: LiveMetrics = await dashboardApi.getLiveMetrics();
            if (data.avg_response_minutes == null) data.avg_response_minutes = live.avg_response_minutes;
            if (data.csat_today           == null) data.csat_today           = live.csat_today;
          } catch { }
        }
        setStats(mapToStatCards(data));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] px-5 pt-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--z-border)] rounded-[8px] p-[12px_14px] animate-pulse">
            <div className="h-[11px] w-20 bg-[var(--surface2)] rounded mb-2" />
            <div className="h-[22px] w-12 bg-[var(--surface2)] rounded mb-2" />
            <div className="h-[11px] w-24 bg-[var(--surface2)] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] px-5 pt-3">
      {stats.map(s => <StatItem key={s.label} stat={s} />)}
    </div>
  );
};

export default StatsRow;
