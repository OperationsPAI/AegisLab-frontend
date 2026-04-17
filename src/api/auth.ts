import type {
  LoginReq,
  LoginResp,
  RegisterReq,
  UserDetailResp,
  UserInfo,
} from '@rcabench/client';

import apiClient from './client';

export const authApi = {
  login: (data: LoginReq): Promise<LoginResp | undefined> =>
    apiClient.post('/auth/login', data).then((r) => r.data.data),

  register: (data: RegisterReq): Promise<UserInfo | undefined> =>
    apiClient.post('/auth/register', data).then((r) => r.data.data),

  logout: () => apiClient.post('/auth/logout').then((r) => r.data),

  getProfile: (): Promise<UserDetailResp> =>
    apiClient
      .get<{ data: UserDetailResp }>('/auth/profile')
      .then((r) => r.data.data),

  changePassword: (data: { old_password: string; new_password: string }) =>
    apiClient.post('/auth/change-password', data).then((r) => r.data),

  refreshToken: (
    token: string
  ): Promise<{ token: string; refresh_token?: string }> =>
    apiClient.post('/auth/refresh', { token }).then((r) => r.data.data),
};
