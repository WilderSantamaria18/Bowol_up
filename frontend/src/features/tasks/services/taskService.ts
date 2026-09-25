import { httpClient } from '@/services/http';
import {
  Task,
  TaskBoardData,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskStatus,
  TaskMoveItem,
  DecomposeProjectResponse,
} from '../types';

export const taskService = {
  async getTasks(projectId: string, sprintId?: string, status?: TaskStatus): Promise<Task[]> {
    const params = new URLSearchParams({ projectId });
    if (sprintId) params.append('sprintId', sprintId);
    if (status) params.append('status', status);
    return httpClient.get(`/tasks?${params.toString()}`);
  },

  async getBoard(projectId: string, sprintId?: string): Promise<TaskBoardData> {
    const params = new URLSearchParams({ projectId });
    if (sprintId) params.append('sprintId', sprintId);
    return httpClient.get(`/tasks/board?${params.toString()}`);
  },

  async getTaskById(id: string): Promise<Task> {
    return httpClient.get(`/tasks/${id}`);
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    return httpClient.post('/tasks', payload);
  },

  async updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    return httpClient.patch(`/tasks/${id}`, payload);
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    return httpClient.patch(`/tasks/${id}/status`, { status });
  },

  async assignTask(id: string, assigneeId: string | null): Promise<Task> {
    return httpClient.patch(`/tasks/${id}/assign`, { assigneeId });
  },

  async reorderTasks(moves: TaskMoveItem[]): Promise<void> {
    return httpClient.post('/tasks/reorder', { moves });
  },

  async deleteTask(id: string): Promise<void> {
    return httpClient.delete(`/tasks/${id}`);
  },

  async decomposeProject(projectId: string): Promise<DecomposeProjectResponse> {
    return httpClient.post(`/tasks/decompose/${projectId}`);
  },
};
