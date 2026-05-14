import React, { useRef, useEffect } from 'react'
import {
  useAnalytics, CATEGORY_BARS, PLAN_DONUT, CSAT_WEEKLY,
  RESOLUTION_DIST, HEATMAP_HOURS, HEATMAP_DAYS, HEATMAP_DATA,
  AGENT_PERF, AI_INSIGHTS, VOLUME_30D, type RangeKey,
} from '../../hooks/useAnalytics'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BORDER = 'rgba(31,180,140,0.14)'

const card = 'bg-[var(--surface)] border-[.5px] border-[rgba(31,180,140,0.14)] rounded-xl p-[14px_16px]'
const cardHead = 'flex justify-between items-center mb-[14px]'
const cardTitle = 'text-[12px] font-medium text-[var(--text2)] tracking-[.04em]'

// ─── Volume Bar Chart (Canvas / Chart.js) ────────────────────────────────────
function VolumeChart() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let chart: any
    async function init() {
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)
      if (!ref.current) return
      const isDark = document.documentElement.classList.contains('dark')
      const textColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)'
      const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
      chart = new Chart(ref.current, {
        type: 'bar',
        data: {
          labels: VOLUME_30D.map(d => d.label),
          datasets: [
            { label: 'Resolved',  data: VOLUME_30D.map(d => d.resolved),  backgroundColor: '#1D9E75cc', stack: 's' },
            { label: 'Critical',  data: VOLUME_30D.map(d => d.critical),  backgroundColor: '#E24B4Acc', stack: 's' },
            { label: 'Escalated', data: VOLUME_30D.map(d => d.escalated), backgroundColor: '#BA7517cc', stack: 's' },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { title: (t: any) => t[0].label } } },
          scales: {
            x: { ticks: { font: { size: 10 }, color: textColor, maxRotation: 45, autoSkip: true, maxTicksLimit: 15 }, grid: { display: false }, border: { display: false } },
            y: { ticks: { font: { size: 10 }, color: textColor }, grid: { color: gridColor }, border: { display: false } },
          },
        },
      })
    }
    init()
    return () => { chart?.destroy() }
  }, [])

  return (
    <div className={card}>
      <div className={cardHead}>
        <div className={cardTitle}>Ticket volume — daily</div>
        <div className="flex gap-3">
          {[
            { color: '#1D9E75', label: 'Resolved' },
            { color: '#E24B4A', label: 'Critical' },
            { color: '#BA7517', label: 'Escalated' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-[5px]">
              <div className="w-[10px] h-[10px] rounded-[2px]" style={{ background: l.color }} />
              <span className="text-[11px] text-[var(--text2)]">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', height: 180 }}>
        <canvas ref={ref} />
      </div>
    </div>
  )
}

// ─── CSAT Line Chart (Canvas / Chart.js) ─────────────────────────────────────
function CsatChart() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let chart: any
    async function init() {
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)
      if (!ref.current) return
      const isDark = document.documentElement.classList.contains('dark')
      const textColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)'
      const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
      chart = new Chart(ref.current, {
        type: 'line',
        data: {
          labels: CSAT_WEEKLY.map(e => e.week),
          datasets: [{
            label: 'CSAT', data: CSAT_WEEKLY.map(e => e.score),
            borderColor: '#1D9E75', backgroundColor: '#1D9E7522',
            fill: true, tension: 0.4, pointRadius: 4,
            pointBackgroundColor: '#1D9E75', borderWidth: 2,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { font: { size: 10 }, color: textColor }, grid: { display: false }, border: { display: false } },
            y: { min: 4.0, max: 5.0, ticks: { font: { size: 10 }, color: textColor, stepSize: 0.2 }, grid: { color: gridColor }, border: { display: false } },
          },
        },
      })
    }
    init()
    return () => { chart?.destroy() }
  }, [])

  return <canvas ref={ref} />
}

// ─── Donut Chart (Canvas / Chart.js) ─────────────────────────────────────────
function DonutChart() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let chart: any
    async function init() {
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)
      if (!ref.current) return
      chart = new Chart(ref.current, {
        type: 'doughnut',
        data: {
          labels: PLAN_DONUT.map(p => p.label),
          datasets: [{ data: PLAN_DONUT.map(p => p.pct), backgroundColor: PLAN_DONUT.map(p => p.color), borderWidth: 0, hoverOffset: 4 }],
        },
        options: {
          responsive: false, cutout: '68%',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => c.label + ': ' + c.parsed + '%' } } },
        },
      })
    }
    init()
    return () => { chart?.destroy() }
  }, [])

  return <canvas ref={ref} width={110} height={110} />
}

