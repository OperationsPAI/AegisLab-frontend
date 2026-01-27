/**
 * useRunListSettings - Shared hook for run list display settings
 *
 * Provides synchronized access to display settings (cropMode, sortOrder)
 * between RunsPanel sidebar and WorkspaceTable views.
 */
import { useCallback, useMemo } from 'react';

import { useWorkspaceStore } from '@/store/workspace';
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
  dataSource,
}: UseRunListSettingsOptions): UseRunListSettingsReturn {
  const getDisplaySettings = useWorkspaceStore((s) => s.getDisplaySettings);
  const setDisplaySettingsAction = useWorkspaceStore(
    (s) => s.setDisplaySettings
  );
  const setCropModeAction = useWorkspaceStore((s) => s.setCropMode);
  const setListSortOrderAction = useWorkspaceStore((s) => s.setListSortOrder);
  const randomizeRunColorsAction = useWorkspaceStore(
    (s) => s.randomizeRunColors
  );

  // Get current display settings
  const displaySettings = useMemo(
    () => getDisplaySettings(dataSource),
    [getDisplaySettings, dataSource]
  );

  const { cropMode, sortOrder } = displaySettings;

  // Memoized action callbacks
  const setCropMode = useCallback(
    (mode: RunNameCropMode) => {
      setCropModeAction(dataSource, mode);
    },
    [setCropModeAction, dataSource]
  );

  const setSortOrder = useCallback(
    (order: 'asc' | 'desc') => {
      setListSortOrderAction(dataSource, order);
    },
    [setListSortOrderAction, dataSource]
  );

  const toggleSortOrder = useCallback(() => {
    setListSortOrderAction(dataSource, sortOrder === 'asc' ? 'desc' : 'asc');
  }, [setListSortOrderAction, dataSource, sortOrder]);

  const randomizeColors = useCallback(() => {
    randomizeRunColorsAction(dataSource);
  }, [randomizeRunColorsAction, dataSource]);

  const updateSettings = useCallback(
    (settings: Partial<RunListDisplaySettings>) => {
      setDisplaySettingsAction(dataSource, settings);
    },
    [setDisplaySettingsAction, dataSource]
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
