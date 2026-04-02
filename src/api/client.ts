import { message } from 'antd';
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

const BASE_PATH = '/api/v2';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_PATH,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${BASE_PATH}/auth/refresh`, {
            token: refreshToken,
          });
          const { token } = response.data;
          localStorage.setItem('access_token', token);
          localStorage.setItem('refresh_token', token);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    const errorMessage =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Request failed';
    message.error(errorMessage);
    return Promise.reject(error);
  }
);

// Helper for file downloads
export const fileClient: AxiosInstance = axios.create({
  baseURL: BASE_PATH,
  timeout: 60000,
  responseType: 'blob',
});
fileClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for Arrow IPC data
export const arrowClient: AxiosInstance = axios.create({
  baseURL: BASE_PATH,
  timeout: 60000,
  responseType: 'arraybuffer',
});
arrowClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
