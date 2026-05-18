// src/hooks/useDashboard.ts
import { useState, useCallback, useEffect } from 'react';
import type { Ticket, FilterTag, TabId } from '../schema';
import { ticketApi } from '../services/api';

interface UseDashboardReturn {
  tickets:         Ticket[];
  filteredTickets: Ticket[];
  selectedTicket:  Ticket | null;
  selectedId:      number | null;
  activeFilter:    FilterTag;
  activeTab:       TabId;
  isLoading:       boolean;
  error:           string | null;
  selectTicket:    (id: number) => void;
  setFilter:       (filter: FilterTag) => void;
  setActiveTab:    (tab: TabId) => void;
  sendReply:       (text: string) => Promise<void>;
  refresh:         () => void;
}

function tabToParams(tab: TabId, filter: FilterTag) {
  const params: Record<string, string> = {};
  switch (tab) {
    case 'my-cases':     params.assigned_to = 'me';        break;
    case 'escalations':  params.status      = 'escalated'; break;
    case 'device-alerts': params.tag        = 'device';    break;
    default:
      if (filter !== 'all') {
        if (['critical','urgent','normal','resolved'].includes(filter)) params.severity = filter;
        else params.tag = filter;
      }
  }
  return params;
}

export function useDashboard(): UseDashboardReturn {
  const [tickets,       setTickets]       = useState<Ticket[]>([]);
  const [selectedId,    setSelectedId]    = useState<number | null>(null);
  const [selectedTicket,setSelectedTicket]= useState<Ticket | null>(null);
  const [activeFilter,  setFilter]        = useState<FilterTag>('all');
  const [activeTab,     setActiveTab]     = useState<TabId>('queue');
  const [isLoading,     setIsLoading]     = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [refreshTick,   setRefreshTick]   = useState(0);

  useEffect(() => {
    if (activeTab === 'analytics' || activeTab === 'knowledge-base') return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    ticketApi.getAll(tabToParams(activeTab, activeFilter))
      .then(res => {
        if (cancelled) return;
        const list = res.results ?? [];
        setTickets(list);
        setSelectedId(prev => prev && list.find(t => t.id === prev) ? prev : (list[0]?.id ?? null));
      })
      .catch(err => { if (!cancelled) setError(err.message ?? 'Failed to load tickets.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab, activeFilter, refreshTick]);

  useEffect(() => {
    if (!selectedId) { setSelectedTicket(null); return; }
    setSelectedTicket(tickets.find(t => t.id === selectedId) ?? null);
    let cancelled = false;
    ticketApi.getById(selectedId)
      .then(full => { if (!cancelled) setSelectedTicket(full); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [selectedId]);

  const selectTicket = useCallback((id: number) => setSelectedId(id), []);

  const handleSetFilter = useCallback((filter: FilterTag) => {
    setFilter(filter);
    setActiveTab('queue');
  }, []);

  const sendReply = useCallback(async (text: string) => {
    if (!selectedId || !text.trim()) return;
    try {
      const newMsg = await ticketApi.sendMessage(selectedId, text.trim());
      setSelectedTicket(prev => prev ? { ...prev, messages: [...(prev.messages ?? []), newMsg] } : prev);
    } catch (err: any) {
      setError(err.message ?? 'Failed to send message.');
    }
  }, [selectedId]);

  const refresh = useCallback(() => setRefreshTick(n => n + 1), []);

  return {
    tickets, filteredTickets: tickets, selectedTicket, selectedId,
    activeFilter, activeTab, isLoading, error,
    selectTicket, setFilter: handleSetFilter, setActiveTab, sendReply, refresh,
  };
}