// ─── Heatmap (pure DOM) ───────────────────────────────────────────────────────
function Heatmap() {
  const maxVal = Math.max(...HEATMAP_DATA.flat())

  return (
    <div className={card}>
      <div className={cardHead}>
        <div className={cardTitle}>Volume heatmap — hour of day × day of week</div>
        <div className="text-[11px] text-[var(--text3)]">darker = more tickets</div>
      </div>
      {/* Day column headers */}
      <div className="grid gap-[3px] mb-1" style={{ gridTemplateColumns: '40px repeat(7,1fr)' }}>
        <div />
        {HEATMAP_DAYS.map(d => (
          <div key={d} className="text-[10px] text-[var(--text3)] text-center">{d}</div>
        ))}
      </div>
      {/* Grid rows — one row per hour */}
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: '40px repeat(7,1fr)' }}>
        {HEATMAP_HOURS.map((hour, hi) => (
          <React.Fragment key={hour}>
            <div className="text-[10px] text-[var(--text3)] text-right pr-[6px] flex items-center justify-end" style={{ height: 22 }}>
              {hour}
            </div>
            {HEATMAP_DAYS.map((day, di) => {
              const v = HEATMAP_DATA[di][hi]
              const alpha = Math.max(0.06, v / maxVal)
              return (
                <div
                  key={day}
                  className="rounded-[3px] cursor-default"
                  style={{ height: 22, background: `rgba(29,158,117,${alpha.toFixed(2)})` }}
                  title={`${day} ${hour}: ${v} tickets`}
                />
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// ─── Agent performance badge ──────────────────────────────────────────────────
function RateBadge({ rate }: { rate: number }) {
  const cls = rate >= 85
    ? 'bg-[#E1F5EE] text-[#0F6E56]'
    : rate >= 80
    ? 'bg-[#FAEEDA] text-[#BA7517]'
    : 'bg-[#FCEBEB] text-[#A32D2D]'
  return (
    <span className={`text-[10px] px-[7px] py-[2px] rounded-full font-medium ${cls}`}>
      {rate}%
    </span>
  )
}

// ─── Insight border colours ───────────────────────────────────────────────────
const INSIGHT_BORDER = { info: '#1D9E75', warn: '#BA7517', danger: '#E24B4A' } as const

// ─── Main Analytics Page ──────────────────────────────────────────────────────
const Analytics = () => {
  const { range, setRange, totalTickets, resolved, avgFirstResp, avgResolution, csat } = useAnalytics()

  const RANGES: RangeKey[] = ['7d', '30d', '90d', 'custom']

  const STAT_ROWS = [
    { label: 'Total tickets',      val: totalTickets,  delta: '+12% vs prev period', trend: 'up'   as const },
    { label: 'Resolved',           val: resolved,      delta: '85% resolution rate', trend: 'up'   as const },
    { label: 'Avg first response', val: avgFirstResp,  delta: '↓ 1.1m vs prev',      trend: 'up'   as const },
    { label: 'Avg resolution time',val: avgResolution, delta: '↑ 0.3h vs prev',      trend: 'down' as const },
    { label: 'CSAT score',         val: String(csat),  delta: '↑ 0.2 vs prev',       trend: 'up'   as const },
  ]

  const DELTA_CLS = { up: 'text-[#3B6D11]', down: 'text-[#A32D2D]', flat: 'text-[var(--text3)]' }

  return (
    <div className="bg-[var(--surface2)] p-4 flex flex-col gap-[14px]">

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-[10px]">
          {/* Icon + title */}
          <div className="flex items-center gap-[6px]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5C4.4 1.5 1.5 4.4 1.5 8S4.4 14.5 8 14.5 14.5 11.6 14.5 8 11.6 1.5 8 1.5Z" stroke="#1D9E75" strokeWidth="1.2"/>
              <path d="M4.5 8l2 1.5L8 5l1.5 3L11.5 8" stroke="#1D9E75" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[15px] font-medium text-[var(--text1)]">Analytics</span>
          </div>
          {/* Range pills */}
          <div className="flex gap-1">
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`text-[11px] px-[10px] py-1 rounded-full border-[.5px] cursor-pointer font-sans transition-all
                  ${range === r
                    ? 'bg-[#E1F5EE] text-[#0F6E56] border-[#9FE1CB] font-medium'
                    : 'bg-transparent text-[var(--text2)] border-[rgba(31,180,140,0.14)] hover:border-[#9FE1CB]'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <button className="text-[11px] px-3 py-[5px] rounded-[8px] border-[.5px] border-[rgba(31,180,140,0.14)] bg-transparent cursor-pointer text-[var(--text2)] hover:text-[var(--text1)] font-sans transition-colors">
          Export report ↗
        </button>
      </div>

      {/* ── 5-stat grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-[10px]">
        {STAT_ROWS.map(s => (
          <div key={s.label} className="bg-[var(--surface)] border-[.5px] border-[rgba(31,180,140,0.14)] rounded-[8px] p-[12px_14px]">
            <div className="text-[11px] text-[var(--text3)] mb-1">{s.label}</div>
            <div className="text-[22px] font-medium text-[var(--text1)] leading-none">{s.val}</div>
            <div className={`text-[11px] mt-1 ${DELTA_CLS[s.trend]}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* ── Volume chart (full width) ─────────────────────────── */}
      <VolumeChart />

      {/* ── row2: category bars + donut ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">

        {/* Category bars */}
        <div className={card}>
          <div className={cardHead}>
            <div className={cardTitle}>Tickets by category</div>
            <div className="text-[11px] text-[var(--text3)]">30-day total: 1,284</div>
          </div>
          {CATEGORY_BARS.map(b => (
            <div key={b.label} className="flex items-center gap-2 mb-[9px]">
              <span className="text-[11px] text-[var(--text2)] w-[86px] flex-shrink-0 text-right">{b.label}</span>
              <div className="flex-1 h-2 bg-[var(--surface2)] rounded-[4px] overflow-hidden">
                <div className="h-full rounded-[4px] transition-[width] duration-700" style={{ width: `${b.pct}%`, background: b.color }} />
              </div>
              <span className="text-[11px] text-[var(--text3)] w-[30px] font-mono">{b.val}</span>
            </div>
          ))}
        </div>

        {/* Donut: tickets by plan */}
        <div className={card}>
          <div className={cardHead}>
            <div className={cardTitle}>Tickets by plan</div>
          </div>
          <div className="flex items-center gap-4">
            <DonutChart />
            <div className="flex flex-col gap-2 flex-1">
              {PLAN_DONUT.map(p => (
                <div key={p.label} className="flex items-center justify-between gap-[6px]">
                  <div className="flex items-center gap-[6px]">
                    <div className="w-[10px] h-[10px] rounded-[2px] flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-[12px] text-[var(--text2)]">{p.label}</span>
                  </div>
                  <span className="text-[12px] font-medium text-[var(--text1)] font-mono">{p.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── row3: CSAT (2fr) + resolution dist (1fr) ─────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">

        {/* CSAT trend — 2 cols */}
        <div className={`${card} md:col-span-2`}>
          <div className={cardHead}>
            <div className={cardTitle}>CSAT trend — weekly avg</div>
            <div className="text-[20px] font-medium text-[var(--text1)]">
              4.7 <span className="text-[12px] font-normal text-[var(--text3)]">/ 5</span>
            </div>
          </div>
          <div style={{ position: 'relative', height: 120 }}>
            <CsatChart />
          </div>
        </div>

        {/* Resolution time dist — 1 col */}
        <div className={card}>
          <div className={cardHead}>
            <div className={cardTitle}>Resolution time dist.</div>
          </div>
          {RESOLUTION_DIST.map(r => (
            <div key={r.label} className="flex items-center gap-2 mb-[9px]">
              <span className="text-[11px] text-[var(--text2)] w-[86px] flex-shrink-0 text-right">{r.label}</span>
              <div className="flex-1 h-2 bg-[var(--surface2)] rounded-[4px] overflow-hidden">
                <div className="h-full rounded-[4px]" style={{ width: `${r.pct}%`, background: r.color }} />
              </div>
              <span className="text-[11px] text-[var(--text3)] w-[30px] font-mono">{r.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Heatmap (full width) ──────────────────────────────── */}
      <Heatmap />

      {/* ── Agent performance table ───────────────────────────── */}
      <div className={card}>
        <div className={cardHead}>
          <div className={cardTitle}>Agent performance — 30 days</div>
        </div>
        {/* Header */}
        <div className="grid gap-2 px-2 py-[6px] bg-[var(--surface2)] rounded-[8px] mb-[6px]"
             style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
          {['Agent','Tickets','Avg resp.','Res. rate','CSAT'].map(h => (
            <div key={h} className="text-[10px] font-medium text-[var(--text3)] uppercase tracking-[.05em]">{h}</div>
          ))}
        </div>
        {/* Rows */}
        {AGENT_PERF.map((a, i) => (
          <div key={a.name}
               className="grid gap-2 px-2 py-2 items-center"
               style={{
                 gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                 borderBottom: i < AGENT_PERF.length - 1 ? `0.5px solid ${BORDER}` : 'none',
               }}>
            <div className="text-[12px] text-[var(--text1)]">{a.name}</div>
            <div className="text-[11px] text-[var(--text1)] font-mono">{a.tickets}</div>
            <div className="text-[11px] text-[var(--text1)] font-mono">{a.avgResp}</div>
            <div><RateBadge rate={a.resRate} /></div>
            <div className="text-[11px] text-[var(--text1)] font-mono">{a.csat}</div>
          </div>
        ))}
      </div>

      {/* ── AI Insights ───────────────────────────────────────── */}
      <div className={card}>
        <div className={cardHead}>
          <div className={cardTitle}>AI-generated insights</div>
          <div className="text-[11px] text-[var(--text3)]">Based on 30-day patterns</div>
        </div>
        <div className="flex flex-col gap-2">
          {AI_INSIGHTS.map(ins => (
            <div
              key={ins.title}
              className="bg-[var(--surface2)] p-[10px_12px]"
              style={{ borderLeft: `3px solid ${INSIGHT_BORDER[ins.variant]}` }}
            >
              <div className="text-[12px] font-medium text-[var(--text1)] mb-[2px]">{ins.title}</div>
              <div className="text-[11px] text-[var(--text2)] leading-[1.5]">{ins.body}</div>
              <button className="mt-[6px] text-[11px] px-[10px] py-1 rounded-[8px] border-[.5px] border-[rgba(31,180,140,0.14)] bg-transparent cursor-pointer text-[#0F6E56] font-sans hover:bg-[#E1F5EE] transition-colors">
                {ins.btn}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Analytics
