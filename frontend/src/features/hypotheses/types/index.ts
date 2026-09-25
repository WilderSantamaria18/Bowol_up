export type HypothesisStatus = 'DRAFT' | 'READY' | 'RUNNING' | 'VALIDATED' | 'INVALIDATED' | 'CANCELED';

export type HypothesisResult = 'SUPPORTED' | 'REFUTED' | 'INCONCLUSIVE';

export interface Hypothesis {
  id: string;
  organizationId: string;
  opportunityId: string;
  statement: string;
  validationMethod?: string;
  successMetric?: string;
  targetValue?: string;
  status: HypothesisStatus;
  result?: HypothesisResult;
  resultNotes?: string;
  validatedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateHypothesisPayload {
  opportunityId: string;
  statement: string;
  validationMethod?: string;
  successMetric?: string;
  targetValue?: string;
  status?: HypothesisStatus;
}

export interface UpdateHypothesisPayload {
  statement?: string;
  validationMethod?: string;
  successMetric?: string;
  targetValue?: string;
  status?: HypothesisStatus;
}

export interface RecordHypothesisResultPayload {
  result: HypothesisResult;
  resultNotes?: string;
}
