/**
 * ID Conversion Utilities
 *
 * Converts between numeric IDs (list pages) and prefixed string IDs (workspace).
 * Uses prefixed string format: inj_1, exec_1
 */
import type { RunsDataSource } from '@/types/workspace';

/**
 * Convert a numeric ID to a prefixed string Run ID.
 * @param dataSource - Data source type
 * @param id - Numeric ID
 * @returns Prefixed string ID (e.g., 'inj_1', 'exec_1')
 */
export const toRunId = (
  dataSource: RunsDataSource,
  id: number | string
): string => {
  const prefix = dataSource === 'injections' ? 'inj' : 'exec';
  return `${prefix}_${id}`;
};

/**
 * Parse a prefixed string Run ID into data source and numeric ID.
 * @param runId - Prefixed string ID
 * @returns Parsed result containing dataSource and id
 */
export const fromRunId = (
  runId: string
): { dataSource: RunsDataSource; id: number } => {
  const parts = runId.split('_');
  const prefix = parts[0];
  const id = Number(parts.slice(1).join('_'));

  return {
    dataSource: prefix === 'inj' ? 'injections' : 'executions',
    id,
  };
};

/**
 * Batch convert numeric ID array to prefixed string ID array.
 * @param dataSource - Data source type
 * @param ids - Numeric ID array
 * @returns Prefixed string ID array
 */
export const toRunIds = (
  dataSource: RunsDataSource,
  ids: Array<number | string | React.Key>
): string[] => {
  return ids.map((id) => toRunId(dataSource, Number(id)));
};

/**
 * Batch parse prefixed string ID array to numeric ID array (only extracts IDs of the specified data source).
 * @param dataSource - Data source type
 * @param runIds - Prefixed string ID array
 * @returns Numeric ID array
 */
export const fromRunIds = (
  dataSource: RunsDataSource,
  runIds: string[]
): number[] => {
  const prefix = dataSource === 'injections' ? 'inj_' : 'exec_';
  return runIds
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number(id.replace(prefix, '')));
};

/**
 * Check if a Run ID belongs to the specified data source.
 * @param runId - Prefixed string ID
 * @param dataSource - Data source type
 * @returns Whether the ID belongs to the data source
 */
export const isRunIdOfDataSource = (
  runId: string,
  dataSource: RunsDataSource
): boolean => {
  const prefix = dataSource === 'injections' ? 'inj_' : 'exec_';
  return runId.startsWith(prefix);
};

/**
 * Get visible numeric ID array for a specified data source from visibleRuns map.
 * @param visibleRuns - Visibility map Record<string, boolean>
 * @param dataSource - Data source type
 * @returns Visible numeric ID array
 */
export const getVisibleIdsFromMap = (
  visibleRuns: Record<string, boolean>,
  dataSource: RunsDataSource
): number[] => {
  const prefix = dataSource === 'injections' ? 'inj_' : 'exec_';
  return Object.entries(visibleRuns)
    .filter(([id, visible]) => visible && id.startsWith(prefix))
    .map(([id]) => Number(id.replace(prefix, '')));
};

/**
 * Get visible string ID array for a specified data source from visibleRuns map.
 * @param visibleRuns - Visibility map Record<string, boolean>
 * @param dataSource - Data source type
 * @returns Visible string ID array
 */
export const getVisibleRunIdsFromMap = (
  visibleRuns: Record<string, boolean>,
  dataSource: RunsDataSource
): string[] => {
  const prefix = dataSource === 'injections' ? 'inj_' : 'exec_';
  return Object.entries(visibleRuns)
    .filter(([id, visible]) => visible && id.startsWith(prefix))
    .map(([id]) => id);
};
