/**
 * Profile API
 * Handles profile-related operations including activity and starred projects
 * Uses mock data until backend API is available
 */
import type { ExecutionResp, ProjectResp } from '@rcabench/client';

import type {
  ActivityContribution,
  ActivityResponse,
  ProjectWithStats,
} from '@/types/api';

import { executionApi } from './executions';
import { projectApi } from './projects';

const STARRED_STORAGE_KEY = 'aegislab_starred_projects';

/**
 * Generate mock activity data for the past year
 */
function generateMockActivity(): ActivityContribution[] {
  const contributions: ActivityContribution[] = [];
  const today = new Date();

  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate random activity with some patterns
    // More activity on weekdays, less on weekends
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseChance = isWeekend ? 0.2 : 0.4;

    let count = 0;
    if (Math.random() < baseChance) {
      // Random count between 1-15
      count = Math.floor(Math.random() * 15) + 1;
    }

    contributions.push({
      date: date.toISOString().split('T')[0],
      count,
    });
  }

  return contributions;
}

/**
 * Get starred project IDs from localStorage
 */
function getStarredFromStorage(): number[] {
  try {
    const stored = localStorage.getItem(STARRED_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save starred project IDs to localStorage
 */
function saveStarredToStorage(ids: number[]): void {
  localStorage.setItem(STARRED_STORAGE_KEY, JSON.stringify(ids));
}

export const profileApi = {
  /**
   * Get user activity data (mock implementation)
   */
  getActivity: async (): Promise<ActivityResponse> => {
    // TODO: Replace with actual API call when backend is ready
    // GET /api/v2/users/me/activity
    const contributions = generateMockActivity();
    const totalRuns = contributions.reduce((sum, c) => sum + c.count, 0);

    return {
      contributions,
      total_runs: totalRuns,
      total_projects: 8,
    };
  },

  /**
   * Get recent runs (executions) for the current user
   */
  getRecentRuns: async (limit = 5): Promise<ExecutionResp[]> => {
    try {
      const response = await executionApi.getExecutions({ size: limit });
      return response.items || [];
    } catch {
      return [];
    }
  },

  /**
   * Get starred project IDs
   */
  getStarredProjectIds: async (): Promise<number[]> => {
    // TODO: Replace with actual API call when backend is ready
    // GET /api/v2/users/me/starred-projects
    return getStarredFromStorage();
  },

  /**
   * Star a project
   */
  starProject: async (projectId: number): Promise<void> => {
    // TODO: Replace with actual API call when backend is ready
    // POST /api/v2/projects/{id}/star
    const starred = getStarredFromStorage();
    if (!starred.includes(projectId)) {
      saveStarredToStorage([...starred, projectId]);
    }
  },

  /**
   * Unstar a project
   */
  unstarProject: async (projectId: number): Promise<void> => {
    // TODO: Replace with actual API call when backend is ready
    // DELETE /api/v2/projects/{id}/star
    const starred = getStarredFromStorage();
    saveStarredToStorage(starred.filter((id) => id !== projectId));
  },

  /**
   * Toggle star status for a project
   */
  toggleStar: async (projectId: number): Promise<boolean> => {
    const starred = getStarredFromStorage();
    const isCurrentlyStarred = starred.includes(projectId);

    if (isCurrentlyStarred) {
      await profileApi.unstarProject(projectId);
      return false;
    } else {
      await profileApi.starProject(projectId);
      return true;
    }
  },

  /**
   * Check if a project is starred
   */
  isProjectStarred: (projectId: number): boolean => {
    const starred = getStarredFromStorage();
    return starred.includes(projectId);
  },

  /**
   * Get starred projects with details
   */
  getStarredProjects: async (): Promise<ProjectWithStats[]> => {
    const starredIds = getStarredFromStorage();
    if (starredIds.length === 0) return [];

    try {
      const response = await projectApi.getProjects({ size: 100 });
      const allProjects = response?.items || [];

      return allProjects
        .filter(
          (p): p is ProjectResp & { id: number } =>
            p.id !== undefined && starredIds.includes(p.id)
        )
        .map((p) => ({
          id: p.id,
          name: p.name || '',
          visibility: p.is_public ? 'public' : 'private',
          updated_at: p.updated_at,
          created_at: p.created_at,
          run_count: 0, // TODO: Get from API
          is_starred: true,
        }));
    } catch {
      return [];
    }
  },

  /**
   * Get user's projects with stats
   */
  getUserProjects: async (params?: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<{ items: ProjectWithStats[]; total: number }> => {
    try {
      const response = await projectApi.getProjects({
        page: params?.page,
        size: params?.size,
      });

      const starredIds = getStarredFromStorage();
      let items = (response?.items || [])
        .filter((p): p is ProjectResp & { id: number } => p.id !== undefined)
        .map((p) => ({
          id: p.id,
          name: p.name || '',
          is_public: p.is_public,
          visibility: p.is_public ? ('public' as const) : ('private' as const),
          updated_at: p.updated_at,
          created_at: p.created_at,
          run_count: 0, // TODO: Get from API
          is_starred: starredIds.includes(p.id),
        }));

      // Filter by search if provided
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        items = items.filter((p) => p.name.toLowerCase().includes(searchLower));
      }

      return {
        items,
        total: response?.pagination?.total || items.length,
      };
    } catch {
      return { items: [], total: 0 };
    }
  },
};
