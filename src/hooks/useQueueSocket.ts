// =============================================================================
// src/hooks/useQueueSocket.ts
// Queue-level WebSocket hook for the support dashboard.
//
// WHY THIS EXISTS:
//   After removing the 10s queue poll, agents had no way to see new tickets
//   without refreshing the page. This hook connects to the new backend endpoint:
//   ws/support/queue/
//
//   All agents join the single QUEUE_GROUP on the backend.
//   When a patient creates a ticket the view calls _notify_queue() which
//   broadcasts { "type": "new_ticket", "ticket_id": N } to every agent.
//   This hook receives that frame and calls onNewTicket() — the caller
//   does one fresh getAll() fetch to update the list.
//
//   Zero polling. Zero timers. One WS connection per agent session.
// =============================================================================

import { useEffect, useRef } from 'react';
import { API_BASE } from '../services/api';
import type { WsNewTicketMessage } from '../schema';

const MAX_RETRIES    = 5;
const RETRY_DELAY_MS = 3000;

export function useQueueSocket(
  accessToken: string | null,
  onNewTicket: () => void,
) {
  const wsRef      = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted  = useRef(true);

  useEffect(() => {
    if (!accessToken) return;
    isMounted.current = true;

    const connect = () => {
      if (!isMounted.current) return;

      const wsBase = API_BASE
        .replace('https://', 'wss://')
        .replace('http://', 'ws://');
      const url = `${wsBase}/ws/support/queue/?token=${accessToken}`;

      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted.current) return;
        retryCount.current = 0;
      };

      ws.onmessage = (event: MessageEvent) => {
        if (!isMounted.current) return;
        try {
          const data = JSON.parse(event.data as string) as WsNewTicketMessage;
          if (data.type === 'new_ticket') {
            // Backend just told us a new ticket was created —
            // trigger one fresh getAll() in useDashboard
            onNewTicket();
          }
        } catch {
          // Malformed frame — ignore
        }
      };

      ws.onerror = () => {
        // Will be followed by onclose — handle reconnect there
      };

      ws.onclose = () => {
        if (!isMounted.current) return;
        wsRef.current = null;

        if (retryCount.current < MAX_RETRIES) {
          retryCount.current += 1;
          const delay = RETRY_DELAY_MS * retryCount.current;
          retryTimer.current = setTimeout(() => {
            if (isMounted.current) connect();
          }, delay);
        }
      };
    };

    connect();

    return () => {
      isMounted.current = false;
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [accessToken]);
}