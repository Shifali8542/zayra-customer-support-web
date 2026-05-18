// src/components/tickets/TicketCard.tsx
import React from 'react';
import type { Ticket } from '../../schema';
import Badge from '../ui/Badge';

interface Props {
  ticket:     Ticket;
  isSelected: boolean;
  onClick:    () => void;
}

const ACCENT: Record<Ticket['severity'], string> = {
  critical: 'bg-[#E24B4A]',
  urgent:   'bg-[#BA7517]',
  normal:   'bg-[#1D9E75]',
  resolved: 'bg-[#888888]',
};

const SEV_LABEL: Record<Ticket['severity'], string> = {
  critical: 'Critical', urgent: 'Urgent', normal: 'Normal', resolved: 'Resolved',
};

const shortName = (full: string) => {
  const parts = full.trim().split(' ');
  return parts.length >= 2 ? `${parts[0]} ${parts[1][0]}.` : full;
};

const TicketCard = ({ ticket, isSelected, onClick }: Props) => (
  <div
    onClick={onClick}
    className={`
      relative overflow-hidden cursor-pointer
      bg-[var(--surface)] rounded-[8px] p-[12px_14px]
      border transition-colors duration-150
      ${isSelected ? 'border-[#1D9E75]' : 'border-[var(--z-border)] hover:border-[#9FE1CB]'}
    `}
  >
    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${ACCENT[ticket.severity]}`} />

    <div className="flex justify-between items-start mb-1 pl-[10px]">
      <span className="text-[10px] text-[var(--text3)] font-mono">{ticket.ticket_number}</span>
      <span className="text-[10px] text-[var(--text3)]">{ticket.time_ago}</span>
    </div>

    <div className="text-[13px] font-medium text-[var(--text1)] mb-[3px] pl-[10px]">
      {ticket.title}
    </div>

    <div className="flex gap-2 items-center pl-[10px] flex-wrap">
      <span className="text-[11px] text-[var(--text2)]">
        {shortName(ticket.user_name)} · {ticket.user_plan}
      </span>
      <Badge variant={ticket.severity}>{SEV_LABEL[ticket.severity]}</Badge>
      {ticket.tags.includes('device') && <Badge variant="device">Device</Badge>}
    </div>
  </div>
);

export default TicketCard;
