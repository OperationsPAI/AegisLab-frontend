/**
 * Team Context Hook
 * Get team information from URL teamName parameter
 */
import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { teamApi } from '@/api/teams';
import type { Team, TeamMember } from '@/types/api';

export interface TeamContextValue {
  teamName: string | undefined;
  team: Team | null | undefined;
  teamId: number | undefined;
  members: TeamMember[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to get team context from URL teamName parameter
 * Uses team name in URL for user-friendly URLs
 */
export function useTeamContext(): TeamContextValue {
  const { teamName } = useParams<{ teamName: string }>();

  const {
    data: team,
    isLoading: isTeamLoading,
    error: teamError,
  } = useQuery({
    queryKey: ['team', 'byName', teamName],
    queryFn: () => teamApi.getTeamByName(teamName ?? ''),
    enabled: !!teamName,
  });

  const { data: members = [], isLoading: isMembersLoading } = useQuery({
    queryKey: ['team', 'members', team?.id],
    queryFn: () => {
      if (!team?.id) throw new Error('Team ID is required');
      return teamApi.getTeamMembers(team.id);
    },
    enabled: !!team?.id,
  });

  return {
    teamName,
    team,
    teamId: team?.id,
    members,
    isLoading: isTeamLoading || isMembersLoading,
    error: teamError as Error | null,
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
