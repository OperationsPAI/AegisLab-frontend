import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { List, type ListImperativeAPI } from 'react-window';

import {
  CalendarOutlined,
  CopyOutlined,
  DownloadOutlined,
  SearchOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import AnsiToHtml from 'ansi-to-html';
import { Button, Input, message, Select, Tooltip } from 'antd';

import { useTaskLogs } from '@/hooks/useTaskLogs';

import './LogViewer.css';

// ANSI to HTML converter with custom colors
const ansiConverter = new AnsiToHtml({
  fg: '#d4d4d4',
  bg: 'transparent',
  colors: {
    0: '#1e1e1e', // black
    1: '#f14c4c', // red (errors)
    2: '#23d18b', // green
    3: '#f5f543', // yellow (warnings)
    4: '#3b8eea', // blue
    5: '#d670d6', // magenta
    6: '#29b8db', // cyan
    7: '#d4d4d4', // white
    8: '#808080', // bright black
    9: '#f14c4c', // bright red
    10: '#23d18b', // bright green
    11: '#f5f543', // bright yellow
    12: '#3b8eea', // bright blue
    13: '#d670d6', // bright magenta
    14: '#29b8db', // bright cyan
    15: '#ffffff', // bright white
  },
});

export interface LogLine {
  lineNumber: number;
  timestamp?: string;
  content: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
}

export interface LogViewerProps {
  /** Task ID — connects via WebSocket to stream logs */
  taskId?: string;
  loading?: boolean;
  height?: number;
}

interface LogRowData {
  logs: LogLine[];
  showTimestamps: boolean;
  searchQuery: string;
  lineNumberWidth: number;
  /** Width of the sticky gutter (line number + timestamp) */
  gutterWidth: number;
}

// Get level color class
const getLevelClass = (level?: string): string => {
  switch (level) {
    case 'error':
      return 'log-level-error';
    case 'warn':
      return 'log-level-warn';
    case 'info':
      return 'log-level-info';
    case 'debug':
      return 'log-level-debug';
    default:
      return '';
  }
};

// Highlight search query in text
const highlightText = (text: string, query: string): string => {
  if (!query.trim()) return text;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<mark class="log-highlight">$1</mark>');
};

// Detect structured log format and colorize level (W&B style)
// Format: [2025-03-17 09:43:51,083][__main__][INFO] - [rank: 0] Starting training!
const colorizeStructuredLog = (content: string): string => {
  // Match W&B-style pattern: [timestamp][module][LEVEL] message
  const wbPattern =
    /^(\[[\d-]+\s+[\d:,.]+\])(\[.+?\])(\[(?:DEBUG|INFO|WARNING|WARN|ERROR|CRITICAL)\])(.*)$/;
  const match = content.match(wbPattern);

  if (!match) {
    // Try alternative pattern: timestamp | LEVEL | message
    const pipePattern =
      /^(.+?\s+\d{2}:\d{2}:\d{2}[.,]\d{3})\s*\|\s*(DEBUG|INFO|WARNING|WARN|ERROR|CRITICAL)\s*\|\s*(.+)$/;
    const pipeMatch = content.match(pipePattern);

    if (pipeMatch) {
      const [, timestamp, level, message] = pipeMatch;
      const color = getLevelColor(level.toUpperCase());
      return `<span style="color: #29b8db;">${timestamp}</span> | <span style="color: ${color};">[${level}]</span> | <span>${message}</span>`;
    }

    return content;
  }

  const [, timestamp, module, levelBracket, message] = match;
  // Extract level text from [LEVEL]
  const level = levelBracket.replace(/^\[|\]$/g, '');
  const color = getLevelColor(level.toUpperCase());

  return `<span style="color: #29b8db;">${timestamp}</span><span style="color: #262626;">${module}</span><span style="color: ${color};">${levelBracket}</span><span>${message}</span>`;
};

// Get W&B-style color for log level
const getLevelColor = (level: string): string => {
  const levelColors: Record<string, string> = {
    DEBUG: '#8c8c8c',
    INFO: '#10b981',
    WARNING: '#f59e0b',
    WARN: '#f59e0b',
    ERROR: '#ef4444',
    CRITICAL: '#dc2626',
  };
  return levelColors[level] || '#595959';
};

// Parse ANSI and apply highlighting
const processContent = (content: string, searchQuery: string): string => {
  // First check for structured log format and colorize
  let processed = colorizeStructuredLog(content);

  // If not structured, convert ANSI codes to HTML
  if (processed === content) {
    processed = ansiConverter.toHtml(content);
  }

  // Then apply search highlighting
  if (searchQuery) {
    processed = highlightText(processed, searchQuery);
  }
  return processed;
};

// Log row component for react-window v2
const LogRow = (props: {
  ariaAttributes: {
    'aria-posinset': number;
    'aria-setsize': number;
    role: 'listitem';
  };
  index: number;
  style: CSSProperties;
  logs: LogLine[];
  showTimestamps: boolean;
  searchQuery: string;
  lineNumberWidth: number;
  gutterWidth: number;
}) => {
  const {
    index,
    style,
    logs,
    showTimestamps,
    searchQuery,
    lineNumberWidth,
    gutterWidth,
  } = props;
  const log = logs[index];

  if (!log) return null;

  const processedContent = processContent(log.content, searchQuery);
  const levelClass = getLevelClass(log.level);

  return (
    <div className={`log-row ${levelClass}`} style={style}>
      {/* Gutter: absolutely positioned, translates to stay fixed on horizontal scroll */}
      <div className='log-row-gutter' style={{ width: gutterWidth }}>
        <span className='log-line-number' style={{ width: lineNumberWidth }}>
          {log.lineNumber}
        </span>
        {showTimestamps && log.timestamp && (
          <span className='log-timestamp'>{log.timestamp}</span>
        )}
      </div>
      <span
        className='log-content'
        style={{ marginLeft: gutterWidth }}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </div>
  );
};

/**
 * Professional Log Viewer component with virtual scrolling
 * Features:
 * - Virtual scrolling for large logs (react-window)
 * - ANSI color support
 * - Real-time log streaming via WebSocket (when taskId is provided)
 * - Keyword highlighting
 * - Timestamp toggle
 * - Copy and download functionality
 * - Auto-scroll while streaming
 */
const LogViewer: React.FC<LogViewerProps> = ({
  taskId,
  loading = false,
  height = 500,
}) => {
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef<ListImperativeAPI>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(height);

  // GitHub Actions style auto-follow logic
  const [autoScroll, setAutoScroll] = useState(true);
  const initialScrollDone = useRef(false);
  const programmaticScroll = useRef(false);

  // Stream logs via WebSocket when taskId is provided
  const { logs, isConnected, isComplete } = useTaskLogs(taskId);

  // Determine streaming status from WebSocket state
  const isStreaming = isConnected && !isComplete;

  // Filter logs based on search query
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter(
      (log) =>
        log.content.toLowerCase().includes(query) ||
        log.timestamp?.toLowerCase().includes(query)
    );
  }, [logs, searchQuery]);

  // Calculate line number width based on max line number
  const lineNumberWidth = useMemo(() => {
    const maxLineNum = logs.length > 0 ? logs[logs.length - 1].lineNumber : 0;
    const digits = Math.max(String(maxLineNum).length, 2);
    return digits * 8 + 16; // 8px per digit + padding
  }, [logs]);

  // Calculate gutter width from actual content (line number + longest timestamp)
  const gutterWidth = useMemo(() => {
    // gutter padding-left (12px) + line number block + line number padding-right (12px)
    let width = 12 + lineNumberWidth;
    if (showTimestamps) {
      // Find the longest timestamp to size accurately
      const maxTsLen = logs.reduce(
        (max, log) => Math.max(max, log.timestamp?.length ?? 0),
        0
      );
      // Monospace 11px ≈ 6.6px/char + pill padding (6+6) + margin-right (12)
      const tsWidth = maxTsLen * 6.6 + 12 + 12;
      width += tsWidth;
    }
    return Math.ceil(width);
  }, [lineNumberWidth, showTimestamps, logs]);

  // Sync horizontal scroll position to CSS variable for the gutter
  // In react-window v2, .log-viewer-list IS the scroll container (single div, no inner wrapper)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollEl = container.querySelector(
      '.log-viewer-list'
    ) as HTMLElement | null;
    if (!scrollEl) return;

    const handleScroll = () => {
      // Update CSS variable so gutter translateX stays in place
      scrollEl.style.setProperty('--scroll-left', `${scrollEl.scrollLeft}px`);
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener('scroll', handleScroll);
    };
  }, [filteredLogs.length]);

  // Handle container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.contentRect.height;
        if (newHeight > 0) {
          setContainerHeight(newHeight);
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Auto-scroll to bottom when new logs arrive (GitHub Actions style)
  useEffect(() => {
    if (!autoScroll || !listRef.current || filteredLogs.length === 0) return;

    programmaticScroll.current = true;
    listRef.current.scrollToRow({
      index: filteredLogs.length - 1,
      align: 'end',
    });

    // Mark initial scroll done after a short delay to let render settle
    if (!initialScrollDone.current) {
      requestAnimationFrame(() => {
        initialScrollDone.current = true;
        programmaticScroll.current = false;
      });
    } else {
      // Reset programmatic flag after scroll completes
      requestAnimationFrame(() => {
        programmaticScroll.current = false;
      });
    }
  }, [filteredLogs.length, autoScroll]);

  // Detect user scroll to toggle auto-follow
  // Only disable autoScroll when user explicitly scrolls AWAY from bottom
  const handleRowsRendered = useCallback(
    (visibleRows: { startIndex: number; stopIndex: number }) => {
      // Skip during initial load — haven't scrolled to bottom yet
      if (!initialScrollDone.current) return;
      // Skip programmatic scrolls (our own scrollToRow calls)
      if (programmaticScroll.current) return;

      const isAtBottom = visibleRows.stopIndex >= filteredLogs.length - 3;
      setAutoScroll(isAtBottom);
    },
    [filteredLogs.length]
  );

  // Manual scroll to bottom (button click)
  const scrollToBottom = useCallback(() => {
    if (listRef.current && filteredLogs.length > 0) {
      setAutoScroll(true);
      programmaticScroll.current = true;
      listRef.current.scrollToRow({
        index: filteredLogs.length - 1,
        align: 'end',
      });
      requestAnimationFrame(() => {
        programmaticScroll.current = false;
      });
    }
  }, [filteredLogs.length]);

  // Build plain text from log lines (raw content only)
  const buildLogText = useCallback(
    () => logs.map((log) => log.content).join('\n'),
    [logs]
  );

  // Copy all logs to clipboard
  const handleCopyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildLogText());
      message.success('Logs copied to clipboard');
    } catch {
      message.error('Failed to copy logs');
    }
  }, [buildLogText]);

  // Download logs as file
  const handleDownload = useCallback(() => {
    const blob = new Blob([buildLogText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('Logs downloaded');
  }, [buildLogText]);

  // Row props for virtualized list
  const rowProps: LogRowData = useMemo(
    () => ({
      logs: filteredLogs,
      showTimestamps,
      searchQuery,
      lineNumberWidth,
      gutterWidth,
    }),
    [filteredLogs, showTimestamps, searchQuery, lineNumberWidth, gutterWidth]
  );

  const ROW_HEIGHT = 22;

  return (
    <div className='log-viewer'>
      {/* Toolbar */}
      <div className='log-viewer-toolbar'>
        <div className='log-viewer-toolbar-left'>
          <Select
            value={showTimestamps ? 'visible' : 'hidden'}
            onChange={(value) => setShowTimestamps(value === 'visible')}
            style={{ width: 200 }}
            options={[
              {
                value: 'visible',
                label: (
                  <span>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    Timestamps visible
                  </span>
                ),
              },
              {
                value: 'hidden',
                label: (
                  <span>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    Timestamps hidden
                  </span>
                ),
              },
            ]}
          />
          <Input
            placeholder='Search'
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
        </div>

        <div className='log-viewer-toolbar-right'>
          <Tooltip title='Copy all logs'>
            <Button
              icon={<CopyOutlined />}
              onClick={handleCopyAll}
              disabled={logs.length === 0}
            />
          </Tooltip>
          <Tooltip title='Download logs'>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              disabled={logs.length === 0}
            />
          </Tooltip>
        </div>
      </div>

      {/* Log Content */}
      <div className='log-viewer-content' ref={containerRef}>
        {loading ? (
          <div className='log-viewer-loading'>
            <span>Loading logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className='log-viewer-empty'>
            {searchQuery ? (
              <span>No logs match your search</span>
            ) : (
              <>
                <div className='log-viewer-empty-icon' />
                <span>No logs available for this run</span>
              </>
            )}
          </div>
        ) : (
          <List<LogRowData>
            listRef={listRef}
            defaultHeight={containerHeight || height}
            rowCount={filteredLogs.length}
            rowHeight={ROW_HEIGHT}
            rowProps={rowProps}
            rowComponent={LogRow}
            overscanCount={20}
            onRowsRendered={handleRowsRendered}
            className='log-viewer-list'
            style={{ height: containerHeight || height }}
          />
        )}
      </div>

      {/* Status bar */}
      {isStreaming && (
        <div className='log-viewer-status-bar'>
          <span className='log-viewer-status-indicator' />
          <span>Live {autoScroll ? '- Following' : '- Paused'}</span>
        </div>
      )}

      {/* Scroll to bottom button (GitHub Actions style) */}
      {!autoScroll && filteredLogs.length > 0 && (
        <Tooltip title='Scroll to bottom'>
          <button
            className='log-viewer-scroll-bottom'
            onClick={scrollToBottom}
            type='button'
          >
            <VerticalAlignBottomOutlined />
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export default LogViewer;
