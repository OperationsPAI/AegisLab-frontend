/**
 * useColumnResize - Hook for column resizing functionality
 *
 * Provides drag-to-resize functionality for table columns.
 * Pinned columns cannot be resized.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ColumnConfig } from '@/types/workspace';

interface ColumnResizeState {
  columnKey: string | null;
  startX: number;
  startWidth: number;
}

interface UseColumnResizeOptions {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  minWidth?: number;
  maxWidth?: number;
}

interface UseColumnResizeReturn {
  resizingColumn: string | null;
  handleResizeStart: (columnKey: string, e: React.MouseEvent) => void;
  getResizeHandleProps: (columnKey: string) => {
    onMouseDown: (e: React.MouseEvent) => void;
    className: string;
    style: React.CSSProperties;
  };
}

const useColumnResize = ({
  columns,
  onColumnsChange,
  minWidth = 40,
  maxWidth = 800,
}: UseColumnResizeOptions): UseColumnResizeReturn => {
  const [resizeState, setResizeState] = useState<ColumnResizeState>({
    columnKey: null,
    startX: 0,
    startWidth: 0,
  });

  const resizeRef = useRef(resizeState);
  resizeRef.current = resizeState;

  // Handle mouse move during resize
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const { columnKey, startX, startWidth } = resizeRef.current;
      if (!columnKey) return;

      const diff = e.clientX - startX;
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startWidth + diff)
      );

      const updatedColumns = columns.map((col) =>
        col.key === columnKey ? { ...col, width: newWidth } : col
      );

      onColumnsChange(updatedColumns);
    },
    [columns, onColumnsChange, minWidth, maxWidth]
  );

  // Handle mouse up to end resize
  const handleMouseUp = useCallback(() => {
    setResizeState({
      columnKey: null,
      startX: 0,
      startWidth: 0,
    });
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Add and remove event listeners for resize
  useEffect(() => {
    if (resizeState.columnKey) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizeState.columnKey, handleMouseMove, handleMouseUp]);

  // Start resize on mouse down
  const handleResizeStart = useCallback(
    (columnKey: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const column = columns.find((col) => col.key === columnKey);
      if (!column || column.pinned) return; // Don't resize pinned columns

      const currentWidth =
        typeof column.width === 'number'
          ? column.width
          : parseInt(String(column.width), 10) || 150;

      setResizeState({
        columnKey,
        startX: e.clientX,
        startWidth: currentWidth,
      });
    },
    [columns]
  );

  // Get props for resize handle element
  const getResizeHandleProps = useCallback(
    (columnKey: string) => {
      const column = columns.find((col) => col.key === columnKey);
      const isPinned = column?.pinned ?? false;
      const isResizing = resizeState.columnKey === columnKey;

      return {
        onMouseDown: (e: React.MouseEvent) => handleResizeStart(columnKey, e),
        className: `column-resize-handle ${isResizing ? 'resizing' : ''} ${isPinned ? 'disabled' : ''}`,
        style: {
          cursor: isPinned ? 'default' : 'col-resize',
        } as React.CSSProperties,
      };
    },
    [columns, resizeState.columnKey, handleResizeStart]
  );

  return {
    resizingColumn: resizeState.columnKey,
    handleResizeStart,
    getResizeHandleProps,
  };
};

export default useColumnResize;
