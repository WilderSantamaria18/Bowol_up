export type ItemConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type ItemImpact = 'HIGH' | 'MEDIUM' | 'LOW';
export type ItemStatus = 'ACTIVE' | 'CONVERTED' | 'DISMISSED';

export interface SwotItem {
  id: string;
  type?: string;
  text: string;
  statement?: string;
  evidenceIds: string[];
  confidence?: ItemConfidence;
  impact?: ItemImpact;
  source?: string;
  status?: ItemStatus;
  createdAt?: string;
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
