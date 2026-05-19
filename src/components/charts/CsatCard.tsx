import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../services/api';
import Card from '../ui/Card';

const RING_R = 28;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

const CsatCard = () => {
  const [score,     setScore]     = useState<number | null>(null);
  const [sub,       setSub]       = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(data => {
        setScore(data.csat_today);
        setSub(data.csat_sub);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const displayScore = score ?? 0;
  const progress     = (displayScore / 5) * CIRCUMFERENCE;

  // Render only the filled stars based on actual score (rounded to nearest 0.5)
  const renderStars = (s: number) => {
    const full  = Math.floor(s);
    const half  = s - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      <span className="text-[13px] tracking-wider">
        {'★'.repeat(full)  && <span style={{ color: '#BA7517' }}>{'★'.repeat(full)}</span>}
        {half === 1         && <span style={{ color: '#BA7517' }}>½</span>}
        {'☆'.repeat(empty) && <span style={{ color: 'var(--text3)' }}>{'☆'.repeat(empty)}</span>}
      </span>
    );
  };

  return (
    <Card>
      <div className="text-[11px] font-medium text-[var(--text3)] uppercase tracking-[.06em] mb-3">
        CSAT Score
      </div>
      {isLoading ? (
        <div className="flex items-center justify-between animate-pulse">
          <div>
            <div className="h-8 w-12 bg-[var(--surface2)] rounded mb-2" />
            <div className="h-3 w-20 bg-[var(--surface2)] rounded mb-1" />
            <div className="h-3 w-24 bg-[var(--surface2)] rounded" />
          </div>
          <div className="w-[72px] h-[72px] rounded-full bg-[var(--surface2)]" />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[32px] font-medium text-[var(--text1)] leading-none">
              {displayScore > 0 ? displayScore : '—'}
            </div>
            <div className="mt-1">
              {displayScore > 0 ? renderStars(displayScore) : (
                <span className="text-[13px] text-[var(--text3)]">☆☆☆☆☆</span>
              )}
            </div>
            <div className="text-[11px] mt-1" style={{ color: displayScore > 0 ? '#3B6D11' : 'var(--text3)' }}>
              {displayScore > 0 ? (sub || `Based on today's ratings`) : 'No ratings yet'}
            </div>
          </div>
          <div className="relative inline-flex items-center justify-center">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r={RING_R} fill="none" stroke="var(--surface2)" strokeWidth="6" />
              <circle
                cx="36" cy="36" r={RING_R} fill="none" stroke="#1D9E75" strokeWidth="6"
                strokeDasharray={`${progress} ${CIRCUMFERENCE}`}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <span className="absolute text-[14px] font-medium text-[var(--text1)]">
              {displayScore > 0 ? `${Math.round((displayScore / 5) * 100)}%` : '—'}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CsatCard;
