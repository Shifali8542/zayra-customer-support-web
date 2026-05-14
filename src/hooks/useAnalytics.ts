import { useState } from 'react'

export type RangeKey = '7d' | '30d' | '90d' | 'custom'

// ─── Static analytics data (mirrors HTML design) ──────────────────────────────

export const STATS_BASE = {
  totalTickets:  1284,
  resolved:      1091,
  avgFirstResp:  '4.2m',
  avgResolution: '3.4h',
  csat:          4.7,
}

export const RANGE_MULTIPLIERS: Record<RangeKey, number> = {
  '7d': 0.25, '30d': 1, '90d': 3.1, 'custom': 1,
}

export const CATEGORY_BARS = [
  { label: 'Device sync',  pct: 72, color: '#1D9E75', val: 423 },
  { label: 'Alyna alerts', pct: 48, color: '#378ADD', val: 284 },
  { label: 'Billing',      pct: 35, color: '#BA7517', val: 207 },
  { label: 'Onboarding',   pct: 26, color: '#7F77DD', val: 155 },
  { label: 'Evac / alerts',pct: 18, color: '#D4537E', val: 108 },
  { label: 'Other',        pct: 10, color: '#B4B2A9', val: 107 },
]

export const PLAN_DONUT = [
  { label: 'Zayra Care', pct: 38, color: '#1D9E75' },
  { label: 'Wellness',   pct: 31, color: '#378ADD' },
  { label: 'Hospital',   pct: 18, color: '#7F77DD' },
  { label: 'Evac',       pct: 13, color: '#D4537E' },
]

export const CSAT_WEEKLY = [
  { week: 'Apr 6',  score: 4.4 },
  { week: 'Apr 13', score: 4.5 },
  { week: 'Apr 20', score: 4.5 },
  { week: 'Apr 27', score: 4.6 },
  { week: 'May 4',  score: 4.7 },
]

export const RESOLUTION_DIST = [
  { label: 'Under 1h', pct: 58, color: '#1D9E75', val: '38%' },
  { label: '1–4h',     pct: 65, color: '#378ADD', val: '42%' },
  { label: '4–24h',    pct: 24, color: '#BA7517', val: '15%' },
  { label: 'Over 24h', pct:  8, color: '#E24B4A', val: '5%'  },
]

export const HEATMAP_HOURS = ['12a','2a','4a','6a','8a','10a','12p','2p','4p','6p','8p','10p']
export const HEATMAP_DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
export const HEATMAP_DATA  = [
  [2,1,1,3,18,38,28,32,24,19,12,6],
  [2,1,1,4,20,41,30,35,26,22,14,7],
  [3,1,2,4,19,36,29,31,25,20,13,5],
  [2,1,1,3,17,35,27,30,23,18,11,5],
  [3,2,1,5,22,30,26,28,22,16,10,4],
  [1,1,2,2,8, 14,18,20,16,12, 8,3],
  [1,0,1,2,6, 10,14,16,12, 9, 6,2],
]

export const AGENT_PERF = [
  { name: 'Priya S.',   tickets: 248, avgResp: '3.1m', resRate: 91, csat: 4.9 },
  { name: 'Arjun K.',   tickets: 201, avgResp: '5.4m', resRate: 87, csat: 4.6 },
  { name: 'Nandita M.', tickets: 184, avgResp: '4.8m', resRate: 89, csat: 4.7 },
  { name: 'Vikram R.',  tickets: 162, avgResp: '6.9m', resRate: 78, csat: 4.3 },
  { name: 'Sunita P.',  tickets: 140, avgResp: '8.2m', resRate: 71, csat: 4.1 },
]

export const AI_INSIGHTS = [
  {
    variant: 'info' as const,
    title: 'Device sync tickets spiking on Axiom FW 3.1.x',
    body: '68% of device sync failures in the last 30 days involve Axiom patch firmware versions 3.1.x. Consider proactively notifying Care plan users to update.',
    btn: 'Draft outreach ↗',
  },
  {
    variant: 'warn' as const,
    title: 'Sunita P. resolution rate below threshold',
    body: "Sunita's 30-day resolution rate (71%) is 14 points below team average. Paired with an 8.2m avg first response time, this may indicate she needs additional training on device-related tickets.",
    btn: 'Get coaching plan ↗',
  },
  {
    variant: 'danger' as const,
    title: 'Tuesday 10–11am is highest-volume window with lowest coverage',
    body: 'Heatmap data shows the peak ticket hour (Tue 10–11am) averages 38 tickets but only 3 agents are scheduled. Response SLA is breached 42% of the time in this slot.',
    btn: 'Suggest staffing fix ↗',
  },
]

// ─── Daily volume (30 days, seeded so consistent) ─────────────────────────────
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}
export const VOLUME_30D = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 3, 6 + i)
  return {
    label: `${d.getMonth() + 1}/${d.getDate()}`,
    resolved: Math.round(30 + seededRand(i * 3)     * 20),
    critical: Math.round(2  + seededRand(i * 3 + 1) * 8),
    escalated:Math.round(1  + seededRand(i * 3 + 2) * 5),
  }
})

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAnalytics() {
  const [range, setRange] = useState<RangeKey>('30d')
  const mult = RANGE_MULTIPLIERS[range]

  return {
    range,
    setRange,
    totalTickets:  Math.round(STATS_BASE.totalTickets  * mult).toLocaleString(),
    resolved:      Math.round(STATS_BASE.resolved      * mult).toLocaleString(),
    avgFirstResp:  STATS_BASE.avgFirstResp,
    avgResolution: STATS_BASE.avgResolution,
    csat:          STATS_BASE.csat,
  }
}
