import { useMemo } from 'react';

import dayjs from 'dayjs';

import { type LogLine, LogViewer } from './LogViewer';

import './LogsTab.css';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
}

interface LogsTabProps {
  logs?: LogEntry[];
  rawLogs?: string[];
  loading?: boolean;
  status?: 'running' | 'success' | 'failed' | 'pending' | string;
  onDownload?: () => void;
}

// Generate realistic mock logs similar to W&B / LiteLLM
const generateMockLogs = (): string[] => {
  const baseLogs = [
    '\x1b[32m2025-11-01 11:21:56\x1b[0m',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m \x1b[33mGive Feedback / Get Help: https://github.com/BerriAI/litellm/issues/new\x1b[0m',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m \x1b[36mLiteLLM: Proxy initialized with Config, Set models:\x1b[0m',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m \x1b[36m\t./Qwen3-1.7B\x1b[0m',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m \x1b[36m\t./Qwen3-1.7B\x1b[0m',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m \x1b[36m\t./Qwen3-1.7B\x1b[0m',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m \x1b[36m\t./Qwen3-1.7B\x1b[0m',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m \x1b[36m\t./Qwen3-1.7B\x1b[0m',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m \x1b[36m\t./Qwen3-1.7B\x1b[0m',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m \x1b[36m\t./Qwen3-1.7B\x1b[0m',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m \x1b[36m\t./Qwen3-1.7B\x1b[0m',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m INFO:     Application startup complete.',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m INFO:     Uvicorn running on http://0.0.0.0:41107 (Press CTRL+C to quit)',
    '\x1b[32m2025-11-01 11:21:56\x1b[0m Completed 0/20 tasks...',
    '\x1b[32m2025-11-01 11:21:59\x1b[0m 2025-11-01 11:21:59,461 \x1b[33m[WARNING]\x1b[0m (Process-2708541 agentlightning.llm_proxy)   Loop and lock are not owned by the current process. Clearing them.',
    '\x1b[32m2025-11-01 11:21:59\x1b[0m INFO:     10.0.6.208:36356 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:22:00\x1b[0m INFO:     10.0.6.208:36370 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:22:01\x1b[0m INFO:     10.0.6.208:36384 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:22:02\x1b[0m Completed 1/20 tasks...',
    '\x1b[32m2025-11-01 11:22:05\x1b[0m INFO:     10.0.6.208:36398 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:22:08\x1b[0m \x1b[31m[ERROR]\x1b[0m Connection timeout for task 3, retrying...',
    '\x1b[32m2025-11-01 11:22:10\x1b[0m INFO:     10.0.6.208:36412 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:22:12\x1b[0m Completed 2/20 tasks...',
    '\x1b[32m2025-11-01 11:22:15\x1b[0m INFO:     10.0.6.208:36426 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:22:18\x1b[0m Completed 3/20 tasks...',
    '\x1b[32m2025-11-01 11:22:20\x1b[0m INFO:     10.0.6.208:36440 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:22:23\x1b[0m Completed 4/20 tasks...',
    '\x1b[32m2025-11-01 11:22:25\x1b[0m INFO:     Processing batch inference request',
    '\x1b[32m2025-11-01 11:22:28\x1b[0m \x1b[34m[DEBUG]\x1b[0m Model loaded: Qwen3-1.7B, memory usage: 3.2GB',
    '\x1b[32m2025-11-01 11:22:30\x1b[0m Completed 5/20 tasks...',
    '\x1b[32m2025-11-01 11:22:33\x1b[0m INFO:     10.0.6.208:36454 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:22:35\x1b[0m Completed 6/20 tasks...',
    '\x1b[32m2025-11-01 11:22:38\x1b[0m INFO:     10.0.6.208:36468 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:22:40\x1b[0m Completed 7/20 tasks...',
    '\x1b[32m2025-11-01 11:22:43\x1b[0m INFO:     10.0.6.208:36482 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:22:45\x1b[0m Completed 8/20 tasks...',
    '\x1b[32m2025-11-01 11:22:48\x1b[0m INFO:     10.0.6.208:36496 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:22:50\x1b[0m Completed 9/20 tasks...',
    '\x1b[32m2025-11-01 11:22:53\x1b[0m INFO:     10.0.6.208:36510 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:22:55\x1b[0m Completed 10/20 tasks...',
    '\x1b[32m2025-11-01 11:22:58\x1b[0m \x1b[33m[WARNING]\x1b[0m High memory usage detected: 85%',
    '\x1b[32m2025-11-01 11:23:00\x1b[0m INFO:     10.0.6.208:36524 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:23:03\x1b[0m Completed 11/20 tasks...',
    '\x1b[32m2025-11-01 11:23:05\x1b[0m INFO:     10.0.6.208:36538 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:23:08\x1b[0m Completed 12/20 tasks...',
    '\x1b[32m2025-11-01 11:23:10\x1b[0m INFO:     10.0.6.208:36552 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:23:13\x1b[0m Completed 13/20 tasks...',
    '\x1b[32m2025-11-01 11:23:15\x1b[0m INFO:     10.0.6.208:36566 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:23:18\x1b[0m Completed 14/20 tasks...',
    '\x1b[32m2025-11-01 11:23:20\x1b[0m INFO:     10.0.6.208:36580 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:23:23\x1b[0m Completed 15/20 tasks...',
    '\x1b[32m2025-11-01 11:23:25\x1b[0m INFO:     10.0.6.208:36594 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:23:28\x1b[0m Completed 16/20 tasks...',
    '\x1b[32m2025-11-01 11:23:30\x1b[0m INFO:     10.0.6.208:36608 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:23:33\x1b[0m Completed 17/20 tasks...',
    '\x1b[32m2025-11-01 11:23:35\x1b[0m INFO:     10.0.6.208:36622 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:23:38\x1b[0m Completed 18/20 tasks...',
    '\x1b[32m2025-11-01 11:23:40\x1b[0m INFO:     10.0.6.208:36636 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:23:43\x1b[0m Completed 19/20 tasks...',
    '\x1b[32m2025-11-01 11:23:45\x1b[0m INFO:     10.0.6.208:36650 - "POST /chat/completions HTTP/1.1" 200 OK',
    '\x1b[32m2025-11-01 11:23:48\x1b[0m Completed 20/20 tasks...',
    '\x1b[32m2025-11-01 11:23:50\x1b[0m \x1b[32mAll tasks completed successfully!\x1b[0m',
    '\x1b[32m2025-11-01 11:23:52\x1b[0m INFO:     Shutting down proxy server...',
    '\x1b[32m2025-11-01 11:23:55\x1b[0m INFO:     Application shutdown complete.',
  ];
  return baseLogs;
};

// Parse timestamp from log line (format: YYYY-MM-DD HH:mm:ss)
const parseTimestamp = (line: string): string | undefined => {
  // Match timestamp pattern at the start or after ANSI codes
  const match = line.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
  return match ? match[1] : undefined;
};

// Remove ANSI-escaped timestamp prefix from content for separate display
const cleanTimestampPrefix = (line: string): string => {
  // Remove the leading ANSI-colored timestamp pattern
  // eslint-disable-next-line no-control-regex
  return line.replace(
    /^\x1b\[\d+m\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\x1b\[0m\s*/,
    ''
  );
};

// Detect log level from content
const detectLogLevel = (content: string): LogLine['level'] => {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('[error]') || lowerContent.includes('error:')) {
    return 'error';
  }
  if (lowerContent.includes('[warning]') || lowerContent.includes('warn:')) {
    return 'warn';
  }
  if (lowerContent.includes('[debug]') || lowerContent.includes('debug:')) {
    return 'debug';
  }
  return 'info';
};

/**
 * Logs tab component - W&B style timestamped logs with virtual scrolling
 */
const LogsTab: React.FC<LogsTabProps> = ({
  logs,
  rawLogs,
  loading = false,
  status,
  onDownload,
}) => {
  // Convert LogEntry[] to LogLine[] or use rawLogs
  const logLines: LogLine[] = useMemo(() => {
    // If rawLogs are provided, use them directly with mock data fallback
    if (rawLogs && rawLogs.length > 0) {
      return rawLogs.map((line, index) => ({
        lineNumber: index + 1,
        timestamp: parseTimestamp(line),
        content: cleanTimestampPrefix(line) || line,
        level: detectLogLevel(line),
      }));
    }

    // If LogEntry[] logs are provided, convert them
    if (logs && logs.length > 0) {
      return logs.map((log, index) => ({
        lineNumber: index + 1,
        timestamp: dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss'),
        content: log.message,
        level: log.level,
      }));
    }

    // Use mock data for demo
    const mockRawLogs = generateMockLogs();
    return mockRawLogs.map((line, index) => ({
      lineNumber: index + 1,
      timestamp: parseTimestamp(line),
      content: cleanTimestampPrefix(line) || line,
      level: detectLogLevel(line),
    }));
  }, [logs, rawLogs]);

  return (
    <div className='logs-tab'>
      <LogViewer
        logs={logLines}
        loading={loading}
        status={status}
        onDownload={onDownload}
      />
    </div>
  );
};

export default LogsTab;
