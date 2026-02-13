/**
 * Project name→id mapping cache utility
 */
import type { ProjectResp } from '@rcabench/client';

export interface ProjectNameMapEntry {
  id: number;
  name: string;
  cachedAt: number;
}

/**
 * Update name→id cache from project list
 */
export function updateProjectNameMap(
  projects: ProjectResp[] | undefined,
  setQueryData: (
    key: string[],
    data:
      | ProjectNameMapEntry
      | ((old: ProjectNameMapEntry | undefined) => ProjectNameMapEntry)
  ) => void
): void {
  if (!projects || projects.length === 0) return;

  const now = Date.now();
  projects.forEach((project) => {
    if (project.id && project.name) {
      setQueryData(['projectNameMap', project.name], {
        id: project.id,
        name: project.name,
        cachedAt: now,
      });
    }
  });
}

/**
 * Get project ID from cache (5min TTL)
 */
export function getProjectIdFromName(
  projectName: string | undefined,
  getQueryData: (key: string[]) => ProjectNameMapEntry | undefined
): number | undefined {
  if (!projectName) return undefined;

  const cached = getQueryData(['projectNameMap', projectName]);

  if (cached && Date.now() - cached.cachedAt < 5 * 60 * 1000) {
    return cached.id;
  }

  return undefined;
}
