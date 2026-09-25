export type ExperimentStatus = 'PLANNED' | 'RUNNING' | 'COMPLETED' | 'ABORTED';

export interface Experiment {
  id: string;
  organizationId: string;
  hypothesisId: string;
  name: string;
  description?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  status: ExperimentStatus;
  resultMetric?: string;
  resultValue?: string;
  conclusion?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateExperimentPayload {
  hypothesisId: string;
  name: string;
  description?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  status?: ExperimentStatus;
  resultMetric?: string;
  resultValue?: string;
}

export interface UpdateExperimentPayload {
  name?: string;
  description?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  status?: ExperimentStatus;
  resultMetric?: string;
  resultValue?: string;
  conclusion?: string;
}

export interface UpdateExperimentStatusPayload {
  status: ExperimentStatus;
}

export interface RecordExperimentConclusionPayload {
  conclusion: string;
  resultMetric?: string;
  resultValue?: string;
}
