// src/components/tickets/TicketDetail.tsx
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import type { Ticket } from '../../schema';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface Props {
  ticket:      Ticket;
  onSendReply: (text: string) => Promise<void>;
}

const SEV_LABEL: Record<Ticket['severity'], string> = {
  critical: 'Critical', urgent: 'Urgent', normal: 'Normal', resolved: 'Resolved',
};

const TicketDetail = ({ ticket, onSendReply }: Props) => {
  const [reply,   setReply]   = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticket.messages]);
  useEffect(() => { setReply(''); }, [ticket.id]);

  const handleSend = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    try { await onSendReply(reply.trim()); setReply(''); }
    finally { setSending(false); }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isResolved = ticket.severity === 'resolved' || ticket.status === 'resolved';

  return (
    <Card padding="p-4" className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-200px)] lg:max-h-none">
      <div className="border-b border-[var(--z-border)] pb-3">
        <div className="text-[10px] text-[var(--text3)] font-mono mb-1">
          {ticket.ticket_number} · {isResolved ? 'Resolved' : 'Open'}
        </div>
        <div className="text-[14px] font-medium text-[var(--text1)] mb-2">{ticket.title}</div>
        <div className="flex gap-[6px] flex-wrap">
          <Badge variant={ticket.severity}>{SEV_LABEL[ticket.severity]}</Badge>
          {ticket.tags.includes('device') && <Badge variant="device">Device</Badge>}
          <Badge variant="plan">{ticket.user_plan}</Badge>
        </div>
      </div>

      <Section title="User">
        <Row label="Name" value={ticket.user_name} />
        <Row label="Plan" value={ticket.user_plan} />
        {ticket.member_since && <Row label="Member since" value={ticket.member_since} />}
        {ticket.clinician    && <Row label="Clinician"   value={ticket.clinician}    />}
      </Section>

      {ticket.device && (
        <Section title="Device">
          <div className="bg-[var(--surface2)] rounded-[8px] p-[10px_12px] border border-[var(--z-border)]">
            <div className="text-[12px] font-medium text-[var(--text1)] mb-1">{ticket.device.name}</div>
            <div className="flex gap-3 flex-wrap">
              <DeviceStat label="FW"        value={ticket.device.firmware}  />
              <DeviceStat label="Bat"       value={ticket.device.battery}   />
              <DeviceStat label="Last sync" value={ticket.device.last_sync} />
            </div>
          </div>
        </Section>
      )}

      {ticket.note && (
        <div className="bg-[#FAEEDA] rounded-[8px] p-[8px_10px] border-l-[3px] border-[#BA7517]">
          <p className="text-[11px] text-[#633806]">{ticket.note}</p>
        </div>
      )}

      <div>
        <div className="text-[11px] font-medium text-[var(--text3)] uppercase tracking-[.05em] mb-2">
          Conversation
        </div>
        <div className="flex flex-col gap-[6px] max-h-[200px] overflow-y-auto pr-1 mb-2">
          {(ticket.messages ?? []).length === 0 ? (
            <div className="text-[12px] text-[var(--text3)] text-center py-3">No messages yet</div>
          ) : (
            (ticket.messages ?? []).map((msg, i) => (
              <div key={msg.id ?? i} className={`rounded-[8px] p-[8px_10px] ${msg.mine ? 'bg-[#E1F5EE]' : 'bg-[var(--surface2)]'}`}>
                <div className={`text-[10px] mb-[3px] ${msg.mine ? 'text-[#0F6E56]' : 'text-[var(--text3)]'}`}>
                  {msg.sender}
                </div>
                <div className="text-[12px] text-[var(--text1)] leading-relaxed">{msg.text}</div>
                <div className="text-[10px] text-[var(--text3)] text-right mt-[3px]">{msg.time}</div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {!isResolved && (
          <div className="flex gap-[6px]">
            <input
              value={reply}
              onChange={e => setReply(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a reply..."
              disabled={sending}
              className="
                flex-1 text-[12px] px-[10px] py-[7px] font-sans
                border border-[var(--z-border)] rounded-[8px]
                bg-[var(--surface2)] text-[var(--text1)]
                placeholder-[var(--text3)] outline-none
                focus:border-[#9FE1CB] transition-colors disabled:opacity-60
              "
            />
            <button
              onClick={handleSend}
              disabled={sending || !reply.trim()}
              className="
                px-3 py-[7px] bg-[#1D9E75] text-white border-none
                rounded-[8px] text-[12px] cursor-pointer font-sans
                hover:bg-[#0F6E56] transition-colors whitespace-nowrap
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {sending ? '...' : 'Send'}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-[6px]">
        <Button variant="primary"   fullWidth>Get AI guidance</Button>
        <Button variant="secondary" fullWidth>Draft AI response</Button>
      </div>
    </Card>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-[11px] font-medium text-[var(--text3)] uppercase tracking-[.05em] mb-[6px]">{title}</div>
    {children}
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center mb-[6px]">
    <span className="text-[12px] text-[var(--text2)]">{label}</span>
    <span className="text-[12px] text-[var(--text1)] font-medium">{value}</span>
  </div>
);

const DeviceStat = ({ label, value }: { label: string; value: string }) => (
  <span className="text-[11px] text-[var(--text2)]">
    {label} <span className="text-[var(--text1)] font-medium">{value}</span>
  </span>
);

export default TicketDetail;
