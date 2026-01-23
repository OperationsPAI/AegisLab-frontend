/**
 * Role API
 * Using @rcabench/client SDK
 */
import {
  type AssignRolePermissionReq,
  type CreateRoleReq,
  type ListRoleReq,
  type RemoveRolePermissionReq,
  type RoleDetailResp,
  type RoleResp,
  RolesApi,
  type UpdateRoleReq,
} from '@rcabench/client';

import { createApiConfig } from './config';

export const roleApi = {
  /**
   * Get role list
   */
  getRoles: async (params?: ListRoleReq) => {
    const api = new RolesApi(createApiConfig());
    const response = await api.listRoles(params);
    return response.data.data;
  },

  /**
   * Get role details
   */
  getRole: async (id: number): Promise<RoleDetailResp | undefined> => {
    const api = new RolesApi(createApiConfig());
    const response = await api.getRoleById({ id });
    return response.data.data;
  },

  /**
   * Create role
   */
  createRole: async (data: CreateRoleReq): Promise<RoleResp | undefined> => {
    const api = new RolesApi(createApiConfig());
    const response = await api.createRole({ request: data });
    return response.data.data;
  },

  /**
   * Update role
   */
  updateRole: async (
    id: number,
    data: UpdateRoleReq
  ): Promise<RoleResp | undefined> => {
    const api = new RolesApi(createApiConfig());
    const response = await api.updateRole({ id, request: data });
    return response.data.data;
  },

  /**
   * Delete role
   */
  deleteRole: async (id: number) => {
    const api = new RolesApi(createApiConfig());
    await api.deleteRole({ id });
  },

  /**
   * Assign permissions to role
   */
  assignPermissions: async (roleId: number, data: AssignRolePermissionReq) => {
    const api = new RolesApi(createApiConfig());
    await api.grantPermissionsToRole({ roleId, request: data });
  },

  /**
   * Remove permissions from role
   */
  removePermissions: async (roleId: number, data: RemoveRolePermissionReq) => {
    const api = new RolesApi(createApiConfig());
    await api.revokePermissionsFromRole({ roleId, request: data });
  },
};
