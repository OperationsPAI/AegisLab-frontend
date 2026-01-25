/**
 * Teams API
 * Handles team-related operations
 * Uses mock data until backend API is available
 */
import type {
  ExecutionResp,
  ProjectWithStats,
  Team,
  TeamLink,
  TeamMember,
  TeamRole,
  TeamSecret,
} from '@/types/api';

// Mock data
const mockTeams: Team[] = [
  {
    id: 1,
    name: 'cuhkse',
    display_name: 'cuhkse',
    description: `# Team README

## Welcome to cuhkse

Briefly describe what your team works on and its mission.

## Getting started

1. First step for new team members
2. How to set up your environment
3. Where to find documentation

## Communication

1. Slack channels: #team-channel
2. Meeting schedule: Weekly on Thursdays at 10am

## Key resources

1. Link to documentation: [Team Wiki](url)
2. Important tools: [Dashboard](url)`,
    avatar_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z',
    member_count: 2,
    project_count: 8,
    settings: {
      customization_enabled: true,
      ttl_permissions: 'members',
    },
  },
];

const mockMembers: TeamMember[] = [
  {
    id: 1,
    user_id: 1,
    team_id: 1,
    role: 'admin',
    joined_at: '2024-01-01T00:00:00Z',
    user: {
      id: 1,
      username: 'rainysteven1',
      display_name: 'Rainy Steven',
      email: 'rainysteven1@gmail.com',
      avatar_url: undefined,
    },
  },
  {
    id: 2,
    user_id: 2,
    team_id: 1,
    role: 'admin',
    joined_at: '2024-01-15T00:00:00Z',
    user: {
      id: 2,
      username: '814750204',
      display_name: 'Aoyang Fang',
      email: '814750204@qq.com',
      avatar_url: undefined,
    },
  },
];

const mockProjects: ProjectWithStats[] = [
  {
    id: 1,
    name: 'test',
    description: 'Test project',
    visibility: 'team',
    run_count: 0,
    last_run_at: undefined,
    is_starred: false,
  },
  {
    id: 2,
    name: 'AgentLightning',
    description: 'Agent Lightning project',
    visibility: 'team',
    run_count: 33,
    last_run_at: '2025-11-03T00:00:00Z',
    is_starred: true,
  },
  {
    id: 3,
    name: 'rcagent',
    description: 'RC Agent project',
    visibility: 'team',
    run_count: 14,
    last_run_at: '2025-11-05T00:00:00Z',
    is_starred: false,
  },
  {
    id: 4,
    name: 'eadro-training',
    description: 'EADRO Training',
    visibility: 'team',
    run_count: 126,
    last_run_at: '2025-06-27T00:00:00Z',
    is_starred: false,
  },
  {
    id: 5,
    name: 'multimodal-medicine',
    description: 'Multimodal Medicine',
    visibility: 'team',
    run_count: 26,
    last_run_at: '2025-06-18T00:00:00Z',
    is_starred: false,
  },
  {
    id: 6,
    name: 'genetic-fuzzing',
    description: 'Genetic Fuzzing',
    visibility: 'team',
    run_count: 41,
    last_run_at: '2025-07-23T00:00:00Z',
    is_starred: false,
  },
  {
    id: 7,
    name: 'pandora-ga',
    description: 'Pandora GA',
    visibility: 'team',
    run_count: 233,
    last_run_at: '2025-05-16T00:00:00Z',
    is_starred: false,
  },
  {
    id: 8,
    name: 'huggingface',
    description: 'HuggingFace integration',
    visibility: 'team',
    run_count: 1,
    last_run_at: '2023-09-03T00:00:00Z',
    is_starred: false,
  },
];

const mockRuns: ExecutionResp[] = [
  {
    id: 1,
    name: 'rcagent',
    project_id: 3,
    project_name: 'rcagent',
    state: 'completed',
    created_at: '2024-10-15T00:00:00Z',
    user_name: '814750204',
  },
  {
    id: 2,
    name: 'training-run-1',
    project_id: 4,
    project_name: 'eadro-training',
    state: 'completed',
    created_at: '2024-10-14T00:00:00Z',
    user_name: 'rainysteven1',
  },
  {
    id: 3,
    name: 'agent-test',
    project_id: 2,
    project_name: 'AgentLightning',
    state: 'running',
    created_at: '2024-10-13T00:00:00Z',
    user_name: '814750204',
  },
];

const mockSecrets: TeamSecret[] = [];

const mockLinks: TeamLink[] = [];

