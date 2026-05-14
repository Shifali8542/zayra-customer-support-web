import { useState, useCallback } from 'react';
import type { Ticket, FilterTag, TabId, ChatMessage } from '../schema';
import { TICKETS } from '../data/mockData';

interface UseDashboardReturn {
  tickets:         Ticket[];
  filteredTickets: Ticket[];
  selectedTicket:  Ticket;
  selectedId:      string;
  activeFilter:    FilterTag;
  activeTab:       TabId;
  selectTicket:    (id: string) => void;
  setFilter:       (filter: FilterTag) => void;
  setActiveTab:    (tab: TabId) => void;
  sendReply:       (text: string) => void;
}

export function useDashboard(): UseDashboardReturn {
  const [tickets, setTickets]     = useState<Ticket[]>(TICKETS);
  const [selectedId, setSelectedId] = useState<string>(TICKETS[0].id);
  const [activeFilter, setFilter]   = useState<FilterTag>('all');
  const [activeTab, setActiveTab]   = useState<TabId>('queue');

  const selectedTicket = tickets.find((t) => t.id === selectedId) ?? tickets[0];

  const filteredTickets =
    activeFilter === 'all'
      ? tickets
      : tickets.filter((t) => t.tags.includes(activeFilter as Ticket['tags'][number]));

  const selectTicket = useCallback((id: string) => setSelectedId(id), []);

  const sendReply = useCallback(
    (text: string) => {
      const now = new Date();
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      const msg: ChatMessage = { from: 'Priya S. (you)', text, time, mine: true };

      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedId ? { ...t, messages: [...t.messages, msg] } : t
        )
      );
    },
    [selectedId]
  );

  return {
    tickets, filteredTickets, selectedTicket, selectedId,
    activeFilter, activeTab, selectTicket, setFilter, setActiveTab, sendReply,
  };
}
