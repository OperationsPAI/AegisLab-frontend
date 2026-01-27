/**
 * useTableColumns - Hook for managing table column configuration
 *
 * Provides column visibility, ordering, and pinning functionality
 * for W&B-style workspace tables.
 */
import { useCallback, useMemo, useState } from 'react';

import type { ColumnConfig } from '@/types/workspace';

interface UseTableColumnsOptions {
  defaultColumns: ColumnConfig[];
  storageKey?: string;
}

interface UseTableColumnsReturn {
  columns: ColumnConfig[];
  visibleColumns: ColumnConfig[];
  hiddenColumns: ColumnConfig[];
  pinnedColumns: ColumnConfig[];
  setColumns: (columns: ColumnConfig[]) => void;
  toggleColumnVisibility: (key: string) => void;
  toggleColumnPin: (key: string) => void;
  reorderColumns: (fromIndex: number, toIndex: number) => void;
  showAllColumns: () => void;
  hideUnpinnedColumns: () => void;
  resetColumns: () => void;
  moveColumnToVisible: (key: string) => void;
  moveColumnToHidden: (key: string) => void;
}

export function useTableColumns({
  defaultColumns,
  storageKey,
}: UseTableColumnsOptions): UseTableColumnsReturn {
  // Load initial columns from localStorage if storageKey provided
  const loadInitialColumns = (): ColumnConfig[] => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(`table-columns-${storageKey}`);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {
        // Ignore parse errors
      }
    }
    return defaultColumns;
  };

  const [columns, setColumnsState] =
    useState<ColumnConfig[]>(loadInitialColumns);

  // Save columns to localStorage when they change
  const setColumns = useCallback(
    (newColumns: ColumnConfig[]) => {
      setColumnsState(newColumns);
      if (storageKey) {
        try {
          localStorage.setItem(
            `table-columns-${storageKey}`,
            JSON.stringify(newColumns)
          );
        } catch {
          // Ignore storage errors
        }
      }
    },
    [storageKey]
  );

  // Get visible columns sorted by order
  const visibleColumns = useMemo(
    () =>
      columns.filter((col) => col.visible).sort((a, b) => a.order - b.order),
    [columns]
  );

  // Get hidden columns sorted by order
  const hiddenColumns = useMemo(
    () =>
      columns.filter((col) => !col.visible).sort((a, b) => a.order - b.order),
    [columns]
  );

  // Get pinned columns (visible and pinned)
  const pinnedColumns = useMemo(
    () =>
      columns
        .filter((col) => col.visible && col.pinned)
        .sort((a, b) => a.order - b.order),
    [columns]
  );

  // Toggle column visibility
  const toggleColumnVisibility = useCallback(
    (key: string) => {
      setColumns(
        columns.map((col) =>
          col.key === key && !col.locked
            ? { ...col, visible: !col.visible }
            : col
        )
      );
    },
    [columns, setColumns]
  );

  // Toggle column pinning
  const toggleColumnPin = useCallback(
    (key: string) => {
      setColumns(
        columns.map((col) =>
          col.key === key ? { ...col, pinned: !col.pinned } : col
        )
      );
    },
    [columns, setColumns]
  );

  // Reorder columns
  const reorderColumns = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newColumns = [...columns];
      const visibleCols = newColumns.filter((c) => c.visible);

      if (fromIndex < 0 || fromIndex >= visibleCols.length) return;
      if (toIndex < 0 || toIndex >= visibleCols.length) return;

      const [movedCol] = visibleCols.splice(fromIndex, 1);
      visibleCols.splice(toIndex, 0, movedCol);

      // Update order for all visible columns
      visibleCols.forEach((col, index) => {
        const colIndex = newColumns.findIndex((c) => c.key === col.key);
        if (colIndex >= 0) {
          newColumns[colIndex] = { ...newColumns[colIndex], order: index };
        }
      });

      setColumns(newColumns);
    },
    [columns, setColumns]
  );

  // Show all columns
  const showAllColumns = useCallback(() => {
    setColumns(columns.map((col) => ({ ...col, visible: true })));
  }, [columns, setColumns]);

  // Hide unpinned columns
  const hideUnpinnedColumns = useCallback(() => {
    setColumns(
      columns.map((col) =>
        col.pinned || col.locked ? col : { ...col, visible: false }
      )
    );
  }, [columns, setColumns]);

  // Reset columns to default
  const resetColumns = useCallback(() => {
    setColumns(defaultColumns);
  }, [defaultColumns, setColumns]);

  // Move column to visible
  const moveColumnToVisible = useCallback(
    (key: string) => {
      setColumns(
        columns.map((col) =>
          col.key === key ? { ...col, visible: true } : col
        )
      );
    },
    [columns, setColumns]
  );

  // Move column to hidden
  const moveColumnToHidden = useCallback(
    (key: string) => {
      setColumns(
        columns.map((col) =>
          col.key === key && !col.locked ? { ...col, visible: false } : col
        )
      );
    },
    [columns, setColumns]
  );

  return {
    columns,
    visibleColumns,
    hiddenColumns,
    pinnedColumns,
    setColumns,
    toggleColumnVisibility,
    toggleColumnPin,
    reorderColumns,
    showAllColumns,
    hideUnpinnedColumns,
    resetColumns,
    moveColumnToVisible,
    moveColumnToHidden,
  };
}

export default useTableColumns;
