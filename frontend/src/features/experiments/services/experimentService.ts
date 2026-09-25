import { httpClient } from '@/services/http';
import {
  Experiment,
  ExperimentStatus,
  CreateExperimentPayload,
  UpdateExperimentPayload,
  RecordExperimentConclusionPayload,
} from '../types';

export const experimentService = {
  async getExperiments(params?: { hypothesisId?: string; status?: ExperimentStatus }): Promise<Experiment[]> {
    return httpClient.get('/experiments', { params });
  },

  async getExperimentById(id: string): Promise<Experiment> {
    return httpClient.get(`/experiments/${id}`);
  },

  async createExperiment(payload: CreateExperimentPayload): Promise<Experiment> {
    return httpClient.post('/experiments', payload);
  },

  async updateExperiment(id: string, payload: UpdateExperimentPayload): Promise<Experiment> {
    return httpClient.put(`/experiments/${id}`, payload);
  },

  async updateStatus(id: string, status: ExperimentStatus): Promise<Experiment> {
    return httpClient.patch(`/experiments/${id}/status`, { status });
  },

  async recordConclusion(id: string, payload: RecordExperimentConclusionPayload): Promise<Experiment> {
    return httpClient.post(`/experiments/${id}/conclusion`, payload);
  },

  async deleteExperiment(id: string): Promise<void> {
    return httpClient.delete(`/experiments/${id}`);
  },
};
