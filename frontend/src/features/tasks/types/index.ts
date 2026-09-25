export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  projectId: string;
  sprintId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string | null;
  estimateHours?: number | null;
  position: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateTaskPayload {
  projectId: string;
  sprintId?: string | null;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  estimateHours?: number;
  position?: number;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  sprintId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  estimateHours?: number;
  position?: number;
}

export interface TaskMoveItem {
  taskId: string;
  sprintId?: string | null;
  status?: TaskStatus;
  position?: number;
}

export interface DecomposeProjectResponse {
  epicTitle: string;
  epicObjective: string;
  totalEstimatedHours: number;
  generatedTasksCount: number;
  tasks: Task[];
}

export type TaskBoardData = Record<TaskStatus, Task[]>;
