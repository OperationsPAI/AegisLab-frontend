import type {
  Run,
  Workspace,
  WorkspaceSettings,
  WorkspaceView,
} from '@/types/workspace';

// Mock data for development
const mockWorkspace: Workspace = {
  id: '1',
  name: "User's workspace",
  project_id: '1',
  owner_id: '1',
  owner_type: 'user',
  is_personal: true,
  settings: {
    layout: 'grid',
    chartGroups: [],
    visibleMetrics: ['loss', 'accuracy'],
    panelOrder: ['charts', 'media'],
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Workspace API client
 * Currently uses mock data - replace with actual API calls when backend is ready
 */
export const workspaceApi = {
  /**
   * Get workspace by project ID
   */
  getWorkspaceByProject: async (projectId: string): Promise<Workspace> => {
    // TODO: Replace with actual API call
    // return apiClient.get(`/api/v2/projects/${projectId}/workspace`);
    return Promise.resolve({
      ...mockWorkspace,
      project_id: projectId,
    });
  },

  /**
   * Get personal workspace for current user in a project
   */
  getPersonalWorkspace: async (projectId: string): Promise<Workspace> => {
    // TODO: Replace with actual API call
    // return apiClient.get(`/api/v2/projects/${projectId}/workspaces/personal`);
    return Promise.resolve({
      ...mockWorkspace,
      project_id: projectId,
    });
  },

  /**
   * Get all workspaces for a project
   */
  getWorkspaces: async (projectId: string): Promise<Workspace[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get(`/api/v2/projects/${projectId}/workspaces`);
    return Promise.resolve([{ ...mockWorkspace, project_id: projectId }]);
  },

  /**
   * Update workspace settings
   */
  updateWorkspaceSettings: async (
    workspaceId: string,
    settings: Partial<WorkspaceSettings>
  ): Promise<Workspace> => {
    // TODO: Replace with actual API call
    // return apiClient.patch(`/api/v2/workspaces/${workspaceId}`, { settings });
    return Promise.resolve({
      ...mockWorkspace,
      id: workspaceId,
      settings: { ...mockWorkspace.settings, ...settings },
      updated_at: new Date().toISOString(),
    });
  },

  /**
   * Get runs for a project
   */
  getRuns: async (
    _projectId: string,
    params?: {
      page?: number;
      size?: number;
      search?: string;
      status?: string;
    }
  ): Promise<{ items: Run[]; total: number }> => {
    // TODO: Replace with actual API call
    // Use executions API as runs
    // return executionApi.getExecutions({ project_id: projectId, ...params });

    // Mock implementation
    const statuses: Array<Run['status']> = [
      'running',
      'finished',
      'failed',
      'crashed',
    ];
    const mockRuns: Run[] = Array.from({ length: 33 }, (_, i) => ({
      id: `run_${i + 1}`,
      name: `exec_${String(i + 1).padStart(3, '0')}`,
      status: statuses[i % statuses.length],
      created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        loss: Array.from(
          { length: 100 },
          (_, j) => 1 / (j + 1) + Math.random() * 0.1
        ),
        accuracy: Array.from({ length: 100 }, (_, j) =>
          Math.min(0.99, j / 100 + Math.random() * 0.1)
        ),
      },
      config: {},
    }));

    // Apply pagination
    const page = params?.page || 1;
    const size = params?.size || 20;
    const start = (page - 1) * size;
    const items = mockRuns.slice(start, start + size);

    return Promise.resolve({ items, total: mockRuns.length });
  },

  /**
   * Get run details
   */
  getRun: async (runId: string): Promise<Run> => {
    // TODO: Replace with actual API call
    // return executionApi.getExecution(runId);
    return Promise.resolve({
      id: runId,
      name: `exec_${runId}`,
      status: 'finished',
      created_at: new Date().toISOString(),
      metrics: {
        loss: Array.from({ length: 100 }, (_, j) => 1 / (j + 1)),
        accuracy: Array.from({ length: 100 }, (_, j) =>
          Math.min(0.99, j / 100)
        ),
      },
      config: {},
    });
  },

  /**
   * Get run metrics
   */
  getRunMetrics: async (_runId: string): Promise<Record<string, number[]>> => {
    // TODO: Replace with actual API call
    return Promise.resolve({
      loss: Array.from({ length: 100 }, (_, j) => 1 / (j + 1)),
      accuracy: Array.from({ length: 100 }, (_, j) => Math.min(0.99, j / 100)),
      learning_rate: Array.from(
        { length: 100 },
        (_, j) => 0.001 * Math.pow(0.95, j)
      ),
    });
  },

  /**
   * Get saved views for a workspace
   */
  getViews: async (_workspaceId: string): Promise<WorkspaceView[]> => {
    // TODO: Replace with actual API call
    return Promise.resolve([]);
  },

  /**
   * Create a saved view
   */
  createView: async (
    workspaceId: string,
    name: string,
    settings: WorkspaceSettings
  ): Promise<WorkspaceView> => {
    // TODO: Replace with actual API call
    return Promise.resolve({
      id: Date.now().toString(),
      name,
      workspace_id: workspaceId,
      settings,
      is_default: false,
      created_at: new Date().toISOString(),
    });
  },

  /**
   * Delete a saved view
   */
  deleteView: async (_viewId: string): Promise<void> => {
    // TODO: Replace with actual API call
    return Promise.resolve();
  },
};
