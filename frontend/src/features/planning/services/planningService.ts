import { httpClient } from '@/services/http';
import { BowolPlanGuide, PlanningValidationResult, PlanningImportResponse } from '../types';

export const planningService = {
  async validatePlan(payload: BowolPlanGuide): Promise<PlanningValidationResult> {
    const res = await httpClient.post('/planning/validate', payload);
    return res as unknown as PlanningValidationResult;
  },

  async importPlan(payload: BowolPlanGuide): Promise<PlanningImportResponse> {
    const res = await httpClient.post('/planning/import', payload);
    return res as unknown as PlanningImportResponse;
  },

  async exportPlan(projectId: string): Promise<BowolPlanGuide> {
    const res = await httpClient.get(`/planning/export/${projectId}`);
    return res as unknown as BowolPlanGuide;
  },
};
