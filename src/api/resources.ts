import apiClient from './client';

export const resourceApi = {
  getResources: (params?: { page?: number; size?: number }) =>
    apiClient.get('/resources', { params }).then((r) => r.data.data),

  getResource: (id: number) =>
    apiClient.get(`/resources/${id}`).then((r) => r.data.data),

  getResourcePermissions: (id: number) =>
    apiClient.get(`/resources/${id}/permissions`).then((r) => r.data.data),
};
