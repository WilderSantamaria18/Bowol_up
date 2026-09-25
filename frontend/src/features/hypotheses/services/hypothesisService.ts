import { httpClient } from '@/services/http';
import {
  Hypothesis,
  HypothesisStatus,
  CreateHypothesisPayload,
  UpdateHypothesisPayload,
  RecordHypothesisResultPayload,
} from '../types';

export const hypothesisService = {
  async getHypotheses(params?: { opportunityId?: string; status?: HypothesisStatus }): Promise<Hypothesis[]> {
    return httpClient.get('/hypotheses', { params });
  },

  async getHypothesisById(id: string): Promise<Hypothesis> {
    return httpClient.get(`/hypotheses/${id}`);
  },

  async createHypothesis(payload: CreateHypothesisPayload): Promise<Hypothesis> {
    return httpClient.post('/hypotheses', payload);
  },

  async updateHypothesis(id: string, payload: UpdateHypothesisPayload): Promise<Hypothesis> {
    return httpClient.put(`/hypotheses/${id}`, payload);
  },

  async recordResult(id: string, payload: RecordHypothesisResultPayload): Promise<Hypothesis> {
    return httpClient.post(`/hypotheses/${id}/record-result`, payload);
  },

  async formulateFromOpportunity(opportunityId: string): Promise<Hypothesis> {
    return httpClient.post(`/hypotheses/formulate?opportunityId=${opportunityId}`);
  },

  async convertToProject(id: string): Promise<any> {
    return httpClient.post(`/hypotheses/${id}/convert-to-project`);
  },

  async deleteHypothesis(id: string): Promise<void> {
    return httpClient.delete(`/hypotheses/${id}`);
  },
};
