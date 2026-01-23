/**
 * Project API
 * Using @rcabench/client SDK, manually implementing missing endpoints
 */
import {
  type CreateProjectReq,
  type LabelItem,
  type ListProjectResp,
  type ProjectDetailResp,
  type ProjectResp,
  ProjectsApi,
  type StatusType,
} from '@rcabench/client';

import { apiClient, createApiConfig } from './config';

export const projectApi = {
  // ==================== SDK Methods ====================

  /**
   * Get project list - Using SDK
   */
  getProjects: async (params?: {
    page?: number;
    size?: number;
    isPublic?: boolean;
    status?: StatusType;
  }): Promise<ListProjectResp | undefined> => {
    const api = new ProjectsApi(createApiConfig());
    const response = await api.listProjects({
      page: params?.page,
      size: params?.size,
      isPublic: params?.isPublic,
      status: params?.status,
    });
    return response.data.data;
  },

  /**
   * Get project details - Using SDK
   */
  getProject: async (id: number): Promise<ProjectDetailResp | undefined> => {
    const api = new ProjectsApi(createApiConfig());
    const response = await api.getProjectById({ projectId: id });
    return response.data.data;
  },

  /**
   * Create project - Using SDK
   */
  createProject: async (data: {
    name: string;
    description?: string;
    is_public?: boolean;
  }): Promise<ProjectResp | undefined> => {
    const api = new ProjectsApi(createApiConfig());
    const request: CreateProjectReq = {
      name: data.name,
      description: data.description,
      is_public: data.is_public ?? false,
    };
    const response = await api.createProject({ request });
    return response.data.data;
  },

  // ==================== Manual Implementation (SDK Missing) ====================

  /**
   * Update project - Manual implementation (SDK missing)
   */
  updateProject: (
    id: number,
    data: {
      name?: string;
      description?: string;
      is_public?: boolean;
      labels?: LabelItem[];
    }
  ) => apiClient.patch<{ data: ProjectDetailResp }>(`/projects/${id}`, data),

  /**
   * Delete project - Manual implementation (SDK missing)
   */
  deleteProject: (id: number) => apiClient.delete(`/projects/${id}`),

  /**
   * Manage labels - Manual implementation (SDK missing)
   */
  updateLabels: (id: number, labels: Array<{ key: string; value: string }>) =>
    apiClient.patch(`/projects/${id}/labels`, { labels }),
};
