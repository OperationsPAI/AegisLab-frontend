/**
 * Permission API
 * Using @rcabench/client SDK
 */
import {
  type CreatePermissionReq,
  type ListPermissionReq,
  type PermissionDetailResp,
  type PermissionResp,
  PermissionsApi,
  type UpdatePermissionReq,
} from '@rcabench/client';

import { createApiConfig } from './config';

export const permissionApi = {
  /**
   * Get permission list
   */
  getPermissions: async (params?: ListPermissionReq) => {
    const api = new PermissionsApi(createApiConfig());
    const response = await api.listPermissions(params);
    return response.data.data;
  },

  /**
   * Get permission details
   */
  getPermission: async (
    id: number
  ): Promise<PermissionDetailResp | undefined> => {
    const api = new PermissionsApi(createApiConfig());
    const response = await api.getPermissionById({ id });
    return response.data.data;
  },

  /**
   * Create permission
   */
  createPermission: async (
    data: CreatePermissionReq
  ): Promise<PermissionResp | undefined> => {
    const api = new PermissionsApi(createApiConfig());
    const response = await api.createPermission({ request: data });
    return response.data.data;
  },

  /**
   * Update permission
   */
  updatePermission: async (
    id: number,
    data: UpdatePermissionReq
  ): Promise<PermissionResp | undefined> => {
    const api = new PermissionsApi(createApiConfig());
    const response = await api.updatePermission({ id, request: data });
    return response.data.data;
  },

  /**
   * Delete permission
   */
  deletePermission: async (id: number) => {
    const api = new PermissionsApi(createApiConfig());
    await api.deletePermission({ id });
  },

  /**
   * Get associated role list for permission
   */
  getPermissionRoles: async (permissionId: number) => {
    const api = new PermissionsApi(createApiConfig());
    const response = await api.listRolesFromPermission({ permissionId });
    return response.data.data;
  },
};
