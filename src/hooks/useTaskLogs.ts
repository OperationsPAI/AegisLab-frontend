/**
 * useTaskLogs — React hook for streaming task logs via WebSocket
 *
 * Connects to the backend WebSocket at /api/v2/tasks/{taskId}/logs/ws,
 * accumulates history + realtime LogEntry items, and converts them
 * into LogLine[] that LogViewer can render.
 *
 * Usage:
 *   const { logs, isConnected, isComplete, error } = useTaskLogs(taskId);
 *   <LogViewer logs={logs} />
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import type { LogEntry, WSLogMessage } from '@rcabench/client';

import type { LogLine } from '@/components/workspace/DetailView/tabs/LogViewer';

// ─── Types ──────────────────────────────────────────────────────────────────

type WSLogMsgType = 'history' | 'realtime' | 'end' | 'error';

interface WSCallbacks {
  onLogs: (entries: LogEntry[], type: WSLogMsgType) => void;
  onEnd?: (message?: string) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
  onTotalCount?: (total: number) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const MAX_RECONNECT_ATTEMPTS = 3;
const BASE_RECONNECT_DELAY = 2000;

/** Build the full WebSocket URL for a given taskId */
const buildWsUrl = (taskId: string): string => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const token = localStorage.getItem('access_token');
  const base = `${protocol}//${window.location.host}/api/v2/tasks/${taskId}/logs/ws`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
};

/** Check if a WebSocket close event indicates an authentication failure */
const isAuthClose = (code: number, reason: string): boolean => {
  // Custom auth close codes commonly used by backends
  if (code === 4401 || code === 4403 || code === 1008) return true;
  // Inspect reason string for auth-related keywords
  const lower = reason.toLowerCase();
  return (
    lower.includes('unauthorized') ||
    lower.includes('forbidden') ||
    lower.includes('token') ||
    lower.includes('401') ||
    lower.includes('403')
  );
};

/**
 * Attempt to refresh the access token.
 * Mirrors the refresh logic in src/api/client.ts so WebSocket reconnects
 * pick up the new token via buildWsUrl.
 */
