/**
 * Label API
 * Using @rcabench/client SDK
 */
import {
  type BatchDeleteLabelReq,
  type CreateLabelReq,
  type LabelDetailResp,
  type LabelResp,
  LabelsApi,
  type LabelsApiListLabelsRequest as ListLabelReq,
  type UpdateLabelReq,
} from '@rcabench/client';

import { createApiConfig } from './config';

export const labelApi = {
  /**
   * Get label list
   */
  getLabels: async (params?: ListLabelReq) => {
    const api = new LabelsApi(createApiConfig());
    const response = await api.listLabels(params);
    return response.data.data;
  },

  /**
   * Get label details
   */
  getLabel: async (labelId: number): Promise<LabelDetailResp | undefined> => {
    const api = new LabelsApi(createApiConfig());
    const response = await api.getLabelById({ labelId });
    return response.data.data;
  },

  /**
   * Create label
   */
  createLabel: async (data: CreateLabelReq): Promise<LabelResp | undefined> => {
    const api = new LabelsApi(createApiConfig());
    const response = await api.createLabel({ request: data });
    return response.data.data;
  },

  /**
   * Update label
   */
  updateLabel: async (
    labelId: number,
    data: UpdateLabelReq
  ): Promise<LabelResp | undefined> => {
    const api = new LabelsApi(createApiConfig());
    const response = await api.updateLabel({ labelId, request: data });
    return response.data.data;
  },

  /**
   * Delete label
   */
  deleteLabel: async (labelId: number) => {
    const api = new LabelsApi(createApiConfig());
    await api.deleteLabel({ labelId });
  },

  /**
   * Batch delete labels
   */
  batchDeleteLabels: async (data: BatchDeleteLabelReq) => {
    const api = new LabelsApi(createApiConfig());
    await api.batchDeleteLabels({ request: data });
  },
};
