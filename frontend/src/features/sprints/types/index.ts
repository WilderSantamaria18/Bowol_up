export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELED';

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  totalTasks?: number;
  completedTasks?: number;
  totalEstimateHours?: number;
  completedEstimateHours?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSprintPayload {
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSprintPayload {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status?: SprintStatus;
}

export interface CompleteSprintPayload {
  moveToSprintId?: string;
  moveToBacklog?: boolean;
}

export interface BurndownPoint {
  date: string;
  idealHours: number;
  remainingHours: number | null;
}

export interface SprintBurndownResponse {
  sprintId: string;
  sprintName: string;
  startDate: string;
  endDate: string;
  totalEstimatedHours: number;
  remainingHours: number;
  dataPoints: BurndownPoint[];
}

export interface SprintVelocityItem {
  sprintId: string;
  sprintName: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  committedHours: number;
  completedHours: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export interface ProjectVelocityResponse {
  projectId: string;
  averageVelocityHours: number;
  averageCompletionRate?: number;
  history: SprintVelocityItem[];
}

export interface SprintMetricsResponse {
  sprintId: string;
  sprintName: string;
  status: SprintStatus;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  totalEstimateHours: number;
  completedEstimateHours: number;
  averageCycleTimeHours?: number;
}

export interface AiSprintPlanResponse {
  sprintName: string;
  sprintGoal: string;
  recommendedTaskIds: string[];
  recommendedTaskTitles: string[];
  suggestedDurationDays: number;
  totalEstimatedHours: number;
  rationale: string;
}