const tryRefreshToken = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;

  try {
    const { protocol, host } = window.location;
    const response = await fetch(`${protocol}//${host}/api/v2/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (!response.ok) return false;

    const data = (await response.json()) as { token?: string };
    if (data.token) {
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('refresh_token', data.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

/** Detect log level from raw content string */
const detectLogLevel = (content: string, level?: string): LogLine['level'] => {
  if (level === 'error') return 'error';
  if (level === 'warn') return 'warn';
  if (level === 'debug') return 'debug';
  if (level === 'info') return 'info';

  const lower = content.toLowerCase();
  if (lower.includes('[error]') || lower.includes('error:')) return 'error';
  if (lower.includes('[warning]') || lower.includes('warn:')) return 'warn';
  if (lower.includes('[debug]') || lower.includes('debug:')) return 'debug';
  return 'info';
};

/** Convert backend LogEntry to our LogLine (immutable) */
const toLogLine = (entry: LogEntry, lineNumber: number): LogLine => ({
  lineNumber,
  timestamp: entry.timestamp,
  content: entry.line ?? '',
  level: detectLogLevel(entry.line ?? '', entry.level),
});

// ─── Internal WebSocket manager ─────────────────────────────────────────────

/** Create and manage a WebSocket connection for task logs */
const createLogSocket = (taskId: string, callbacks: WSCallbacks) => {
  let ws: WebSocket | null = null;
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let intentionalClose = false;

  const handleMessage = (raw: string) => {
    let msg: WSLogMessage;
    try {
      msg = JSON.parse(raw) as WSLogMessage;
    } catch {
      callbacks.onError?.('Failed to parse WebSocket message');
      return;
    }

    const msgType = (msg.type ?? 'realtime') as WSLogMsgType;

    switch (msgType) {
      case 'history':
        if (msg.total != null) {
          callbacks.onTotalCount?.(msg.total);
        }
        if (msg.logs?.length) {
          callbacks.onLogs(msg.logs, 'history');
        }
        break;

      case 'realtime':
        if (msg.logs?.length) {
          callbacks.onLogs(msg.logs, 'realtime');
        }
        break;

      case 'end':
        callbacks.onEnd?.(msg.message);
        intentionalClose = true;
        ws?.close();
        break;

      case 'error':
        callbacks.onError?.(msg.message ?? 'Unknown server error');
        break;
    }
  };

  const tryReconnect = () => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      callbacks.onError?.(
        `Reconnect failed after ${MAX_RECONNECT_ATTEMPTS} attempts`
      );
      return;
    }

    reconnectAttempts += 1;
    const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1);

    reconnectTimer = setTimeout(() => {
      connect();
    }, delay);
  };

  const connect = () => {
    if (ws) {
      disconnect();
    }

    intentionalClose = false;
    const url = buildWsUrl(taskId);

    try {
      ws = new WebSocket(url);
    } catch (err) {
      callbacks.onError?.(`Failed to create WebSocket: ${String(err)}`);
      return;
    }

    ws.onopen = () => {
      reconnectAttempts = 0;
      callbacks.onConnectionChange?.(true);
    };

    ws.onmessage = (event: MessageEvent) => {
      handleMessage(event.data);
    };

    ws.onerror = () => {
      callbacks.onError?.('WebSocket connection error');
    };

    ws.onclose = (event: CloseEvent) => {
      callbacks.onConnectionChange?.(false);
      if (intentionalClose) return;

      if (isAuthClose(event.code, event.reason ?? '')) {
        // Auth failure — refresh token then reconnect with new credentials
        tryRefreshToken().then((refreshed) => {
          if (refreshed) {
            reconnectAttempts = 0;
            connect();
          } else {
            // Refresh failed — mirror axios interceptor behaviour
            callbacks.onError?.(
              'Authentication expired — redirecting to login'
            );
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        });
      } else {
        tryReconnect();
      }
    };
  };

  const disconnect = () => {
    intentionalClose = true;

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
      ws = null;
    }

    callbacks.onConnectionChange?.(false);
  };

  return { connect, disconnect };
};

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface UseTaskLogsResult {
  /** Accumulated log lines (history + realtime), in order */
  logs: LogLine[];
  /** Whether the WebSocket is currently connected */
  isConnected: boolean;
  /** Whether the server signaled end-of-stream */
  isComplete: boolean;
  /** Last error message, if any */
  error: string | undefined;
  /** Total history log count reported by backend */
  totalHistoryCount: number;
}

/** Interval (ms) between each queued realtime log line render */
const REALTIME_TICK_MS = 50;
/** When queue exceeds this size, flush everything in one batch */
const QUEUE_FLUSH_THRESHOLD = 100;

export const useTaskLogs = (taskId?: string): UseTaskLogsResult => {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);

  // Use a ref to track the running line counter across batches
  const lineCounterRef = useRef(0);

  // Queue for realtime logs — filled by WebSocket, drained by timer
  const realtimeQueueRef = useRef<LogLine[]>([]);

  // Guard against setState after unmount (async WebSocket callbacks may fire late)
  const unmountedRef = useRef(false);
  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  const handleLogs = useCallback((entries: LogEntry[], type: WSLogMsgType) => {
    if (entries.length === 0 || unmountedRef.current) return;

    // Assign line numbers immediately so they stay sequential
    const startLine = lineCounterRef.current;
    const newLines = entries.map((entry, idx) =>
      toLogLine(entry, startLine + idx + 1)
    );
    lineCounterRef.current = startLine + entries.length;

    if (type === 'history') {
      // History logs: render all at once — no need to animate
      setLogs((prev) => [...prev, ...newLines]);
    } else {
      // Realtime logs: push into queue, timer will drain them
      realtimeQueueRef.current.push(...newLines);
    }
  }, []);

  // Timer that drains the realtime queue one line at a time
  // When the queue is backed up (> QUEUE_FLUSH_THRESHOLD), flush all at once
  useEffect(() => {
    const timer = setInterval(() => {
      if (unmountedRef.current) return;
      const queue = realtimeQueueRef.current;
      if (queue.length === 0) return;

      if (queue.length > QUEUE_FLUSH_THRESHOLD) {
        // Queue pressure — flush everything in one batch
        const batch = queue.splice(0);
        setLogs((prev) => [...prev, ...batch]);
      } else {
        // Normal pace — pop one line
        const next = queue.shift();
        if (next) {
          setLogs((prev) => [...prev, next]);
        }
      }
    }, REALTIME_TICK_MS);

    return () => clearInterval(timer);
  }, []);

  const handleEnd = useCallback((_message?: string) => {
    if (unmountedRef.current) return;
    // Flush any remaining queued lines before marking complete
    const remaining = realtimeQueueRef.current.splice(0);
    if (remaining.length > 0) {
      setLogs((prev) => [...prev, ...remaining]);
    }
    setIsComplete(true);
  }, []);

  const handleError = useCallback((errMsg: string) => {
    if (unmountedRef.current) return;
    setError(errMsg);
  }, []);

  const handleConnectionChange = useCallback((connected: boolean) => {
    if (unmountedRef.current) return;
    setIsConnected(connected);
  }, []);

  const handleTotalCount = useCallback((total: number) => {
    if (unmountedRef.current) return;
    setTotalHistoryCount(total);
  }, []);

  useEffect(() => {
    // Reset state when taskId changes
    setLogs([]);
    setIsConnected(false);
    setIsComplete(false);
    setError(undefined);
    setTotalHistoryCount(0);
    lineCounterRef.current = 0;
    realtimeQueueRef.current = [];

    if (!taskId) return;

    const socket = createLogSocket(taskId, {
      onLogs: handleLogs,
      onEnd: handleEnd,
      onError: handleError,
      onConnectionChange: handleConnectionChange,
      onTotalCount: handleTotalCount,
    });

    // Delay connect to next tick so React StrictMode's immediate
    // cleanup can cancel it before the WebSocket is actually created.
    // Without this, StrictMode's mount→unmount→remount cycle would
    // close the WebSocket while it's still CONNECTING, causing:
    // "WebSocket is closed before the connection is established"
    const connectTimer = setTimeout(() => {
      socket.connect();
    }, 0);

    return () => {
      clearTimeout(connectTimer);
      socket.disconnect();
      // Flush queue on unmount so nothing is lost if re-mounting
      realtimeQueueRef.current = [];
    };
  }, [
    taskId,
    handleLogs,
    handleEnd,
    handleError,
    handleConnectionChange,
    handleTotalCount,
  ]);

  return { logs, isConnected, isComplete, error, totalHistoryCount };
};
