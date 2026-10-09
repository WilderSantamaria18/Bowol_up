export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELED' | 'BLOCKED';

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
  assigneeName?: string | null;
  estimateHours?: number | null;
  position: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;

  // Protocolo Operativo BOWOL Plans 2.0 (Fase 5.3 & 6.2)
  blockedReason?: string | null;
  blockedResolver?: string | null;
  blockedReviewDate?: string | null;
  acceptanceEvidence?: string | null;
  acceptanceReviewedBy?: string | null;

  // Fase 3 BOWOL Plans: Desglose de actividades verificables
  area?: string | null;
  deliverable?: string | null;
  acceptanceCriteria?: string[] | string | null;
  externalWaitHours?: number | null;
  isHighUncertainty?: boolean | null;
  assignedRole?: string | null;
  dependsOn?: string[] | null;
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
  area?: string;
  deliverable?: string;
  acceptanceCriteria?: string[] | string;
  externalWaitHours?: number;
  isHighUncertainty?: boolean;
  assignedRole?: string;
  dependsOn?: string[];
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
  blockedReason?: string | null;
  blockedResolver?: string | null;
  blockedReviewDate?: string | null;
  acceptanceEvidence?: string | null;
  acceptanceReviewedBy?: string | null;
  area?: string | null;
  deliverable?: string | null;
  acceptanceCriteria?: string[] | string | null;
  externalWaitHours?: number | null;
  isHighUncertainty?: boolean | null;
  assignedRole?: string | null;
  dependsOn?: string[] | null;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
  blockedReason?: string | null;
  blockedResolver?: string | null;
  blockedReviewDate?: string | null;
  acceptanceEvidence?: string | null;
  acceptanceReviewedBy?: string | null;
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

export type TaskBoardData = Partial<Record<TaskStatus, Task[]>>;

// Modelos Operativos BOWOL Plans 2.0 (Fase 5 y 6)
export interface DailyCheckin {
  id: string;
  projectId: string;
  date: string;
  userName: string;
  yesterdayDeliverable: string;
  todayCommitment: string;
  blockers: string;
  hasBlocker: boolean;
  taskId?: string;
  createdAt: string;
}

export interface TeamMemberCapacity {
  id: string;
  name: string;
  role: string;
  weeklyAvailableHours: number;
  assignedHours: number;
}

export interface WeeklyRetrospectiveImprovement {
  action: string;
  owner: string;
  dueDate: string;
}

export interface WeeklyRetrospective {
  id: string;
  projectId: string;
  weekPeriod: string;
  committedTasksCount: number;
  completedTasksCount: number;
  totalEstimatedHours: number;
  businessOutcomeObservation: string;
  whatWentWell: string;
  delayCauses: string;
  improvements: WeeklyRetrospectiveImprovement[];
  createdAt: string;
}
