/**
 * Resource API
 * Using @rcabench/client SDK
 */
import {
  type ListResourceReq,
  type ResourceResp,
  ResourcesApi,
} from '@rcabench/client';

import { createApiConfig } from './config';

export const resourceApi = {
  /**
   * Get resource list
   */
  getResources: async (params?: ListResourceReq) => {
    const api = new ResourcesApi(createApiConfig());
    const response = await api.listResources(params);
    return response.data.data;
  },

  /**
   * Get resource details
   */
  getResource: async (id: number) => {
    const api = new ResourcesApi(createApiConfig());
    const response = await api.getResourceById({ id });
    return response.data.data;
  },

  /**
   * Get permission list for resource
   */
  getResourcePermissions: async (id: number) => {
    const api = new ResourcesApi(createApiConfig());
    const response = await api.listResourcePermissions({ id });
    return response.data.data;
  },
};
