import { httpClient } from '@/services/http';
import {
  Sprint,
  SprintStatus,
  CreateSprintPayload,
  UpdateSprintPayload,
  CompleteSprintPayload,
  SprintBurndownResponse,
  SprintMetricsResponse,
  ProjectVelocityResponse,
} from '../types';

export const sprintService = {
  async getSprintsByProject(projectId: string, status?: SprintStatus): Promise<Sprint[]> {
    return httpClient.get(`/projects/${projectId}/sprints`, {
      params: status ? { status } : undefined,
    });
  },

  async getSprintById(id: string): Promise<Sprint> {
    return httpClient.get(`/sprints/${id}`);
  },

  async createSprint(projectId: string, payload: CreateSprintPayload): Promise<Sprint> {
    return httpClient.post(`/projects/${projectId}/sprints`, payload);
  },

  async updateSprint(id: string, payload: UpdateSprintPayload): Promise<Sprint> {
    return httpClient.patch(`/sprints/${id}`, payload);
  },

  async startSprint(id: string): Promise<Sprint> {
    return httpClient.patch(`/sprints/${id}/start`);
  },

  async completeSprint(id: string, payload?: CompleteSprintPayload): Promise<Sprint> {
    return httpClient.patch(`/sprints/${id}/complete`, payload);
  },

  async cancelSprint(id: string): Promise<Sprint> {
    return httpClient.patch(`/sprints/${id}/cancel`);
  },

  async deleteSprint(id: string): Promise<void> {
    return httpClient.delete(`/sprints/${id}`);
  },

  async getSprintBurndown(id: string): Promise<SprintBurndownResponse> {
    return httpClient.get(`/sprints/${id}/burndown`);
  },

  async getSprintMetrics(id: string): Promise<SprintMetricsResponse> {
    return httpClient.get(`/sprints/${id}/metrics`);
  },

  async getProjectVelocity(projectId: string): Promise<ProjectVelocityResponse> {
    return httpClient.get(`/projects/${projectId}/velocity`);
  },

  async planSprintWithAi(projectId: string): Promise<import('../types').AiSprintPlanResponse> {
    return httpClient.post(`/projects/${projectId}/sprints/ai-plan`);
  },
};
