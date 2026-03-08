import { type TraceDetailResp, TracesApi } from '@rcabench/client';

import { createApiConfig } from './config';

export const traceApi = {
  /**
   * Get trace details
   */
  getTrace: async (traceId: string): Promise<TraceDetailResp | undefined> => {
    const api = new TracesApi(createApiConfig());
    const response = await api.getTraceById({ traceId });
    return response.data.data;
  },
};
