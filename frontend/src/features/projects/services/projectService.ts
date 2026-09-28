import { httpClient } from '@/services/http';
import {
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectStatus,
  Sprint,
  CreateSprintPayload,
  ProjectMember,
  AddProjectMemberPayload,
  DecomposeProjectResponse,
} from '../types';

export const projectService = {
  async getProjects(status?: ProjectStatus): Promise<{ items: Project[]; totalElements: number }> {
    const params = status ? `?status=${status}` : '';
    return httpClient.get(`/projects${params}`);
  },

  async getProjectById(id: string): Promise<Project> {
    return httpClient.get(`/projects/${id}`);
  },

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    return httpClient.post('/projects', payload);
  },

  async updateProject(id: string, payload: UpdateProjectPayload): Promise<Project> {
    return httpClient.patch(`/projects/${id}`, payload);
  },

  async deleteProject(id: string): Promise<void> {
    return httpClient.delete(`/projects/${id}`);
  },

  async getProjectSprints(projectId: string): Promise<Sprint[]> {
    return httpClient.get(`/projects/${projectId}/sprints`);
  },

  async createSprint(projectId: string, payload: CreateSprintPayload): Promise<Sprint> {
    return httpClient.post(`/projects/${projectId}/sprints`, payload);
  },

  async decomposeProject(projectId: string): Promise<DecomposeProjectResponse> {
    return httpClient.post(`/projects/${projectId}/decompose`);
  },

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return httpClient.get(`/projects/${projectId}/members`);
  },

  async addProjectMember(projectId: string, payload: AddProjectMemberPayload): Promise<ProjectMember> {
    return httpClient.post(`/projects/${projectId}/members`, payload);
  },

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    return httpClient.delete(`/projects/${projectId}/members/${userId}`);
  },

  async getProjectVelocity(projectId: string): Promise<any> {
    return httpClient.get(`/projects/${projectId}/velocity`);
  },
};
