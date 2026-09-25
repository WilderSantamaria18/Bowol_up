import { httpClient } from '@/services/http';
import {
  Opportunity,
  OpportunityBoard,
  OpportunityStatus,
  CreateOpportunityPayload,
  UpdateOpportunityPayload,
  OpportunitiesFromSwotResponse,
} from '../types';

export const opportunityService = {
  async getBoard(): Promise<OpportunityBoard> {
    return httpClient.get('/opportunities/board');
  },

  async getOpportunityById(id: string): Promise<Opportunity> {
    return httpClient.get(`/opportunities/${id}`);
  },

  async generateFromSwot(swotId: string): Promise<OpportunitiesFromSwotResponse> {
    return httpClient.post(`/opportunities/from-swot/${swotId}`);
  },

  async createOpportunity(payload: CreateOpportunityPayload): Promise<Opportunity> {
    return httpClient.post('/opportunities', payload);
  },

  async updateOpportunity(id: string, payload: UpdateOpportunityPayload): Promise<Opportunity> {
    return httpClient.patch(`/opportunities/${id}`, payload);
  },

  async updateStatus(id: string, status: OpportunityStatus): Promise<Opportunity> {
    return httpClient.patch(`/opportunities/${id}/status`, { status });
  },

  async deleteOpportunity(id: string): Promise<void> {
    return httpClient.delete(`/opportunities/${id}`);
  },

  async convertToProject(id: string): Promise<any> {
    return httpClient.post(`/opportunities/${id}/convert-to-project`);
  },
};
