/**
 * useTablePersistence - Hook for persisting table state to localStorage
 *
 * Handles persistence of table settings including columns, sorting,
 * pagination, and filters for W&B-style workspace tables.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { SortField, TableViewSettings } from '@/types/workspace';

interface UseTablePersistenceOptions {
  storageKey: string;
  defaultSettings: TableViewSettings;
  defaultSortField?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

interface UseTablePersistenceReturn {
  settings: TableViewSettings;
  updateSettings: (updates: Partial<TableViewSettings>) => void;
  resetSettings: () => void;
  // Pagination helpers
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  // Sort helpers (single field - legacy)
  sortBy: string | undefined;
  sortOrder: 'asc' | 'desc' | undefined;
  setSorting: (field?: string, order?: 'asc' | 'desc') => void;
  // Multi-sort helpers
  sortFields: SortField[];
  setSortFields: (fields: SortField[]) => void;
  addSortField: (field: string, order?: 'asc' | 'desc') => void;
  removeSortField: (key: string) => void;
  updateSortField: (key: string, updates: Partial<SortField>) => void;
  resetSortToDefault: () => void;
  // Group helpers
  groupBy: string | null;
  setGroupBy: (field: string | null) => void;
  // Filter helpers
  filters: Record<string, unknown>;
  setFilters: (filters: Record<string, unknown>) => void;
  clearFilters: () => void;
}

// Generate unique key for sort field
const generateSortKey = () =>
  `sort-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function useTablePersistence({
  storageKey,
  defaultSettings,
  defaultSortField,
  defaultSortOrder = 'desc',
}: UseTablePersistenceOptions): UseTablePersistenceReturn {
  const fullStorageKey = `table-settings-${storageKey}`;

  // Load initial settings from localStorage
  const loadInitialSettings = (): TableViewSettings => {
    try {
      const saved = localStorage.getItem(fullStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle new fields
        return {
          ...defaultSettings,
          ...parsed,
          columns: parsed.columns || defaultSettings.columns,
        };
      }
    } catch {
      // Ignore parse errors
    }
    return defaultSettings;
  };

  const [settings, setSettings] =
    useState<TableViewSettings>(loadInitialSettings);
  const [currentPage, setCurrentPageState] = useState(1);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(fullStorageKey, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings, fullStorageKey]);

  // Update settings partially
  const updateSettings = useCallback((updates: Partial<TableViewSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    setCurrentPageState(1);
    try {
      localStorage.removeItem(fullStorageKey);
    } catch {
      // Ignore storage errors
    }
  }, [defaultSettings, fullStorageKey]);

  // Pagination helpers
  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(page);
  }, []);

  const setPageSize = useCallback(
    (size: number) => {
      updateSettings({ pageSize: size });
      setCurrentPageState(1); // Reset to first page when page size changes
    },
    [updateSettings]
  );

  // Sort helpers (single field - legacy)
  const setSorting = useCallback(
    (field?: string, order?: 'asc' | 'desc') => {
      updateSettings({
        sortBy: field,
        sortOrder: order,
      });
    },
    [updateSettings]
  );

  // Multi-sort helpers
  const sortFields = useMemo(
    () => settings.sortFields || [],
    [settings.sortFields]
  );

  const setSortFields = useCallback(
    (fields: SortField[]) => {
      updateSettings({ sortFields: fields });
    },
    [updateSettings]
  );

  const addSortField = useCallback(
    (field: string, order: 'asc' | 'desc' = 'desc') => {
      const newField: SortField = {
        key: generateSortKey(),
        field,
        order,
      };
      setSettings((prev) => ({
        ...prev,
        sortFields: [...(prev.sortFields || []), newField],
      }));
    },
    []
  );

  const removeSortField = useCallback((key: string) => {
    setSettings((prev) => ({
      ...prev,
      sortFields: (prev.sortFields || []).filter((f) => f.key !== key),
    }));
  }, []);

  const updateSortField = useCallback(
    (key: string, updates: Partial<SortField>) => {
      setSettings((prev) => ({
        ...prev,
        sortFields: (prev.sortFields || []).map((f) =>
          f.key === key ? { ...f, ...updates } : f
        ),
      }));
    },
    []
  );

  const resetSortToDefault = useCallback(() => {
    if (defaultSortField) {
      updateSettings({
        sortFields: [
          {
            key: generateSortKey(),
            field: defaultSortField,
            order: defaultSortOrder,
          },
        ],
      });
    } else {
      updateSettings({ sortFields: [] });
    }
  }, [defaultSortField, defaultSortOrder, updateSettings]);

  // Group helpers
  const groupBy = settings.groupBy ?? null;

  const setGroupBy = useCallback(
    (field: string | null) => {
      updateSettings({ groupBy: field });
      setCurrentPageState(1); // Reset to first page when grouping changes
    },
    [updateSettings]
  );

  // Filter helpers
  const setFilters = useCallback(
    (filters: Record<string, unknown>) => {
      updateSettings({ filters });
      setCurrentPageState(1); // Reset to first page when filters change
    },
    [updateSettings]
  );

  const clearFilters = useCallback(() => {
    updateSettings({ filters: {} });
    setCurrentPageState(1);
  }, [updateSettings]);

  return {
    settings,
    updateSettings,
    resetSettings,
    // Pagination
    currentPage,
    pageSize: settings.pageSize,
    setCurrentPage,
    setPageSize,
    // Sorting (single field - legacy)
    sortBy: settings.sortBy,
    sortOrder: settings.sortOrder,
    setSorting,
    // Multi-sort
    sortFields,
    setSortFields,
    addSortField,
    removeSortField,
    updateSortField,
    resetSortToDefault,
    // Group
    groupBy,
    setGroupBy,
    // Filters
    filters: settings.filters || {},
    setFilters,
    clearFilters,
  };
}

export default useTablePersistence;
