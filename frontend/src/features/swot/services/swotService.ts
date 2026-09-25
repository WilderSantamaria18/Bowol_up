import { httpClient } from '@/services/http';
import {
  SwotAnalysis,
  GenerateSwotPayload,
  AddSwotItemPayload,
  UpdateSwotPayload,
  EvidenceRef,
} from '../types';

export const swotService = {
  async getLatestSwot(): Promise<SwotAnalysis> {
    return httpClient.get('/swot/latest');
  },

  async getSwotById(id: string): Promise<SwotAnalysis> {
    return httpClient.get(`/swot/${id}`);
  },

  async generateSwot(payload?: GenerateSwotPayload): Promise<SwotAnalysis> {
    return httpClient.post('/swot/generate', payload || {});
  },

  async updateSwot(id: string, payload: UpdateSwotPayload): Promise<SwotAnalysis> {
    return httpClient.patch(`/swot/${id}`, payload);
  },

  async addItem(id: string, payload: AddSwotItemPayload): Promise<SwotAnalysis> {
    return httpClient.post(`/swot/${id}/items`, payload);
  },

  async removeItem(id: string, itemId: string): Promise<SwotAnalysis> {
    return httpClient.delete(`/swot/${id}/items/${itemId}`);
  },

  async getEvidence(id: string): Promise<EvidenceRef[]> {
    return httpClient.get(`/swot/${id}/evidence`);
  },

  async deleteSwot(id: string): Promise<void> {
    return httpClient.delete(`/swot/${id}`);
  },
};
