// =============================================================================
// src/hooks/useTicketChat.ts
// Real-time chat hook for the support agent side.
//
// WHY THIS EXISTS:
//   Previously, TicketDetail received messages via ticket.messages — a prop
//   refreshed by an 8-second setInterval in useDashboard. That meant agents
//   saw patient messages up to 8 seconds late and the server was hammered with
//   unnecessary GET calls.
//
//   This hook opens a WebSocket to the same backend endpoint used by the
//   patient web:  ws/support/tickets/<id>/?token=<jwt>
//   Both sides (patient + agent) join channel group ticket_<id>.
//   When either sends a message, both receive it instantly via group_send.
//
// CONTRACT:
//   - Call with (ticketId, accessToken)
//   - Returns { messages, connected, loading, error, sending, sendMessage }
//   - Zero polling — no setInterval anywhere in this file
//   - Deduplicates messages by id so history + live never double-render
//   - Auto-reconnects up to MAX_RETRIES times with linear backoff
//   - Falls back to REST POST if WS is closed when agent hits Send
// =============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { ticketApi, API_BASE } from '../services/api';
import type { ChatMessage, WsChatMessage } from '../schema';

const MAX_RETRIES    = 3;
const RETRY_DELAY_MS = 2000;

interface TicketChatState {
  messages:  ChatMessage[];
  connected: boolean;
  loading:   boolean;
  error:     string | null;
  sending:   boolean;
}

export function useTicketChat(ticketId: number | null, accessToken: string | null) {
  const [state, setState] = useState<TicketChatState>({
    messages:  [],
    connected: false,
    loading:   true,
    error:     null,
    sending:   false,
  });

  const wsRef        = useRef<WebSocket | null>(null);
  const retryCount   = useRef(0);
  const retryTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted    = useRef(true);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const appendMessage = useCallback((msg: ChatMessage) => {
    setState(prev => {
      if (prev.messages.some(m => m.id === msg.id)) return prev;
      return { ...prev, messages: [...prev.messages, msg] };
    });
  }, []);

  const buildWsUrl = useCallback(() => {
    if (!ticketId || !accessToken) return null;
    const wsBase = API_BASE
      .replace('https://', 'wss://')
      .replace('http://', 'ws://');
    return `${wsBase}/ws/support/tickets/${ticketId}/?token=${accessToken}`;
  }, [ticketId, accessToken]);

  // ── Load history ─────────────────────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    if (!ticketId) return;
    try {
      const messages = await ticketApi.getMessages(ticketId);
      if (isMounted.current) {
        setState(prev => ({ ...prev, messages, loading: false }));
      }
    } catch (e: any) {
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: e?.message ?? 'Failed to load messages.',
        }));
      }
    }
  }, [ticketId]);

  // ── WebSocket connect ─────────────────────────────────────────────────────

  const connectWs = useCallback(() => {
    if (!isMounted.current) return;
    const url = buildWsUrl();
    if (!url) return;

    // Tear down any existing socket before opening a fresh one
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
      setState(prev => ({ ...prev, connected: true, error: null }));
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!isMounted.current) return;
      try {
        const data = JSON.parse(event.data as string) as WsChatMessage;
        if (data.type !== 'chat_message') return;

        appendMessage({
          id:          data.id,
          sender:      data.sender,
          text:        data.text,
          time:        data.time,
          sent_at:     data.sent_at,
          mine:        data.mine,
          sender_type: data.sender_type,
        });
      } catch {
        // Malformed frame — ignore
      }
    };

    ws.onerror = () => {
      if (!isMounted.current) return;
      setState(prev => ({ ...prev, connected: false }));
    };

    ws.onclose = () => {
      if (!isMounted.current) return;
      setState(prev => ({ ...prev, connected: false }));
      wsRef.current = null;

      // Auto-reconnect with linear backoff
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        const delay = RETRY_DELAY_MS * retryCount.current;
        retryTimer.current = setTimeout(() => {
          if (isMounted.current) connectWs();
        }, delay);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildWsUrl, appendMessage]);

  // ── Mount / ticket-change effect ─────────────────────────────────────────

  useEffect(() => {
    if (!ticketId || !accessToken) {
      setState({ messages: [], connected: false, loading: false, error: null, sending: false });
      return;
    }

    isMounted.current = true;

    // Reset state for the new ticket before loading
    setState({ messages: [], connected: false, loading: true, error: null, sending: false });

    loadHistory();
    connectWs();

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
  // Re-run whenever the agent switches to a different ticket
  }, [ticketId, accessToken]);

  // ── Send message ─────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !ticketId) return;

    setState(prev => ({ ...prev, sending: true, error: null }));

    try {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        // Happy path — WS is live, send through the socket
        ws.send(JSON.stringify({ message: trimmed }));
      } else {
        // Fallback — WS not ready, POST via REST and append manually
        const msg = await ticketApi.sendMessage(ticketId, trimmed);
        setState(prev => ({
          ...prev,
          messages: prev.messages.some(m => m.id === msg.id)
            ? prev.messages
            : [...prev.messages, msg],
        }));
      }
    } catch (e: any) {
      setState(prev => ({
        ...prev,
        error: e?.message ?? 'Failed to send message.',
      }));
    } finally {
      setState(prev => ({ ...prev, sending: false }));
    }
  }, [ticketId]);

  return { ...state, sendMessage };
}