import { useState, useEffect, useRef, useCallback } from 'react';
import { getWsBase, bleSupportApi } from '../services/api';
import type { BLEMonitorEvent, BLEPredictionRecord } from '../schema';

const MAX_RETRIES    = 5;
const RETRY_DELAY_MS = 3000;
const MAX_EVENTS     = 100;

function recordToEvent(r: BLEPredictionRecord): BLEMonitorEvent {
  return {
    type:           'mi_alert',
    alert_id:       `hist-${r.id}`, 
    patient_code:   r.patient_code,
    ecg_record_id:  r.ecg_record_id,
    mi_detected:    r.mi_detected,
    confidence:     r.confidence,
    severity:       r.severity,
    recommendation: r.recommendation,
    model_name:     r.model_name,
    timestamp:      r.created_at,
  };
}

export function useBLEMonitor(accessToken: string | null) {
  const [events,      setEvents]      = useState<BLEMonitorEvent[]>([]);
  const [connected,   setConnected]   = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const wsRef      = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted  = useRef(true);

  // ── Load history on mount — fills the table before any live WS event ────
  useEffect(() => {
    console.log('[useBLEMonitor] history effect — accessToken:', accessToken ? 'present' : 'null');
    if (!accessToken) return;
    bleSupportApi.getHistory(50)
      .then(res => {
        console.log('[useBLEMonitor] history loaded:', res.results?.length, 'records');
        if (!isMounted.current) return;
        const historyEvents = (res.results ?? []).map(recordToEvent);
        setEvents(historyEvents);
        setHistoryLoaded(true);
      })
      .catch(() => {
        setHistoryLoaded(true);
      });
  }, [accessToken]);

  const connect = useCallback(() => {
    console.log('[useBLEMonitor] connect() called — accessToken:', accessToken ? 'present' : 'null');
    if (!isMounted.current || !accessToken) return;

    const url = `${getWsBase()}/ws/ecg-alerts/?token=${accessToken}`;

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMounted.current) return;
      setConnected(true);
      retryCount.current = 0;
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!isMounted.current) return;
      try {
        const data = JSON.parse(event.data as string) as BLEMonitorEvent;
        console.log('[useBLEMonitor] WS message received:', data.type, {
          patient_code: data.patient_code,
          mi_detected:  data.mi_detected,
          severity:     data.severity,
          alert_id:     data.alert_id,
        });

        if (data.type === 'mi_alert' && data.patient_code) {
          console.log('[useBLEMonitor] reading received — mi:', data.mi_detected, 'patient:', data.patient_code);
          setEvents(prev => {
            const exists = data.alert_id
              ? prev.some(e => e.alert_id === data.alert_id)
              : false;
            if (exists) return prev;
            return [data, ...prev].slice(0, MAX_EVENTS);
          });
        }

        if (data.type === 'alert_claimed' && data.alert_id) {
          setEvents(prev => prev.filter(e => e.alert_id !== data.alert_id));
        }
      } catch {
      }
    };

    ws.onerror = (err) => {
      console.log('[useBLEMonitor] WS error:', err);
    };

    ws.onclose = (e) => {
      console.log('[useBLEMonitor] WS closed — code:', e.code, 'reason:', e.reason);
      if (!isMounted.current) return;
      setConnected(false);
      wsRef.current = null;

      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        const delay = RETRY_DELAY_MS * retryCount.current;
        retryTimer.current = setTimeout(() => {
          if (isMounted.current) connect();
        }, delay);
      }
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    isMounted.current = true;
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
  }, [accessToken, connect]);

  const clearEvents = useCallback(() => setEvents([]), []);

  return { events, connected, historyLoaded, clearEvents };
}