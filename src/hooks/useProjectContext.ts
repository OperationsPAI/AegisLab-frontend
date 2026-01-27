/**
 * Project Context Hook
 * 从 URL name 获取项目信息，内部存储 id 用于 API 调用
 */
import { useParams } from 'react-router-dom';

import type { ProjectDetailResp } from '@rcabench/client';
import { useQuery } from '@tanstack/react-query';

import { projectApi } from '@/api/projects';

export interface ProjectContextValue {
  teamName: string | undefined;
  projectName: string | undefined;
  project: ProjectDetailResp | undefined;
  projectId: number | undefined;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to get project context from URL teamName and projectName parameters
 * Uses project name in URL for user-friendly URLs, internally uses id for API calls
 */
export function useProjectContext(): ProjectContextValue {
  const { teamName, projectName } = useParams<{
    teamName: string;
    projectName: string;
  }>();

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['project', 'byName', projectName],
    queryFn: () => projectApi.getProjectByName(projectName ?? ''),
    enabled: !!projectName,
  });

  return {
    teamName,
    projectName,
    project,
    projectId: project?.id,
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Type for outlet context passed to child routes
 */
export interface ProjectOutletContext {
  project: ProjectDetailResp;
  projectId: number;
  teamName: string;
  projectName: string;
}
