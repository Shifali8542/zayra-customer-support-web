import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import type { Ticket } from '../../schema';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useTicketChat } from '../../hooks/useTicketChat';

interface Props {
  ticket: Ticket;
  accessToken: string | null;
  onSendReply: (text: string) => Promise<void>;
  onSelfAssign?: () => Promise<void>;
  onEscalate?: (note: string) => Promise<void>;
  onResolve?: (note: string) => Promise<void>;
  onClose?: () => Promise<void>;
}

const SEV_LABEL: Record<Ticket['severity'], string> = {
  critical: 'Critical', urgent: 'Urgent', normal: 'Normal', resolved: 'Resolved',
};

const TicketDetail = ({ ticket, accessToken, onSendReply, onSelfAssign, onEscalate, onResolve, onClose }: Props) => {
  const {
    messages: wsMessages,
    connected: wsConnected,
    sending: wsSending,
    sendMessage: wsSendMessage,
  } = useTicketChat(ticket.id, accessToken);

  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [escNote, setEscNote] = useState('');
  const [resNote, setResNote] = useState('');
  const [showEscInput, setShowEscInput] = useState(false);
  const [showResInput, setShowResInput] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticket.messages]);
  useEffect(() => {
    setReply('');
    setShowEscInput(false);
    setShowResInput(false);
    setEscNote('');
    setResNote('');
    setActionKey(null);
  }, [ticket.id]);

  useEffect(() => {
    const messages = ticket.messages ?? [];
    const container = chatContainerRef.current;
    if (!container) return;

    const isNewMessage = messages.length > prevMessageCount.current;
    prevMessageCount.current = messages.length;

    if (!isNewMessage) {
      container.scrollTop = container.scrollHeight;
    } else {
      // A new message arrived — scroll smoothly inside the container only
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [ticket.messages]);

  const handleSend = async () => {
    if (!reply.trim() || wsSending) return;
    await wsSendMessage(reply.trim());
    setReply('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const runAction = async (key: string, fn: () => Promise<void>) => {
    setActionKey(key);
    try { await fn(); } catch { }
    finally { setActionKey(null); }
  };

  const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';
  const isEscalated = ticket.status === 'escalated';
  const canAssign = !ticket.assigned_to && onSelfAssign;
  const canEscalate = !isResolved && !isEscalated && onEscalate;
  const canResolve = !isResolved && onResolve;
  const canClose = ticket.status === 'resolved' && onClose;

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
        {ticket.clinician && <Row label="Clinician" value={ticket.clinician} />}
      </Section>

      {ticket.device && (
        <Section title="Device">
          <div className="bg-[var(--surface2)] rounded-[8px] p-[10px_12px] border border-[var(--z-border)]">
            <div className="text-[12px] font-medium text-[var(--text1)] mb-1">{ticket.device.name}</div>
            <div className="flex gap-3 flex-wrap">
              <DeviceStat label="FW" value={ticket.device.firmware} />
              <DeviceStat label="Bat" value={ticket.device.battery} />
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
        <div ref={chatContainerRef} className="flex flex-col gap-[6px] max-h-[200px] overflow-y-auto pr-1 mb-2">
          {wsMessages.length === 0 ? (
            <div className="text-[12px] text-[var(--text3)] text-center py-3">No messages yet</div>
          ) : (
            wsMessages.map((msg, i) => (
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
            {wsConnected && (
              <span className="text-[10px] text-[#1D9E75] self-center pr-1" title="Live">●</span>
            )}
            <input
              value={reply}
              onChange={e => setReply(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a reply..."
              disabled={wsSending}
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
              disabled={wsSending || !reply.trim()}
              className="
                px-3 py-[7px] bg-[#1D9E75] text-white border-none
                rounded-[8px] text-[12px] cursor-pointer font-sans
                hover:bg-[#0F6E56] transition-colors whitespace-nowrap
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {wsSending ? '...' : 'Send'}
            </button>
          </div>
        )}
      </div>

      {/* ── Ticket actions ───────────────────────────────────────────────── */}
      {(canAssign || canEscalate || canResolve || canClose) && (
        <div className="border-t border-[var(--z-border)] pt-3">
          <div className="text-[11px] font-medium text-[var(--text3)] uppercase tracking-[.05em] mb-2">
            Actions
          </div>

          {/* Self-assign */}
          {canAssign && (
            <button
              onClick={() => runAction('assign', onSelfAssign!)}
              disabled={actionKey === 'assign'}
              className="w-full mb-[6px] px-3 py-[7px] text-[12px] font-sans rounded-[8px] border border-[#9FE1CB] text-[#0F6E56] bg-[#E1F5EE] cursor-pointer hover:bg-[#c8f0e4] transition-colors disabled:opacity-60"
            >
              {actionKey === 'assign' ? 'Assigning…' : 'Assign to me'}
            </button>
          )}

          {/* Escalate */}
          {canEscalate && (
            showEscInput ? (
              <div className="mb-[6px]">
                <input
                  value={escNote}
                  onChange={e => setEscNote(e.target.value)}
                  placeholder="Escalation reason (optional)"
                  className="w-full text-[12px] px-[10px] py-[7px] mb-1 border border-[var(--z-border)] rounded-[8px] bg-[var(--surface2)] text-[var(--text1)] font-sans outline-none focus:border-[#BA7517]"
                />
                <div className="flex gap-[6px]">
                  <button onClick={() => { setShowEscInput(false); setEscNote(''); }} className="flex-1 px-3 py-[6px] text-[11px] font-sans border border-[var(--z-border)] rounded-[8px] text-[var(--text2)] bg-transparent cursor-pointer hover:bg-[var(--surface2)]">
                    Cancel
                  </button>
                  <button
                    onClick={() => runAction('escalate', () => { const note = escNote; setShowEscInput(false); setEscNote(''); return onEscalate!(note); })}
                    disabled={actionKey === 'escalate'}
                    className="flex-1 px-3 py-[6px] text-[11px] font-sans border border-[#BA7517] text-[#633806] bg-[#FAEEDA] rounded-[8px] cursor-pointer hover:bg-[#f5dba8] disabled:opacity-60"
                  >
                    {actionKey === 'escalate' ? 'Escalating…' : 'Confirm escalate'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowEscInput(true)} className="w-full mb-[6px] px-3 py-[7px] text-[12px] font-sans border border-[#BA7517] text-[#633806] bg-[#FAEEDA] rounded-[8px] cursor-pointer hover:bg-[#f5dba8] transition-colors">
                Escalate ticket
              </button>
            )
          )}

          {/* Resolve */}
          {canResolve && (
            showResInput ? (
              <div className="mb-[6px]">
                <input
                  value={resNote}
                  onChange={e => setResNote(e.target.value)}
                  placeholder="Resolution note (optional)"
                  className="w-full text-[12px] px-[10px] py-[7px] mb-1 border border-[var(--z-border)] rounded-[8px] bg-[var(--surface2)] text-[var(--text1)] font-sans outline-none focus:border-[#1D9E75]"
                />
                <div className="flex gap-[6px]">
                  <button onClick={() => { setShowResInput(false); setResNote(''); }} className="flex-1 px-3 py-[6px] text-[11px] font-sans border border-[var(--z-border)] rounded-[8px] text-[var(--text2)] bg-transparent cursor-pointer hover:bg-[var(--surface2)]">
                    Cancel
                  </button>
                  <button
                    onClick={() => runAction('resolve', () => { const note = resNote; setShowResInput(false); setResNote(''); return onResolve!(note); })}
                    disabled={actionKey === 'resolve'}
                    className="flex-1 px-3 py-[6px] text-[11px] font-sans border border-[#1D9E75] text-[#0F6E56] bg-[#E1F5EE] rounded-[8px] cursor-pointer hover:bg-[#c8f0e4] disabled:opacity-60"
                  >
                    {actionKey === 'resolve' ? 'Resolving…' : 'Confirm resolve'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowResInput(true)} className="w-full mb-[6px] px-3 py-[7px] text-[12px] font-sans border border-[#1D9E75] text-[#0F6E56] bg-[#E1F5EE] rounded-[8px] cursor-pointer hover:bg-[#c8f0e4] transition-colors">
                Mark as resolved
              </button>
            )
          )}

          {/* Close */}
          {canClose && (
            <button
              onClick={() => runAction('close', onClose!)}
              disabled={actionKey === 'close'}
              className="w-full mb-[6px] px-3 py-[7px] text-[12px] font-sans border border-[var(--z-border)] text-[var(--text2)] rounded-[8px] cursor-pointer hover:bg-[var(--surface2)] transition-colors disabled:opacity-60"
            >
              {actionKey === 'close' ? 'Closing…' : 'Close ticket'}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-[6px]">
        <Button variant="primary" fullWidth>Get AI guidance</Button>
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
