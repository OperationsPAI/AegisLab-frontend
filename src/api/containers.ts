/**
 * Container API
 * Using @rcabench/client SDK, manually implementing missing endpoints
 */
import {
  type ContainerDetailResp,
  type ContainerResp,
  ContainersApi,
  type ContainerType,
  type ContainerVersionResp,
  type CreateContainerReq,
  type CreateContainerVersionReq,
  type LabelItem,
  type ListContainerResp,
  type ListContainerVersionResp,
  type StatusType,
} from '@rcabench/client';

import { apiClient, createApiConfig } from './config';

export const containerApi = {
  // ==================== SDK Methods ====================

  /**
   * Get container list - Using SDK
   */
  getContainers: async (params?: {
    page?: number;
    size?: number;
    type?: ContainerType;
    isPublic?: boolean;
    status?: StatusType;
  }): Promise<ListContainerResp> => {
    const api = new ContainersApi(createApiConfig());
    const response = await api.listContainers({
      page: params?.page,
      size: params?.size,
      type: params?.type,
      isPublic: params?.isPublic,
      status: params?.status,
    });
    return response.data.data!;
  },

  /**
   * Get container details - Using SDK
   */
  getContainer: async (id: number): Promise<ContainerDetailResp> => {
    const api = new ContainersApi(createApiConfig());
    const response = await api.getContainerById({ containerId: id });
    return response.data.data!;
  },

  /**
   * Create container - Using SDK
   */
  createContainer: async (data: {
    name: string;
    type: ContainerType;
    readme?: string;
    is_public?: boolean;
  }): Promise<ContainerResp | undefined> => {
    const api = new ContainersApi(createApiConfig());
    const request: CreateContainerReq = {
      name: data.name,
      type: data.type,
      readme: data.readme,
      is_public: data.is_public,
    };
    const response = await api.createContainer({ request });
    return response.data.data;
  },

  /**
   * Get container version list - Using SDK
   */
  getVersions: async (
    containerId: number,
    params?: { page?: number; size?: number; status?: StatusType }
  ): Promise<ListContainerVersionResp> => {
    const api = new ContainersApi(createApiConfig());
    const response = await api.listContainerVersions({
      containerId,
      page: params?.page,
      size: params?.size,
      status: params?.status,
    });
    return response.data.data!;
  },

  /**
   * Create container version - Using SDK
   * Note: SDK uses image_ref format, e.g., "registry/repository:tag"
   */
  createVersion: async (
    containerId: number,
    data: {
      name: string;
      image_ref: string;
      command?: string;
    }
  ): Promise<ContainerVersionResp | undefined> => {
    const api = new ContainersApi(createApiConfig());
    const request: CreateContainerVersionReq = {
      name: data.name,
      image_ref: data.image_ref,
      command: data.command,
    };
    const response = await api.createContainerVersion({
      containerId,
      request,
    });
    return response.data.data;
  },

  // ==================== Manual Implementation (SDK Missing) ====================

  /**
   * Update container - Manual implementation (SDK missing)
   */
  updateContainer: (
    id: number,
    data: {
      name?: string;
      type?: ContainerType;
      readme?: string;
      is_public?: boolean;
      labels?: LabelItem[];
    }
  ) =>
    apiClient.patch<{ data: ContainerDetailResp }>(`/containers/${id}`, data),

  /**
   * Delete container - Manual implementation (SDK missing)
   */
  deleteContainer: (id: number) => apiClient.delete(`/containers/${id}`),

  /**
   * Update container version - Manual implementation (SDK missing)
   */
  updateVersion: (
    containerId: number,
    versionId: number,
    data: {
      name?: string;
      image_ref?: string;
      command?: string;
    }
  ) =>
    apiClient.patch<{ data: ContainerVersionResp }>(
      `/containers/${containerId}/versions/${versionId}`,
      data
    ),

  /**
   * Delete container version - Manual implementation (SDK missing)
   */
  deleteVersion: (containerId: number, versionId: number) =>
    apiClient.delete(`/containers/${containerId}/versions/${versionId}`),
};
