/**
 * useRunListSettings - Shared hook for run list display settings
 *
 * Provides synchronized access to display settings (cropMode, sortOrder)
 * between RunsPanel sidebar and WorkspaceTable views.
 *
 * NOTE: Workspace store was removed. This hook now uses local state as a stub.
 */
import { useCallback, useState } from 'react';

import type {
  RunListDisplaySettings,
  RunNameCropMode,
  RunsDataSource,
} from '@/types/workspace';

export interface UseRunListSettingsOptions {
  /** Data source to manage settings for */
  dataSource: RunsDataSource;
}

export interface UseRunListSettingsReturn {
  /** Current display settings */
  displaySettings: RunListDisplaySettings;
  /** Current crop mode */
  cropMode: RunNameCropMode;
  /** Current sort order */
  sortOrder: 'asc' | 'desc';
  /** Set crop mode */
  setCropMode: (mode: RunNameCropMode) => void;
  /** Set sort order */
  setSortOrder: (order: 'asc' | 'desc') => void;
  /** Toggle sort order between asc and desc */
  toggleSortOrder: () => void;
  /** Randomize colors for visible runs */
  randomizeColors: () => void;
  /** Update multiple display settings at once */
  updateSettings: (settings: Partial<RunListDisplaySettings>) => void;
}

const DEFAULT_SETTINGS: RunListDisplaySettings = {
  cropMode: 'auto' as RunNameCropMode,
  sortOrder: 'desc',
};

/**
 * Hook for managing run list display settings
 *
 * @example
 * ```tsx
 * const {
 *   cropMode,
 *   sortOrder,
 *   setCropMode,
 *   toggleSortOrder,
 *   randomizeColors
 * } = useRunListSettings({ dataSource: 'injections' });
 * ```
 */
export function useRunListSettings({
  dataSource: _dataSource,
}: UseRunListSettingsOptions): UseRunListSettingsReturn {
  const [displaySettings, setDisplaySettings] =
    useState<RunListDisplaySettings>(DEFAULT_SETTINGS);

  const { cropMode, sortOrder } = displaySettings;

  const setCropMode = useCallback((mode: RunNameCropMode) => {
    setDisplaySettings((prev) => ({ ...prev, cropMode: mode }));
  }, []);

  const setSortOrder = useCallback((order: 'asc' | 'desc') => {
    setDisplaySettings((prev) => ({ ...prev, sortOrder: order }));
  }, []);

  const toggleSortOrder = useCallback(() => {
    setDisplaySettings((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const randomizeColors = useCallback(() => {
    // No-op stub (workspace store removed)
  }, []);

  const updateSettings = useCallback(
    (settings: Partial<RunListDisplaySettings>) => {
      setDisplaySettings((prev) => ({ ...prev, ...settings }));
    },
    []
  );

  return {
    displaySettings,
    cropMode,
    sortOrder,
    setCropMode,
    setSortOrder,
    toggleSortOrder,
    randomizeColors,
    updateSettings,
  };
}

export default useRunListSettings;
