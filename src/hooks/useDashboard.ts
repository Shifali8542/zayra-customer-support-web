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
  selfAssign:      () => Promise<void>;
  escalateTicket:  (note: string) => Promise<void>;
  resolveTicket:   (note: string) => Promise<void>;
  closeTicket:     () => Promise<void>;
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
    let cancelled  = false;
    let isFirstLoad = true;

    const fetchTickets = () => {
      // Do not poll when the browser tab is hidden — saves server load
      if (document.hidden) return;

      ticketApi.getAll(tabToParams(activeTab, activeFilter))
        .then(res => {
          if (cancelled) return;
          const list = res.results ?? [];
          setTickets(list);

          // Only auto-select on the very first load when nothing is selected.
          // On subsequent polls — never change selectedId.
          // Changing selectedId on every poll restarts the detail effect,
          // doubling the number of API calls unnecessarily.
          if (isFirstLoad) {
            isFirstLoad = false;
            setSelectedId(prev => prev ?? (list[0]?.id ?? null));
          }
        })
        .catch(err => { if (!cancelled) setError(err.message ?? 'Failed to load tickets.'); })
        .finally(() => { if (!cancelled) setIsLoading(false); });
    };

    setIsLoading(true);
    setError(null);
    fetchTickets();

    // Poll every 10 seconds — sufficient for support queue awareness
    const pollInterval = setInterval(() => {
      if (!cancelled) fetchTickets();
    }, 10000);

    // When agent returns to the tab, fetch immediately instead of waiting for next interval
    const onVisibilityChange = () => {
      if (!document.hidden && !cancelled) fetchTickets();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [activeTab, activeFilter, refreshTick]);

  useEffect(() => {
    if (!selectedId) { setSelectedTicket(null); return; }

    // Show cached list version immediately while full detail loads
    setSelectedTicket(prev =>
      prev?.id === selectedId
        ? prev
        : (tickets.find((t: Ticket) => t.id === selectedId) ?? null)
    );

    let cancelled = false;

    const fetchDetail = () => {
      // Do not poll when browser tab is hidden
      if (document.hidden) return;
      ticketApi.getById(selectedId)
        .then(full => { if (!cancelled) setSelectedTicket(full); })
        .catch(() => {});
    };

    fetchDetail();

    // Poll detail every 8 seconds — same cadence as queue.
    // 4 seconds was unnecessarily aggressive and doubled the visible call rate.
    // The support web has no WebSocket — this poll is the only way to see new
    // patient messages, so we keep it running but at a reasonable interval.
    const detailPoll = setInterval(() => {
      if (!cancelled) fetchDetail();
    }, 8000);

    const onVisibilityChange = () => {
      if (!document.hidden && !cancelled) fetchDetail();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(detailPoll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
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

  const selfAssign = useCallback(async () => {
    if (!selectedId) return;
    const updated = await ticketApi.selfAssign(selectedId);
    setSelectedTicket(updated);
    setRefreshTick(n => n + 1);
  }, [selectedId]);

  const escalateTicket = useCallback(async (note: string) => {
    if (!selectedId) return;
    const updated = await ticketApi.escalate(selectedId, note);
    setSelectedTicket(updated);
    setRefreshTick(n => n + 1);
  }, [selectedId]);

  const resolveTicket = useCallback(async (note: string) => {
    if (!selectedId) return;
    const updated = await ticketApi.resolve(selectedId, note);
    setSelectedTicket(updated);
    setRefreshTick(n => n + 1);
  }, [selectedId]);

  const closeTicket = useCallback(async () => {
    if (!selectedId) return;
    const updated = await ticketApi.close(selectedId);
    setSelectedTicket(updated);
    setRefreshTick(n => n + 1);
  }, [selectedId]);

  const refresh = useCallback(() => setRefreshTick(n => n + 1), []);

  return {
    tickets, filteredTickets: tickets, selectedTicket, selectedId,
    activeFilter, activeTab, isLoading, error,
    selectTicket, setFilter: handleSetFilter, setActiveTab,
    sendReply, selfAssign, escalateTicket, resolveTicket, closeTicket, refresh,
  };
}
