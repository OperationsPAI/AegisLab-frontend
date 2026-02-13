/**
 * Fetch teams with automatic name→id cache updates
 */
import {
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';

import { teamApi } from '@/api/teams';
import type { ListTeamResp } from '@/types/api';
import { updateTeamNameMap } from '@/utils/teamNameMap';

interface UseTeamsOptions {
  queryKey?: string | string[];
}

/**
 * Fetch teams and auto-update name→id cache
 */
export function useTeams(
  options: UseTeamsOptions = {}
): UseQueryResult<ListTeamResp | undefined> {
  const queryClient = useQueryClient();
  const { queryKey } = options;

  const baseKey = queryKey
    ? Array.isArray(queryKey)
      ? queryKey
      : [queryKey]
    : ['teams'];

  return useQuery({
    queryKey: baseKey,
    queryFn: async () => {
      const data = await teamApi.getTeams();

      // Update name→id cache
      if (data?.items) {
        updateTeamNameMap(data.items, (key, value) => {
          queryClient.setQueryData(key, value);
        });
      }

      return data;
    },
  });
}
