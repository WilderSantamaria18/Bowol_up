export interface DashboardOrganizationInfo {
  id: string;
  name: string;
  slug: string;
  plan: string;
  memberCount: number;
}

export interface DashboardMaturityInfo {
  digitalMaturity: number;
  aiMaturity: number;
  stage: 'INICIAL' | 'EN_DESARROLLO' | 'AVANZADO' | 'LIDER';
  onboardingCompleted: boolean;
}

export interface DashboardTopTrendItem {
  id: string;
  title: string;
  score: number;
  source: string;
  url: string;
  tags: string[];
  relevanceScore?: number;
}

export interface DashboardTrendsSummary {
  totalGlobalTrends: number;
  evaluatedTrendsCount: number;
  topTrends: DashboardTopTrendItem[];
}

export interface DashboardStrategySummary {
  swotCount: number;
  opportunitiesCount: number;
  opportunitiesBacklog: number;
  opportunitiesPrioritized: number;
  averageRiceScore: number;
}

export interface DashboardActiveSprintInfo {
  id: string;
  name: string;
  goal?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
}

export interface DashboardExecutionSummary {
  activeProjectsCount: number;
  activeSprint?: DashboardActiveSprintInfo | null;
  totalTasksCount: number;
  completedTasksCount: number;
}

export interface DashboardSummary {
  organization: DashboardOrganizationInfo;
  maturity: DashboardMaturityInfo;
  trends: DashboardTrendsSummary;
  strategy: DashboardStrategySummary;
  execution: DashboardExecutionSummary;
}
