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

export interface DashboardExecutiveBriefing {
  headline: string;
  summary?: string;
  highlights: string[];
  risks?: string[];
  suggestedActions?: string[];
  generatedAt: string;
}

export interface DashboardHealthScoreInfo {
  overallScore: number;
  executionScore: number;
  strategyScore: number;
  marketScore: number;
  maturityScore: number;
  statusLabel: 'OPTIMAL' | 'GOOD' | 'ATTENTION_NEEDED';
  explanation: string;
  formulaVariables?: Record<string, any>;
}

export interface DashboardActivityItem {
  id: number;
  action: string;
  entityType: string;
  entityId?: string;
  actorEmail?: string;
  description: string;
  createdAt: string;
}

export interface DashboardSummary {
  organization: DashboardOrganizationInfo;
  maturity: DashboardMaturityInfo;
  trends: DashboardTrendsSummary;
  strategy: DashboardStrategySummary;
  execution: DashboardExecutionSummary;
  briefing?: DashboardExecutiveBriefing;
  healthScore?: DashboardHealthScoreInfo;
}

