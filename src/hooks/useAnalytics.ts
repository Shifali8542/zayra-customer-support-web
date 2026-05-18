// src/hooks/useAnalytics.ts
import { useState, useEffect } from 'react';
import type { AnalyticsSummary, DailyMetric, CsatEntry, AgentPerformance, HeatmapData, CategoryBar } from '../schema';
import { analyticsApi, dashboardApi, type RangeKey } from '../services/api';

export type { RangeKey };

// Static insights — backend does not provide these yet
export const AI_INSIGHTS = [
  {
    variant: 'info' as const,
    title:   'Device sync tickets spiking on Axiom FW 3.1.x',
    body:    '68% of device sync failures in the last 30 days involve Axiom patch firmware versions 3.1.x. Consider proactively notifying Care plan users to update.',
    btn:     'Draft outreach \u2197',
  },
  {
    variant: 'warn' as const,
    title:   'Resolution rate variance across agents',
    body:    'There is notable variance in resolution rates across the support team. Agents below 80% may benefit from targeted coaching on device-related tickets.',
    btn:     'Get coaching plan \u2197',
  },
  {
    variant: 'danger' as const,
    title:   'Tuesday 10\u201311am is highest-volume window with lowest coverage',
    body:    'Heatmap data shows the peak ticket hour averages the highest volume but may have insufficient agent coverage. Review scheduling to prevent SLA breaches.',
    btn:     'Suggest staffing fix \u2197',
  },
];

export const RESOLUTION_DIST = [
  { label: 'Under 1h', pct: 58, color: '#1D9E75', val: '38%' },
  { label: '1\u20134h',     pct: 65, color: '#378ADD', val: '42%' },
  { label: '4\u201324h',    pct: 24, color: '#BA7517', val: '15%' },
  { label: 'Over 24h', pct:  8, color: '#E24B4A', val: '5%'  },
];

export const PLAN_DONUT = [
  { label: 'Zayra Care', pct: 38, color: '#1D9E75' },
  { label: 'Wellness',   pct: 31, color: '#378ADD' },
  { label: 'Hospital',   pct: 18, color: '#7F77DD' },
  { label: 'Evac',       pct: 13, color: '#D4537E' },
];

interface UseAnalyticsReturn {
  range:         RangeKey;
  setRange:      (r: RangeKey) => void;
  summary:       AnalyticsSummary | null;
  totalTickets:  string;
  resolved:      string;
  avgFirstResp:  string;
  avgResolution: string;
  csat:          number;
  volumeData:    DailyMetric[];
  csatTrend:     CsatEntry[];
  categoryBars:  CategoryBar[];
  agentPerf:     AgentPerformance[];
  heatmap:       HeatmapData | null;
  isLoading:     boolean;
  error:         string | null;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [range,        setRange]        = useState<RangeKey>('30d');
  const [summary,      setSummary]      = useState<AnalyticsSummary | null>(null);
  const [volumeData,   setVolumeData]   = useState<DailyMetric[]>([]);
  const [csatTrend,    setCsatTrend]    = useState<CsatEntry[]>([]);
  const [categoryBars, setCategoryBars] = useState<CategoryBar[]>([]);
  const [agentPerf,    setAgentPerf]    = useState<AgentPerformance[]>([]);
  const [heatmap,      setHeatmap]      = useState<HeatmapData | null>(null);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const rangeToDays: Record<RangeKey, number> = { '7d': 7, '30d': 30, '90d': 90, 'custom': 30 };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    const days = rangeToDays[range];
    Promise.all([
      analyticsApi.getSummary(range),
      analyticsApi.getDaily(days),
      analyticsApi.getCsat(),
      analyticsApi.getAgentPerformance(days),
      analyticsApi.getHeatmap(),
      dashboardApi.getCategories(),
    ])
      .then(([sum, daily, csat, agents, heat, cats]) => {
        if (cancelled) return;
        setSummary(sum);
        setVolumeData(daily);
        setCsatTrend(csat);
        setAgentPerf(agents);
        setHeatmap(heat);
        setCategoryBars(cats);
      })
      .catch(err => { if (!cancelled) setError(err.message ?? 'Failed to load analytics.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [range]);

  return {
    range, setRange, summary,
    totalTickets:  summary ? summary.total_tickets.toLocaleString() : '—',
    resolved:      summary ? summary.resolved.toLocaleString()      : '—',
    avgFirstResp:  summary?.avg_first_response ?? '—',
    avgResolution: summary?.avg_resolution     ?? '—',
    csat:          summary?.csat               ?? 0,
    volumeData, csatTrend, categoryBars, agentPerf, heatmap, isLoading, error,
  };
}
