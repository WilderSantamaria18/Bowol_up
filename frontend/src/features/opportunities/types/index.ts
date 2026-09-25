export type OpportunityStatus = 'IDENTIFIED' | 'EVALUATING' | 'APPROVED' | 'REJECTED' | 'CONVERTED';

export interface Opportunity {
  id: string;
  organizationId: string;
  swotAnalysisId?: string;
  title: string;
  description?: string;
  reachScore?: number;
  impactScore?: number;
  confidenceScore?: number;
  effortScore?: number;
  priorityScore?: number;
  status: OpportunityStatus;
  evidence: string[];
  createdAt: string;
  updatedAt?: string;
}

export type OpportunityBoard = Record<OpportunityStatus, Opportunity[]>;

export interface CreateOpportunityPayload {
  title: string;
  description?: string;
  swotAnalysisId?: string;
  reachScore?: number;
  impactScore?: number;
  confidenceScore?: number;
  effortScore?: number;
  evidence?: string[];
}

export interface UpdateOpportunityPayload {
  title?: string;
  description?: string;
  reachScore?: number;
  impactScore?: number;
  confidenceScore?: number;
  effortScore?: number;
  status?: OpportunityStatus;
  evidence?: string[];
}

export interface OpportunitiesFromSwotResponse {
  generated: number;
  opportunities: Opportunity[];
}