export const teamApi = {
  /**
   * Get all teams for the current user
   */
  getTeams: async (): Promise<Team[]> => {
    // TODO: Replace with actual API call
    // GET /api/v2/teams
    return mockTeams;
  },

  /**
   * Get a team by name
   */
  getTeamByName: async (name: string): Promise<Team | null> => {
    // TODO: Replace with actual API call
    // GET /api/v2/teams/:name
    const team = mockTeams.find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
    return team || null;
  },

  /**
   * Get team members
   */
  getTeamMembers: async (teamId: number): Promise<TeamMember[]> => {
    // TODO: Replace with actual API call
    // GET /api/v2/teams/:id/members
    return mockMembers.filter((m) => m.team_id === teamId);
  },

  /**
   * Get team projects
   */
  getTeamProjects: async (
    _teamId: number,
    params?: { page?: number; size?: number; search?: string }
  ): Promise<{ items: ProjectWithStats[]; total: number }> => {
    // TODO: Replace with actual API call
    // GET /api/v2/teams/:id/projects
    let items = [...mockProjects];

    // Filter by search
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const page = params?.page || 1;
    const size = params?.size || 10;
    const start = (page - 1) * size;
    const paginatedItems = items.slice(start, start + size);

    return {
      items: paginatedItems,
      total: items.length,
    };
  },

  /**
   * Get team runs (executions)
   */
  getTeamRuns: async (
    _teamId: number,
    params?: { page?: number; size?: number; search?: string }
  ): Promise<{ items: ExecutionResp[]; total: number }> => {
    // TODO: Replace with actual API call
    // GET /api/v2/teams/:id/runs
    let items = [...mockRuns];

    // Filter by search
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(searchLower) ||
          r.project_name?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const page = params?.page || 1;
    const size = params?.size || 10;
    const start = (page - 1) * size;
    const paginatedItems = items.slice(start, start + size);

    return {
      items: paginatedItems,
      total: items.length,
    };
  },

  /**
   * Invite a new member to the team
   */
  inviteMember: async (
    _teamId: number,
    _data: { email: string; role: TeamRole }
  ): Promise<void> => {
    // TODO: Replace with actual API call
    // POST /api/v2/teams/:id/members/invite
  },

  /**
   * Remove a member from the team
   */
  removeMember: async (_teamId: number, _memberId: number): Promise<void> => {
    // TODO: Replace with actual API call
    // DELETE /api/v2/teams/:id/members/:memberId
  },

  /**
   * Update member role
   */
  updateMemberRole: async (
    _teamId: number,
    _memberId: number,
    _role: TeamRole
  ): Promise<void> => {
    // TODO: Replace with actual API call
    // PATCH /api/v2/teams/:id/members/:memberId
  },

  /**
   * Update team settings
   */
  updateTeamSettings: async (
    _teamId: number,
    _settings: Partial<Team['settings']>
  ): Promise<void> => {
    // TODO: Replace with actual API call
    // PATCH /api/v2/teams/:id/settings
  },

  /**
   * Update team description/README
   */
  updateTeamDescription: async (
    _teamId: number,
    _description: string
  ): Promise<void> => {
    // TODO: Replace with actual API call
    // PATCH /api/v2/teams/:id
  },

  /**
   * Delete team
   */
  deleteTeam: async (_teamId: number): Promise<void> => {
    // TODO: Replace with actual API call
    // DELETE /api/v2/teams/:id
  },

  /**
   * Get team secrets
   */
  getSecrets: async (_teamId: number): Promise<TeamSecret[]> => {
    // TODO: Replace with actual API call
    // GET /api/v2/teams/:id/secrets
    return mockSecrets;
  },

  /**
   * Add a secret
   */
  addSecret: async (
    _teamId: number,
    _data: { name: string; value: string }
  ): Promise<void> => {
    // TODO: Replace with actual API call
    // POST /api/v2/teams/:id/secrets
  },

  /**
   * Delete a secret
   */
  deleteSecret: async (_teamId: number, _secretId: number): Promise<void> => {
    // TODO: Replace with actual API call
    // DELETE /api/v2/teams/:id/secrets/:secretId
  },

  /**
   * Get team links
   */
  getLinks: async (_teamId: number): Promise<TeamLink[]> => {
    // TODO: Replace with actual API call
    // GET /api/v2/teams/:id/links
    return mockLinks;
  },

  /**
   * Add a link
   */
  addLink: async (
    _teamId: number,
    _data: { title: string; url: string }
  ): Promise<void> => {
    // TODO: Replace with actual API call
    // POST /api/v2/teams/:id/links
  },

  /**
   * Delete a link
   */
  deleteLink: async (_teamId: number, _linkId: number): Promise<void> => {
    // TODO: Replace with actual API call
    // DELETE /api/v2/teams/:id/links/:linkId
  },
};
