/**
 * Centralized API configuration
 * All API modules share this configuration to avoid code duplication
 */
import { Configuration } from '@rcabench/client';
import { message } from 'antd';
import axios, { type AxiosRequestConfig } from 'axios';

export const createApiConfig = (): Configuration => {
  const token = localStorage.getItem('access_token');

  return new Configuration({
    basePath: '',
    apiKey: token ? `Bearer ${token}` : undefined,
    baseOptions: {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    } as AxiosRequestConfig,
  });
};

/**
 * File download API configuration
 * Configured with responseType: 'blob' for file downloads
 */
export const createFileApiConfig = (): Configuration => {
  const token = localStorage.getItem('access_token');

  return new Configuration({
    basePath: '',
    apiKey: token ? `Bearer ${token}` : undefined,
    baseOptions: {
      timeout: 60000, // Longer timeout for file downloads
      responseType: 'blob',
    } as AxiosRequestConfig,
  });
};

/**
 * Arrow IPC Stream API configuration
 * Configured with responseType: 'arraybuffer' for Arrow binary data
 */
export const createArrowApiConfig = (): Configuration => {
  const token = localStorage.getItem('access_token');

  return new Configuration({
    basePath: '',
    apiKey: token ? `Bearer ${token}` : undefined,
    baseOptions: {
      timeout: 60000, // Longer timeout for Arrow data
      responseType: 'arraybuffer',
    } as AxiosRequestConfig,
  });
};

/**
 * Shared Axios instance
 * For manual API calls missing from SDK
 */
export const apiClient = axios.create({
  baseURL: '/api/v2',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 and error messages
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as {
      _retry?: boolean;
      headers?: Record<string, string>;
    };

    // Handle 401 - Attempt to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await apiClient.post('/auth/refresh', {
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
        // Refresh failed, redirect to login page
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Request failed';

    message.error(errorMessage);
    return Promise.reject(error);
  }
);

export default apiClient;
