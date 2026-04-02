import type {
  InjectionResp,
  LabelItem,
  ListExecutionResp,
  ListProjectResp,
  ProjectDetailResp,
  ProjectResp,
  StatusType,
} from '@rcabench/client';

import apiClient from './client';

export const projectApi = {
  getProjects: (params?: {
    page?: number;
    size?: number;
    isPublic?: boolean;
    status?: StatusType;
  }): Promise<ListProjectResp | undefined> =>
    apiClient.get('/projects', { params }).then((r) => r.data.data),

  getProjectDetail: (id: number): Promise<ProjectDetailResp | undefined> =>
    apiClient.get(`/projects/${id}`).then((r) => r.data.data),

  createProject: (data: {
    name: string;
    description?: string;
    is_public?: boolean;
  }): Promise<ProjectResp | undefined> =>
    apiClient.post('/projects', data).then((r) => r.data.data),

  updateProject: (
    id: number,
    data: {
      name?: string;
      description?: string;
      is_public?: boolean;
      labels?: LabelItem[];
    }
  ) =>
    apiClient
      .patch<{ data: ProjectDetailResp }>(`/projects/${id}`, data)
      .then((r) => r.data),

  deleteProject: (id: number) =>
    apiClient.delete(`/projects/${id}`).then((r) => r.data),

  updateLabels: (id: number, labels: Array<{ key: string; value: string }>) =>
    apiClient.patch(`/projects/${id}/labels`, { labels }).then((r) => r.data),

  listProjectInjections: async (
    projectId: number,
    params?: { page?: number; size?: number }
  ): Promise<{ items: InjectionResp[]; total: number }> => {
    const response = await apiClient.get(`/projects/${projectId}/injections`, {
      params,
    });
    return {
      items: response.data.data?.items || [],
      total: response.data.data?.pagination?.total || 0,
    };
  },

  searchProjectInjections: async (
    projectId: number,
    body?: {
      page?: number;
      size?: number;
      search?: string;
      sort_by?: Array<{ field: string; order: 'asc' | 'desc' }>;
    }
  ): Promise<{ items: InjectionResp[]; total: number }> => {
    const response = await apiClient.post(
      `/projects/${projectId}/injections/search`,
      {
        name_pattern: body?.search,
        page: body?.page,
        size: body?.size,
        sort: body?.sort_by?.map((sf) => ({
          field: sf.field,
          direction: sf.order,
        })),
      }
    );
    return {
      items: (response.data.data?.items ?? []) as InjectionResp[],
      total: response.data.data?.pagination?.total ?? 0,
    };
  },

  submitInjection: (projectId: number, data: unknown) =>
    apiClient
      .post(`/projects/${projectId}/injections/inject`, data)
      .then((r) => r.data.data),

  buildDatapack: (projectId: number, data: unknown) =>
    apiClient
      .post(`/projects/${projectId}/injections/build`, data)
      .then((r) => r.data.data),

  getNoIssues: (
    projectId: number,
    params?: {
      labels?: string[];
      lookback?: string;
      customStartTime?: string;
      customEndTime?: string;
    }
  ) =>
    apiClient
      .get(`/projects/${projectId}/injections/analysis/no-issues`, { params })
      .then((r) => r.data.data),

  getWithIssues: (
    projectId: number,
    params?: {
      labels?: string[];
      lookback?: string;
      customStartTime?: string;
      customEndTime?: string;
    }
  ) =>
    apiClient
      .get(`/projects/${projectId}/injections/analysis/with-issues`, {
        params,
      })
      .then((r) => r.data.data),

  getExecutions: (
    projectId: number,
    params?: { page?: number; size?: number }
  ): Promise<ListExecutionResp> =>
    apiClient
      .get(`/projects/${projectId}/executions`, { params })
      .then((r) => r.data.data as ListExecutionResp),

  executeAlgorithm: (projectId: number, data: unknown) =>
    apiClient
      .post(`/projects/${projectId}/executions/execute`, data)
      .then((r) => r.data.data),
};
