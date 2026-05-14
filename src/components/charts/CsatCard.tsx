import React from 'react';
import Card from '../ui/Card';

const SCORE = 4.7;
const RING_R = 28;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

const CsatCard = () => {
  const progress = (SCORE / 5) * CIRCUMFERENCE;

  return (
    <Card>
      <div className="text-[11px] font-medium text-[var(--text3)] uppercase tracking-[.06em] mb-3">
        CSAT Score
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-[32px] font-medium text-[var(--text1)] leading-none">{SCORE}</div>
          <div className="text-[13px] text-[#BA7517] tracking-wider mt-1">★★★★★</div>
          <div className="text-[11px] text-[#3B6D11] mt-1">↑ 0.2 vs last week</div>
        </div>

        {/* SVG ring */}
        <div className="relative inline-flex items-center justify-center">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle
              cx="36" cy="36" r={RING_R}
              fill="none" stroke="var(--surface2)" strokeWidth="6"
            />
            <circle
              cx="36" cy="36" r={RING_R}
              fill="none" stroke="#1D9E75" strokeWidth="6"
              strokeDasharray={`${progress} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              transform="rotate(-90 36 36)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <span className="absolute text-[14px] font-medium text-[var(--text1)]">
            {Math.round((SCORE / 5) * 100)}%
          </span>
        </div>
      </div>
    </Card>
  );
};

export default CsatCard;
