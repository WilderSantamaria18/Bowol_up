export interface PrioritizationPlan {
  reach?: number; // 1 a 10
  impact?: number; // 1 a 3
  confidence?: number; // 0.0 a 1.0
  effortHours?: number; // > 0
  score?: number; // (R * I * C) / E
  provisional?: boolean;
  evidence?: string;
}

export interface TaskPlan {
  id: string; // T-001
  title: string;
  description?: string;
  area?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  estimatedHours: number;
  assignedRole?: string;
  assignedPerson?: string | null;
  deliverable?: string;
  acceptanceCriteria?: string[];
  dependsOn?: string[];
  dueDate?: string | null;
  prioritization?: PrioritizationPlan | null;
}

export interface ProjectPlan {
  name: string;
  objective?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
}

export interface BowolPlanGuide {
  schemaVersion: string; // 'bowol-planning-guide-2.0'
  project: ProjectPlan;
  assumptions?: string[];
  tasks: TaskPlan[];
}

export interface PlanningValidationResult {
  valid: boolean;
  blockingIssues: string[];
  warnings: string[];
  totalEstimatedHours: number;
  totalTasks: number;
  tasksOverSixHours: number;
  tasksWithoutAcceptanceCriteria: number;
}

export interface PlanningImportResponse {
  projectId: string;
  projectName: string;
  importedTasksCount: number;
  totalEstimatedHours: number;
  createdTaskIds: string[];
  warnings: string[];
}

export interface ContextSheetData {
  negocioYSector: string;
  productosServicios: string;
  clienteCanales: string;
  problema: string;
  evidencias: string;
  resultadoDeseado: string;
  lineaBase: string;
  periodo: string;
  paisMoneda: string;
  equipo: string;
  trabajoHabitual: string;
  presupuesto: string;
  herramientas: string;
  compromisos: string;
  restricciones: string;
  decisionesDuenio: string;
}

// Persistencia colaborativa BOWOL Plans 2.0 (Fases 1, 2, 5, 6)

export interface ProjectCharterData {
  id?: string;
  projectId: string;
  problemAddressed: string;
  smartObjective: string;
  measurableKpi: string;
  baselineValue: string;
  baselineUnit: string;
  baselineDate?: string | null;
  baselineIsProvisional: boolean;
  targetValue: string;
  targetUnit: string;
  targetDeadline?: string | null;
  measurementSource: string;
  ownerDecisionRequired: boolean;
  ownerDecisionDetails?: string;
  technicalDeliverables: string[];
  expectedCommercialResult: string;
  inScope: string[];
  outOfScope: string[];
  restrictions: string[];
  updatedAt?: string;
}

export interface MemberAllocationData {
  id?: string;
  userId?: string | null;
  name: string;
  role: string;
  availableHours: number;
  assignedHours: number;
}

export interface CapacityPlanData {
  id?: string;
  periodLabel: string;
  bufferPercentage: number;
  members: MemberAllocationData[];
}

export interface RetrospectiveImprovement {
  action: string;
  owner: string;
  dueDate: string;
}

export interface WeeklyRetrospectiveData {
  id?: string;
  projectId?: string;
  sprintId?: string;
  weekLabel: string;
  committedTasks: number;
  acceptedTasks: number;
  blockedTasks: number;
  reviewPendingTasks: number;
  estimatedHours: number;
  actualHours: number;
  businessMetricResult?: string;
  businessMetricDate?: string;
  whatWorked?: string;
  delayCauses?: string;
  improvements: RetrospectiveImprovement[];
  updatedAt?: string;
}

export interface WeeklyFocusBannerData {
  id?: string;
  projectId: string;
  weeklyDeliverable: string;
  identifiedRisk: string;
  mitigationPlan: string;
  updatedAt?: string;
}

export interface DailyCheckinData {
  id?: string;
  projectId: string;
  userId?: string;
  userName: string;
  date: string;
  yesterdayDeliverable: string;
  todayCommitment: string;
  blockers?: string | null;
  hasBlocker?: boolean;
  taskId?: string | null;
  createdAt?: string;
}
