/**
 * useNotifications - Global hook for notification state via SSE.
 *
 * Connects to the backend notification SSE stream and maintains
 * an in-memory list of notifications with unread tracking.
 *
 * Usage:
 *   const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { createNotificationStream } from '@/api/notifications';

// ---------- Types ----------

export interface NotificationEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
  /** Optional extra payload from the backend */
  payload?: Record<string, unknown>;
}

// ---------- Constants ----------

const MAX_NOTIFICATIONS = 200;
const RECONNECT_DELAY = 5_000;
const MAX_RECONNECT_ATTEMPTS = 10;

// ---------- Hook ----------

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const reconnectRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    let intentionalClose = false;

    const connect = () => {
      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = createNotificationStream();
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        reconnectRef.current = 0;
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          const notification: NotificationEvent = {
            id: data.id ?? crypto.randomUUID(),
            type: data.type ?? 'info',
            message: data.message ?? '',
            timestamp: data.timestamp ?? new Date().toISOString(),
            read: false,
            payload: data.payload,
          };

          setNotifications((prev) => {
            const next = [notification, ...prev];
            // Cap the list to avoid unbounded memory growth
            if (next.length > MAX_NOTIFICATIONS) {
              return next.slice(0, MAX_NOTIFICATIONS);
            }
            return next;
          });

          setUnreadCount((prev) => prev + 1);
        } catch {
          // Ignore unparseable messages (heartbeats, comments)
        }
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        setIsConnected(false);

        if (intentionalClose) return;

        // Reconnect with backoff
        if (reconnectRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectRef.current += 1;
          const delay =
            RECONNECT_DELAY * Math.pow(1.5, reconnectRef.current - 1);

          reconnectTimerRef.current = setTimeout(() => {
            if (!intentionalClose) {
              connect();
            }
          }, delay);
        }
      };
    };

    // Defer initial connection
    const timer = setTimeout(connect, 0);

    return () => {
      intentionalClose = true;
      clearTimeout(timer);

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setIsConnected(false);
    };
  }, []);

  // TODO: markAsRead, markAllAsRead, and clearAll are client-only (in-memory).
  // Changes are lost on page reload. Once a backend API for persisting read
  // state exists, these should call it and invalidate the local cache.

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
};
