/**
 * Get team context from URL params with name→id cache optimization
 */
import { useParams } from 'react-router-dom';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { teamApi } from '@/api/teams';
import type { Team, TeamMember } from '@/types/api';
import { getTeamIdFromName } from '@/utils/teamNameMap';

export interface TeamContextValue {
  teamName: string | undefined;
  team: Team | null | undefined;
  teamID: number | undefined;
  members: TeamMember[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Get team context from URL params
 * Uses cached name→id mapping to optimize API calls
 */
export function useTeamContext(): TeamContextValue {
  const { teamName } = useParams<{ teamName: string }>();
  const queryClient = useQueryClient();

  const cachedTeamID = getTeamIdFromName(teamName, (key) =>
    queryClient.getQueryData(key)
  );

  // Use getTeamDetail(id) if cached, otherwise fetch all teams
  const {
    data: teamsData,
    isLoading: isTeamsLoading,
    error: teamsError,
  } = useQuery({
    queryKey: ['teams', 'list'],
    queryFn: () => teamApi.getTeams(),
    enabled: !!teamName && !cachedTeamID,
  });

  const matchedTeam = teamsData?.items?.find((t) => t.name === teamName);
  const teamID = cachedTeamID || matchedTeam?.id;

  const {
    data: teamDetail,
    isLoading: isTeamLoading,
    error: teamError,
  } = useQuery({
    queryKey: ['team', 'detail', teamID],
    queryFn: () => {
      if (!teamID) throw new Error('Team ID is required');
      return teamApi.getTeamDetail(teamID);
    },
    enabled: !!teamID,
  });

  // Construct Team object from API responses
  const team: Team | null | undefined = teamDetail
    ? {
        id: teamDetail.id ?? 0,
        name: teamDetail.name ?? '',
        display_name: teamDetail.name,
        description: teamDetail.description,
        avatar_url: undefined,
        created_at: teamDetail.created_at ?? '',
        updated_at: teamDetail.updated_at ?? '',
        member_count: teamDetail.user_count ?? 0,
        project_count: teamDetail.project_count ?? 0,
        settings: undefined,
      }
    : undefined;

  return {
    teamName,
    team,
    teamID,
    members: [],
    isLoading: isTeamsLoading || isTeamLoading,
    error: (teamsError || teamError) as Error | null,
  };
}

/**
 * Type for outlet context passed to child routes
 */
export interface TeamOutletContext {
  team: Team;
  teamId: number;
  teamName: string;
  members: TeamMember[];
}
