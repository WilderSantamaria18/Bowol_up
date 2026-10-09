export type ItemConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type ItemImpact = 'HIGH' | 'MEDIUM' | 'LOW';
export type ItemStatus = 'ACTIVE' | 'CONVERTED' | 'DISMISSED';

export type ValidationStatus = 'EVIDENCE_BACKED' | 'HYPOTHESIS_PENDING';

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
  validationStatus?: ValidationStatus;
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

export interface BottleneckDiagnostic {
  id: string;
  title: string;
  symptom: string;
  rootCause: string;
  isEvidenceBacked: boolean;
  evidenceNotes: string;
  validationPlan: string;
  priorityActions: Array<{
    id: string;
    action: string;
    deliverable: string;
    estimatedHours: number;
  }>;
  updatedAt: string;
}

export type RoutineImprovement = 'ELIMINAR' | 'SIMPLIFICAR' | 'ESTANDARIZAR' | 'AUTOMATIZAR';

export interface RoutineStep {
  id: string;
  name: string;
  minutes: number;
  improvement: RoutineImprovement;
  justification: string;
  savedMinutesWeekly: number;
  measuredSavings?: number; // minutos medidos reales
  checklist?: {
    responsible: string;
    input: string;
    output: string;
    reviewPoint: string;
    exceptionRule: string;
  };
  automationDetails?: {
    setupCost: string;
    maintenance: string;
    verificationMethod: string;
  };
}

export interface RoutineAudit {
  id: string;
  name: string;
  weeklyFrequency: number;
  currentMinutesPerRun: number;
  observedErrorsOrDelays: string;
  toolsAndBudget: string;
  steps: RoutineStep[];
  updatedAt: string;
}
