import React, { useState, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import type { BLEMonitorEvent } from '../../schema';

// Helpers 

const SEV_BADGE: Record<string, 'critical' | 'urgent' | 'normal'> = {
  CRITICAL: 'critical',
  WARNING:  'urgent',
  NORMAL:   'normal',
};

const SEV_DOT: Record<string, string> = {
  CRITICAL: 'bg-[var(--z-critical)]',
  WARNING:  'bg-[var(--z-warn)]',
  NORMAL:   'bg-[var(--z-teal-light)]',
};

const SEV_RING: Record<string, string> = {
  CRITICAL: 'border-[var(--z-critical)]',
  WARNING:  'border-[var(--z-warn)]',
  NORMAL:   'border-[var(--z-border)]',
};

function fmt(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60)  return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Group events by patient ───────────────────────────────────────────────────

interface PatientGroup {
  code:       string;
  events:     BLEMonitorEvent[];
  latest:     BLEMonitorEvent;
  miCount:    number;
  worstSev:   string;
}

function groupByPatient(events: BLEMonitorEvent[]): PatientGroup[] {
  const map = new Map<string, BLEMonitorEvent[]>();
  for (const e of events) {
    // Skip events with no patient_code — test/malformed events
    if (!e.patient_code || e.patient_code === 'unknown') continue;
    const key = e.patient_code;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }

  const SEV_RANK: Record<string, number> = { CRITICAL: 2, WARNING: 1, NORMAL: 0 };

  return Array.from(map.entries()).map(([code, evts]) => {
    const miCount  = evts.filter(e => e.mi_detected).length;
    const worstSev = evts.reduce((worst, e) => {
      const sev = e.severity ?? 'NORMAL';
      return (SEV_RANK[sev] ?? 0) > (SEV_RANK[worst] ?? 0) ? sev : worst;
    }, 'NORMAL');
    return { code, events: evts, latest: evts[0], miCount, worstSev };
  }).sort((a, b) => (SEV_RANK[b.worstSev] ?? 0) - (SEV_RANK[a.worstSev] ?? 0));
}

// ── Patient card ──────────────────────────────────────────────────────────────

const PatientCard = ({
  group, onClick,
}: { group: PatientGroup; onClick: () => void }) => {
  const sev = group.worstSev;
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-xl border-2 transition-all duration-150
        bg-[var(--surface)] hover:bg-[var(--surface2)]
        hover:shadow-md cursor-pointer p-4
        ${SEV_RING[sev] ?? 'border-[var(--z-border)]'}
      `}
    >
      {/* Top row: dot + code + badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`
            h-[8px] w-[8px] rounded-full flex-shrink-0
            ${SEV_DOT[sev]}
            ${group.miCount > 0 ? 'animate-pulse' : ''}
          `} />
          <span className="text-[13px] font-semibold text-[var(--text1)] truncate font-mono">
            {group.code}
          </span>
        </div>
        <Badge variant={SEV_BADGE[sev] ?? 'normal'}>
          {sev}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--text3)] mb-0.5">
            Readings
          </p>
          <p className="text-[14px] font-semibold text-[var(--text1)]">
            {group.events.length}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--text3)] mb-0.5">
            MI Detected
          </p>
          <p className={`text-[14px] font-semibold ${
            group.miCount > 0 ? 'text-[var(--z-critical)]' : 'text-[var(--text2)]'
          }`}>
            {group.miCount}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text3)] mb-0.5">
            Last reading
          </p>
          <p className="text-[12px] text-[var(--text2)]">
            {fmt(group.latest?.timestamp)}
          </p>
        </div>
      </div>

      {/* Click hint */}
      <p className="mt-3 text-[10px] text-[var(--text3)] text-right">
        View history →
      </p>
    </button>
  );
};

// ── History modal ─────────────────────────────────────────────────────────────

const HistoryModal = ({
  group, onClose,
}: { group: PatientGroup; onClose: () => void }) => {
  const sev = group.worstSev;
  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border
        border-[var(--z-border)] bg-[var(--surface)] shadow-xl overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4
          border-b border-[var(--z-border)]">
          <div className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0
              ${SEV_DOT[sev]}
              ${group.miCount > 0 ? 'animate-pulse' : ''}
            `} />
            <div>
              <p className="text-[15px] font-semibold text-[var(--text1)] font-mono">
                {group.code}
              </p>
              <p className="text-[11px] text-[var(--text3)] mt-0.5">
                {group.events.length} readings · {group.miCount} MI detected
              </p>
            </div>
            <Badge variant={SEV_BADGE[sev] ?? 'normal'}>{sev}</Badge>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text3)] hover:text-[var(--text1)] transition-colors
              text-[20px] leading-none w-7 h-7 flex items-center justify-center
              rounded-lg hover:bg-[var(--surface2)]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-[var(--surface)] border-b border-[var(--z-border)]">
              <tr>
                {['When', 'Result', 'Confidence', 'Severity', 'Recommendation'].map(h => (
                  <th key={h} className="px-4 py-[10px] text-left text-[10px] font-semibold
                    uppercase tracking-[.08em] text-[var(--text3)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.events.map((e, i) => {
                const rowSev  = e.severity ?? 'NORMAL';
                const confPct = Math.round((e.confidence ?? 0) * 100);
                return (
                  <tr key={e.alert_id ?? i}
                    className="border-b border-[var(--z-border)] last:border-0
                      hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-[10px] text-[12px] text-[var(--text3)]
                      whitespace-nowrap font-mono">
                      {fmt(e.timestamp)}
                    </td>
                    <td className="px-4 py-[10px]">
                      <span className={`text-[12px] font-semibold ${
                        e.mi_detected
                          ? 'text-[var(--z-critical)]'
                          : 'text-[var(--z-teal-light)]'
                      }`}>
                        {e.mi_detected ? 'MI Detected' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-4 py-[10px] text-[12px] text-[var(--text2)]">
                      {confPct}%
                    </td>
                    <td className="px-4 py-[10px]">
                      <Badge variant={SEV_BADGE[rowSev] ?? 'normal'}>
                        {rowSev}
                      </Badge>
                    </td>
                    <td className="px-4 py-[10px] text-[12px] text-[var(--text2)]
                      max-w-[260px]">
                      <span className="line-clamp-2">{e.recommendation ?? '—'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal footer */}
        <div className="px-5 py-3 border-t border-[var(--z-border)]
          flex items-center justify-between">
          <p className="text-[11px] text-[var(--text3)]">
            Last updated {fmt(group.latest?.timestamp)}
          </p>
          <Button variant="secondary" onClick={onClose}
            className="!py-[5px] !px-[14px] !text-[12px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Connection badge ──────────────────────────────────────────────────────────

const ConnBadge = ({ connected }: { connected: boolean }) => (
  <span className="flex items-center gap-[5px] text-[11px] text-[var(--text3)]">
    <span className={`h-[7px] w-[7px] rounded-full ${
      connected ? 'bg-[var(--z-teal-light)] animate-pulse' : 'bg-[var(--text3)]'
    }`} />
    {connected ? 'Live' : 'Reconnecting…'}
  </span>
);

// ── Main component ────────────────────────────────────────────────────────────

interface DeviceAlertsProps {
  events:        BLEMonitorEvent[];
  connected:     boolean;
  historyLoaded: boolean;
  onClear:       () => void;
}

const DeviceAlerts = ({ events, connected, historyLoaded, onClear }: DeviceAlertsProps) => {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const groups = useMemo(() => groupByPatient(events), [events]);
  const totalMI = groups.reduce((s, g) => s + g.miCount, 0);
  const selectedGroup = groups.find(g => g.code === selectedCode) ?? null;

  return (
    <div className="flex flex-col gap-4">

      {/* Header bar */}
      <Card padding="p-[10px_16px]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ConnBadge connected={connected} />
            {totalMI > 0 && (
              <span className="text-[11px] font-medium text-[var(--z-critical)]
                bg-[var(--z-critical-bg)] px-[8px] py-[2px] rounded-full">
                {totalMI} MI {totalMI === 1 ? 'alert' : 'alerts'} active
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[var(--text3)]">
              {events.length} readings · {groups.length} patients
            </span>
            {events.length > 0 && (
              <Button variant="secondary" onClick={onClear}
                className="!py-[4px] !px-[10px] !text-[11px]">
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Patient cards grid */}
      {!historyLoaded ? (
        <div className="flex items-center justify-center py-16 gap-2 text-[var(--text3)]">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current
            border-t-transparent animate-spin" />
          <span className="text-[12px]">Loading monitoring history…</span>
        </div>
      ) : groups.length === 0 ? (
        <Card padding="p-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--surface2)]
              border border-[var(--z-border)] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <circle cx="12" cy="17" r="1"/>
                <path d="M9 7h6M9 11h4"/>
              </svg>
            </div>
            <p className="text-[13px] font-medium text-[var(--text2)]">
              No BLE monitoring events yet
            </p>
            <p className="text-[11px] text-[var(--text3)]">
              Patient detections will appear here in real time
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {groups.map(g => (
            <PatientCard
              key={g.code}
              group={g}
              onClick={() => setSelectedCode(g.code)}
            />
          ))}
        </div>
      )}

      {/* History modal */}
      {selectedGroup && (
        <HistoryModal
          group={selectedGroup}
          onClose={() => setSelectedCode(null)}
        />
      )}
    </div>
  );
};

export default DeviceAlerts;