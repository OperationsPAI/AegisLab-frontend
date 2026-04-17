import { Configuration } from '@rcabench/client';

import apiClient from './client';

export const sdkConfig = new Configuration({
  basePath: '',
});

// Override the axios instance so SDK calls go through our interceptors
export { apiClient as sdkAxios };
