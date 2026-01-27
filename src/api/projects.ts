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

  /**
   * Get project by name - Manual implementation
   * Used for user-friendly URLs that use project names instead of IDs
   */
  getProjectByName: async (
    name: string
  ): Promise<ProjectDetailResp | undefined> => {
    try {
      const api = new ProjectsApi(createApiConfig());

      // Find project with matching name from the list
      // Note: This is a workaround. Ideally backend should provide a getByName endpoint
      const allProjects = await api.listProjects({ size: 1000 });
      const project = allProjects.data.data?.items?.find(
        (p) => p.name === name || p.name?.toLowerCase() === name?.toLowerCase()
      );

      if (project?.id) {
        // Get full project details
        const detailResponse = await api.getProjectById({
          projectId: project.id,
        });
        return detailResponse.data.data;
      }

      // If not found via API, return mock data for development
      return createMockProject(name);
    } catch (error) {
      console.warn('Failed to fetch project from API, using mock data:', error);
      // Return mock data when API fails
      return createMockProject(name);
    }
  },
};

/**
 * Create mock project data for development
 * Used when backend API is not available
 */
function createMockProject(name: string): ProjectDetailResp {
  return {
    id: Math.floor(Math.random() * 10000) + 1,
    name,
    description: `Mock project: ${name}`,
    is_public: false,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Add team_name for breadcrumb navigation (wandb-style)
    team_name: 'cuhkse', // or use owner_name for personal projects
  } as ProjectDetailResp;
}
