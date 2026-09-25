export interface SwotItem {
  id: string;
  text: string;
  evidenceIds: string[];
}

export type QuadrantType = 'strengths' | 'weaknesses' | 'opportunities' | 'threats';

export interface SwotAnalysis {
  id: string;
  organizationId: string;
  businessProfileId?: string;
  profileSnapshot: Record<string, any>;
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  summary?: string;
  aiProvider?: string;
  aiModelUsed?: string;
  generatedAt: string;
  createdAt: string;
}

export interface GenerateSwotPayload {
  includeTrends?: boolean;
  maxTrends?: number;
  aiProvider?: string;
}

export interface AddSwotItemPayload {
  quadrant: QuadrantType;
  text: string;
  evidenceIds?: string[];
}

export interface UpdateSwotPayload {
  strengths?: SwotItem[];
  weaknesses?: SwotItem[];
  opportunities?: SwotItem[];
  threats?: SwotItem[];
  summary?: string;
}

export interface EvidenceRef {
  id: number;
  organizationId: string;
  entityType: string;
  entityId: string;
  trendId: string;
  trendTitle?: string;
  trendScore?: number;
  trendSource?: string;
  note?: string;
  weight?: number;
  createdAt: string;
}
