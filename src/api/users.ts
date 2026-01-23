/**
 * User Management API
 * Using @rcabench/client SDK
 */
import {
  type CreateUserReq,
  type ListUserResp,
  type StatusType,
  type UpdateUserReq,
  type UserDetailResp,
  type UserResp,
  UsersApi,
} from '@rcabench/client';

import { createApiConfig } from './config';

export const usersApi = {
  // ==================== SDK Methods ====================

  /**
   * Get user list - Using SDK
   */
  getUsers: async (params?: {
    page?: number;
    size?: number;
    username?: string;
    email?: string;
    isActive?: boolean;
    status?: StatusType;
  }): Promise<ListUserResp | undefined> => {
    const api = new UsersApi(createApiConfig());
    const response = await api.listUsers({
      page: params?.page,
      size: params?.size,
      username: params?.username,
      email: params?.email,
      isActive: params?.isActive,
      status: params?.status,
    });
    return response.data.data;
  },

  /**
   * Get user details - Using SDK
   */
  getUserDetail: async (id: number): Promise<UserDetailResp | undefined> => {
    const api = new UsersApi(createApiConfig());
    const response = await api.getUserById({ id });
    return response.data.data;
  },

  /**
   * Create user - Using SDK
   */
  createUser: async (data: CreateUserReq): Promise<UserResp | undefined> => {
    const api = new UsersApi(createApiConfig());
    const response = await api.createUser({ request: data });
    return response.data.data;
  },

  /**
   * Update user - Using SDK
   */
  updateUser: async (
    id: number,
    data: UpdateUserReq
  ): Promise<UserResp | undefined> => {
    const api = new UsersApi(createApiConfig());
    const response = await api.updateUser({ id, request: data });
    return response.data.data;
  },

  /**
   * Delete user - Using SDK
   */
  deleteUser: async (id: number): Promise<void> => {
    const api = new UsersApi(createApiConfig());
    await api.deleteUser({ id });
  },
};

// Re-export types for use in other files
export type {
  UserResp,
  UserDetailResp,
  ListUserResp,
  CreateUserReq,
  UpdateUserReq,
};
