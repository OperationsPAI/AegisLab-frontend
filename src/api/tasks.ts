/**
 * Task API
 * Using @rcabench/client SDK, manually implementing missing endpoints
 */
import {
  type GroupStats,
  type ListTaskResp,
  type ListTasksTaskType,
  type StatusType,
  type TaskDetailResp,
  TasksApi,
  type TaskState,
  TracesApi,
} from '@rcabench/client';

import { apiClient, createApiConfig } from './config';

export const taskApi = {
  // ==================== SDK Methods ====================

  /**
   * Get task list - Using SDK
   */
  getTasks: async (params?: {
    page?: number;
    size?: number;
    taskType?: ListTasksTaskType;
    immediate?: boolean;
    traceId?: string;
    groupId?: string;
    projectId?: number;
    state?: TaskState;
    status?: StatusType;
  }): Promise<ListTaskResp | undefined> => {
    const api = new TasksApi(createApiConfig());
    const response = await api.listTasks({
      page: params?.page,
      size: params?.size,
      taskType: params?.taskType,
      immediate: params?.immediate,
      traceId: params?.traceId,
      groupId: params?.groupId,
      projectId: params?.projectId,
      state: params?.state,
      status: params?.status,
    });
    return response.data.data;
  },

  /**
   * Get task details - Using SDK
   */
  getTask: async (taskId: string): Promise<TaskDetailResp | undefined> => {
    const api = new TasksApi(createApiConfig());
    const response = await api.getTaskById({ taskId });
    return response.data.data;
  },

  /**
   * Get trace group statistics - Using SDK
   */
  getGroupStats: async (groupId: string): Promise<GroupStats | undefined> => {
    const api = new TracesApi(createApiConfig());
    const response = await api.getGroupStats({ groupId });
    return response.data.data;
  },

  // ==================== Manual Implementation (SDK Missing) ====================

  /**
   * Batch delete tasks - Manual implementation (SDK missing)
   */
  batchDelete: (ids: string[]) =>
    apiClient.post('/tasks/batch-delete', { ids }),
};

/**
 * Create real-time log stream (SSE)
 * Note: EventSource does not support custom headers,
 * If authentication is needed, backend should support passing token via query params
 */
export const createLogStream = (traceId: string): EventSource => {
  const token = localStorage.getItem('access_token');
  // SSE connection typically needs to pass token via URL parameter
  const url = `/api/v2/traces/${traceId}/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;

  return new EventSource(url);
};
