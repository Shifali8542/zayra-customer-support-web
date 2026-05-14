import React from 'react';
import type { StatCard } from '../../schema';
import { STATS } from '../../data/mockData';

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

const StatsRow = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] px-5 pt-3">
    {STATS.map((s) => <StatItem key={s.label} stat={s} />)}
  </div>
);

export default StatsRow;
