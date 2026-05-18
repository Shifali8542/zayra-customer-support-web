// src/components/tickets/TicketQueue.tsx
import React from 'react';
import type { Ticket, FilterTag } from '../../schema';
import TicketCard from './TicketCard';
import Card from '../ui/Card';

interface FilterPill { key: FilterTag; label: string; }

const FILTER_PILLS: FilterPill[] = [
  { key: 'all',      label: 'All'      },
  { key: 'critical', label: 'Critical' },
  { key: 'device',   label: 'Device'   },
  { key: 'billing',  label: 'Billing'  },
];

interface Props {
  tickets:      Ticket[];
  selectedId:   number | null;
  activeFilter: FilterTag;
  isLoading:    boolean;
  onSelect:     (id: number) => void;
  onFilter:     (filter: FilterTag) => void;
}

const TicketSkeleton = () => (
  <div className="bg-[var(--surface)] rounded-[8px] p-[12px_14px] border border-[var(--z-border)] animate-pulse">
    <div className="flex justify-between mb-2">
      <div className="h-[10px] w-16 bg-[var(--surface2)] rounded" />
      <div className="h-[10px] w-10 bg-[var(--surface2)] rounded" />
    </div>
    <div className="h-[13px] w-3/4 bg-[var(--surface2)] rounded mb-2" />
    <div className="h-[11px] w-1/2 bg-[var(--surface2)] rounded" />
  </div>
);

const TicketQueue = ({ tickets, selectedId, activeFilter, isLoading, onSelect, onFilter }: Props) => (
  <Card padding="p-[12px_16px]">
    <div className="flex justify-between items-center mb-[10px] flex-wrap gap-2">
      <h3 className="text-[13px] font-medium text-[var(--text1)]">
        Ticket queue
        {tickets.length > 0 && (
          <span className="ml-2 text-[11px] text-[var(--text3)] font-normal">({tickets.length})</span>
        )}
      </h3>
      <div className="flex gap-[6px] flex-wrap">
        {FILTER_PILLS.map(f => (
          <button
            key={f.key}
            onClick={() => onFilter(f.key)}
            className={`
              text-[11px] px-2 py-[3px] rounded-full border font-sans
              transition-all duration-150 cursor-pointer
              ${activeFilter === f.key
                ? 'bg-[#E1F5EE] text-[#0F6E56] border-[#9FE1CB] font-medium'
                : 'bg-transparent text-[var(--text2)] border-[var(--z-border)] hover:border-[#9FE1CB]'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>

    <div className="flex flex-col gap-2">
      {isLoading ? (
        <><TicketSkeleton /><TicketSkeleton /><TicketSkeleton /></>
      ) : tickets.length === 0 ? (
        <div className="text-center py-6 text-[13px] text-[var(--text3)]">No tickets match this filter</div>
      ) : (
        tickets.map(t => (
          <TicketCard
            key={t.id} ticket={t}
            isSelected={t.id === selectedId}
            onClick={() => onSelect(t.id)}
          />
        ))
      )}
    </div>
  </Card>
);

export default TicketQueue;
