/**
 * Hook to build a projectName → teamName lookup map.
 *
 * Because the /projects list endpoint does not include team information,
 * we fetch each team's detail (which contains its projects) and derive
 * the mapping from there.
 */
import { useMemo } from 'react';

import type { TeamDetailResp } from '@rcabench/client';
import { useQueries } from '@tanstack/react-query';

import { teamApi } from '@/api/teams';
import { useTeams } from '@/hooks/useTeams';

/**
 * Returns a Map<projectName, teamName> built from team details.
 * Both the teams list query and individual team detail queries are
 * cached by TanStack Query, so repeated renders are cheap.
 */
export function useProjectTeamMap(): Map<string, string> {
  const { data: teamsData } = useTeams({ queryKey: ['teams', 'project-map'] });

  const teams = useMemo(() => teamsData?.items || [], [teamsData?.items]);

  // Fetch detail for each team (includes its projects list)
  const teamDetailQueries = useQueries({
    queries: teams.map((team) => ({
      queryKey: ['team', 'detail', team.id],
      queryFn: () => teamApi.getTeamDetail(team.id ?? 0),
      enabled: !!team.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  const detailsFingerprint = teamDetailQueries
    .map((q) => q.dataUpdatedAt)
    .join(',');

  return useMemo(() => {
    const map = new Map<string, string>();
    for (const query of teamDetailQueries) {
      const detail = query.data as TeamDetailResp | undefined;
      if (!detail?.name || !detail.projects) continue;
      for (const project of detail.projects) {
        if (project.name) {
          map.set(project.name, detail.name);
        }
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailsFingerprint]);
}
