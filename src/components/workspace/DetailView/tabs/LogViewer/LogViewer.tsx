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
} from '@ant-design/icons';
import AnsiToHtml from 'ansi-to-html';
import { Button, Input, message, Select, Tooltip } from 'antd';

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
  logs: LogLine[];
  loading?: boolean;
  status?: 'running' | 'success' | 'failed' | 'pending' | string;
  height?: number;
  onDownload?: () => void;
}

interface LogRowData {
  logs: LogLine[];
  showTimestamps: boolean;
  searchQuery: string;
  lineNumberWidth: number;
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

// Parse ANSI and apply highlighting
const processContent = (content: string, searchQuery: string): string => {
  // First convert ANSI codes to HTML
  let processed = ansiConverter.toHtml(content);
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
}) => {
  const { index, style, logs, showTimestamps, searchQuery, lineNumberWidth } =
    props;
  const log = logs[index];

  if (!log) return null;

  const processedContent = processContent(log.content, searchQuery);
  const levelClass = getLevelClass(log.level);

  return (
    <div className={`log-row ${levelClass}`} style={style}>
      <span className='log-line-number' style={{ width: lineNumberWidth }}>
        {log.lineNumber}
      </span>
      {showTimestamps && log.timestamp && (
        <span className='log-timestamp'>{log.timestamp}</span>
      )}
      <span
        className='log-content'
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
 * - Keyword highlighting
 * - Timestamp toggle
 * - Copy and download functionality
 * - Auto-scroll for running status
 */
const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  loading = false,
  status,
  height = 500,
  onDownload,
}) => {
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef<ListImperativeAPI>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(height);

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

  // Auto-scroll when new logs arrive and status is running
  useEffect(() => {
    if (
      autoScroll &&
      status === 'running' &&
      listRef.current &&
      filteredLogs.length > 0
    ) {
      listRef.current.scrollToRow({
        index: filteredLogs.length - 1,
        align: 'end',
      });
    }
  }, [filteredLogs.length, autoScroll, status]);

  // Toggle auto-scroll based on scroll position
  const handleRowsRendered = useCallback(
    (visibleRows: { startIndex: number; stopIndex: number }) => {
      const isAtBottom = visibleRows.stopIndex >= filteredLogs.length - 3;
      setAutoScroll(isAtBottom);
    },
    [filteredLogs.length]
  );

  // Copy all logs to clipboard
  const handleCopyAll = useCallback(async () => {
    const text = logs
      .map((log) => {
        const timestamp =
          showTimestamps && log.timestamp ? `${log.timestamp} ` : '';
        return `${log.lineNumber.toString().padStart(4, ' ')} ${timestamp}${log.content}`;
      })
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      message.success('Logs copied to clipboard');
    } catch {
      message.error('Failed to copy logs');
    }
  }, [logs, showTimestamps]);

  // Download logs as file
  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
      return;
    }

    const text = logs
      .map((log) => {
        const timestamp = log.timestamp ? `${log.timestamp} ` : '';
        return `${timestamp}${log.content}`;
      })
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('Logs downloaded');
  }, [logs, onDownload]);

  // Row props for virtualized list
  const rowProps: LogRowData = useMemo(
    () => ({
      logs: filteredLogs,
      showTimestamps,
      searchQuery,
      lineNumberWidth,
    }),
    [filteredLogs, showTimestamps, searchQuery, lineNumberWidth]
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
      {status === 'running' && (
        <div className='log-viewer-status-bar'>
          <span className='log-viewer-status-indicator' />
          <span>Live - Auto-scrolling {autoScroll ? 'enabled' : 'paused'}</span>
        </div>
      )}
    </div>
  );
};

export default LogViewer;
