/**
 * Get project context from URL params with name→id cache optimization
 */
import { useParams } from 'react-router-dom';

import type { ProjectDetailResp } from '@rcabench/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { projectApi } from '@/api/projects';
import { getProjectIdFromName } from '@/utils/projectNameMap';

export interface ProjectContextValue {
  teamName: string | undefined;
  projectName: string | undefined;
  project: ProjectDetailResp | undefined;
  projectId: number | undefined;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Get project context from URL params
 * Uses cached name→id mapping to optimize API calls
 */
export function useProjectContext(): ProjectContextValue {
  const { teamName, projectName } = useParams<{
    teamName: string;
    projectName: string;
  }>();

  const queryClient = useQueryClient();

  const cachedProjectId = getProjectIdFromName(projectName, (key) =>
    queryClient.getQueryData(key)
  );

  // Use getProjects() if not cached, to find project by name
  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ['projects', 'list'],
    queryFn: () => projectApi.getProjects(),
    enabled: !!projectName && !cachedProjectId,
  });

  const matchedProject = projectsData?.items?.find(
    (p) => p.name === projectName
  );
  const projectId = cachedProjectId || matchedProject?.id;

  // Use getProject(id) to get details
  const {
    data: project,
    isLoading: isProjectLoading,
    error: projectError,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => {
      if (!projectId) throw new Error('Project ID is required');
      return projectApi.getProjectDetail(projectId);
    },
    enabled: !!projectId,
  });

  return {
    teamName,
    projectName,
    project,
    projectId: project?.id,
    isLoading: isProjectsLoading || isProjectLoading,
    error: (projectsError || projectError) as Error | null,
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
