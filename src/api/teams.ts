/**
 * Teams API
 * Handles team-related operations
 * Uses mock data until backend API is available
 */
import {
  type ListTeamResp,
  type StatusType,
  type TeamDetailResp,
  type TeamMemberResp,
  TeamsApi,
} from '@rcabench/client';

import type { ExecutionResp, ProjectResp, Team } from '@/types/api';

import { createApiConfig } from './config';

export const teamApi = {
  /**
   * Get all teams for the current user
   *
   */
  getTeams: async (params?: {
    page?: number;
    size?: number;
    isPublic?: boolean;
    status?: StatusType;
  }): Promise<ListTeamResp | undefined> => {
    // GET /api/v2/teams
    const api = new TeamsApi(createApiConfig());
    const response = await api.listTeams({
      page: params?.page,
      size: params?.size,
      isPublic: params?.isPublic,
      status: params?.status,
    });
    return response.data.data;
  },

  /**
   * Get a team detail by id
   */
  getTeamDetail: async (id: number): Promise<TeamDetailResp | undefined> => {
    // GET /api/v2/teams/:name
    const api = new TeamsApi(createApiConfig());
    const response = await api.getTeamById({
      teamId: id,
    });
    return response.data.data;
  },

  /**
   * Get team members
   */
  getTeamMembers: async (
    teamId: number,
    params?: { page?: number; size?: number }
  ): Promise<{ items: TeamMemberResp[]; total: number }> => {
    // GET /api/v2/teams/:id/members
    const api = new TeamsApi(createApiConfig());
    const response = await api.listTeamMembers({
      teamId,
      page: params?.page,
      size: params?.size,
    });
    return {
      items: response.data.data?.items || [],
      total: response.data.data?.pagination?.total || 0,
    };
  },

  /**
   * List team projects
   */
  listTeamProjects: async (
    teamId: number,
    params?: { page?: number; size?: number }
  ): Promise<{ items: ProjectResp[]; total: number }> => {
    // GET /api/v2/teams/:id/projects
    const api = new TeamsApi(createApiConfig());
    const response = await api.listTeamProjects({
      teamId,
      ...params,
    });
    return {
      items: response.data.data?.items || [],
      total: response.data.data?.pagination?.total || 0,
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
    const items: ExecutionResp[] = [];

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
    _data: { email: string; role_id: number }
  ): Promise<void> => {
    // POST /api/v2/teams/:id/members/invite
    // const api = new TeamsApi(createApiConfig());
    // const response = await api.addTeamMember({
    //   teamId: _teamId,
    //   inviteTeamMemberRequest: {
    //     email: _data.email,
    //     role: _data.role,
    //   },
    // });
    // return response.data;
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
    _userId: number,
    _roleId: number
  ): Promise<void> => {
    // TODO: Replace with actual API call
    // PATCH /api/v2/teams/:id/members/:userId
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
};
