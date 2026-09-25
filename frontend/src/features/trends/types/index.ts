export type TrendSourceCode = 'GITHUB' | 'YOUTUBE' | 'HACKERNEWS' | 'REDDIT' | 'DEVTO';

export interface Trend {
  id: string;
  sourceCode: TrendSourceCode;
  sourceName: string;
  externalId: string;
  title: string;
  description: string;
  url: string;
  score: number;
  tags: string[];
  metadata: Record<string, any>;
  fetchedAt: string;
  createdAt: string;
  isRelevantForTenant: boolean;
  relevanceScore?: number | null;
  relevanceSummary?: string | null;
}

export interface TrendRelevance {
  id: string;
  organizationId: string;
  trend: Trend;
  score: number;
  aiSummary?: string | null;
  tags: string[];
  evaluatedAt: string;
  strategicAlignment?: 'HIGH' | 'MEDIUM' | 'LOW' | string | null;
  recommendedActions?: string[] | null;
  tokensUsed?: number | null;
}

export interface MarkRelevantPayload {
  score?: number;
  aiSummary?: string;
  tags?: string[];
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface TrendSyncResult {
  totalFetched: number;
  totalCreated: number;
  totalUpdated: number;
  totalErrors: number;
  messages: string[];
}
