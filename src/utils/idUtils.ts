/**
 * ID 转换工具
 *
 * 统一列表页（数字 ID）和 Workspace（字符串 ID）之间的转换
 * 采用带前缀的字符串格式：inj_1, exec_1
 */
import type { RunsDataSource } from '@/types/workspace';

/**
 * 将数字 ID 转换为带前缀的字符串 Run ID
 * @param dataSource - 数据源类型
 * @param id - 数字 ID
 * @returns 带前缀的字符串 ID (e.g., 'inj_1', 'exec_1')
 */
export const toRunId = (
  dataSource: RunsDataSource,
  id: number | string
): string => {
  const prefix = dataSource === 'injections' ? 'inj' : 'exec';
  return `${prefix}_${id}`;
};

/**
 * 将带前缀的字符串 Run ID 解析为数据源和数字 ID
 * @param runId - 带前缀的字符串 ID
 * @returns 解析结果，包含 dataSource 和 id
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
 * 批量将数字 ID 数组转换为带前缀的字符串 ID 数组
 * @param dataSource - 数据源类型
 * @param ids - 数字 ID 数组
 * @returns 带前缀的字符串 ID 数组
 */
export const toRunIds = (
  dataSource: RunsDataSource,
  ids: Array<number | string | React.Key>
): string[] => {
  return ids.map((id) => toRunId(dataSource, Number(id)));
};

/**
 * 批量将带前缀的字符串 ID 数组解析为数字 ID 数组（仅提取指定数据源的 ID）
 * @param dataSource - 数据源类型
 * @param runIds - 带前缀的字符串 ID 数组
 * @returns 数字 ID 数组
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
 * 检查 Run ID 是否属于指定的数据源
 * @param runId - 带前缀的字符串 ID
 * @param dataSource - 数据源类型
 * @returns 是否属于该数据源
 */
export const isRunIdOfDataSource = (
  runId: string,
  dataSource: RunsDataSource
): boolean => {
  const prefix = dataSource === 'injections' ? 'inj_' : 'exec_';
  return runId.startsWith(prefix);
};

/**
 * 从 visibleRuns 对象中获取指定数据源的可见 ID 数组
 * @param visibleRuns - 可见性映射 Record<string, boolean>
 * @param dataSource - 数据源类型
 * @returns 可见的数字 ID 数组
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
 * 从 visibleRuns 对象中获取指定数据源的可见字符串 ID 数组
 * @param visibleRuns - 可见性映射 Record<string, boolean>
 * @param dataSource - 数据源类型
 * @returns 可见的字符串 ID 数组
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
