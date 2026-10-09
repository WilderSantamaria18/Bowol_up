import { httpClient } from '@/services/http';
import {
  BowolPlanGuide,
  PlanningValidationResult,
  PlanningImportResponse,
  ProjectCharterData,
  CapacityPlanData,
  WeeklyRetrospectiveData,
  WeeklyFocusBannerData,
  DailyCheckinData,
} from '../types';

export const planningService = {
  // Plan Import / Export / Validation
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

  // Project Charter (Ficha SMART)
  async getProjectCharter(projectId: string): Promise<ProjectCharterData | null> {
    const res = await httpClient.get(`/planning/projects/${projectId}/charter`);
    return res as unknown as ProjectCharterData | null;
  },

  async saveProjectCharter(projectId: string, payload: Partial<ProjectCharterData>): Promise<ProjectCharterData> {
    const res = await httpClient.put(`/planning/projects/${projectId}/charter`, payload);
    return res as unknown as ProjectCharterData;
  },

  // Capacity Plan (Capacidad y Buffer 20%)
  async getCapacityPlan(): Promise<CapacityPlanData> {
    const res = await httpClient.get('/planning/capacity');
    return res as unknown as CapacityPlanData;
  },

  async saveCapacityPlan(payload: Partial<CapacityPlanData>): Promise<CapacityPlanData> {
    const res = await httpClient.post('/planning/capacity', payload);
    return res as unknown as CapacityPlanData;
  },

  // Weekly Retrospective
  async getWeeklyRetrospectives(projectId?: string): Promise<WeeklyRetrospectiveData[]> {
    const query = projectId ? `?projectId=${projectId}` : '';
    const res = await httpClient.get(`/planning/retrospectives${query}`);
    return res as unknown as WeeklyRetrospectiveData[];
  },

  async getRetrospectiveMetrics(projectId: string): Promise<WeeklyRetrospectiveData> {
    const res = await httpClient.get(`/planning/projects/${projectId}/retrospective-metrics`);
    return res as unknown as WeeklyRetrospectiveData;
  },

  async saveWeeklyRetrospective(payload: Partial<WeeklyRetrospectiveData>): Promise<WeeklyRetrospectiveData> {
    const res = await httpClient.post('/planning/retrospectives', payload);
    return res as unknown as WeeklyRetrospectiveData;
  },

  // Weekly Focus Banner
  async getWeeklyFocusBanner(projectId: string): Promise<WeeklyFocusBannerData | null> {
    const res = await httpClient.get(`/planning/projects/${projectId}/focus`);
    return res as unknown as WeeklyFocusBannerData | null;
  },

  async saveWeeklyFocusBanner(projectId: string, payload: Partial<WeeklyFocusBannerData>): Promise<WeeklyFocusBannerData> {
    const res = await httpClient.put(`/planning/projects/${projectId}/focus`, payload);
    return res as unknown as WeeklyFocusBannerData;
  },

  // Daily Check-ins
  async getDailyCheckins(projectId: string): Promise<DailyCheckinData[]> {
    const res = await httpClient.get(`/planning/projects/${projectId}/checkins`);
    return res as unknown as DailyCheckinData[];
  },

  async createDailyCheckin(projectId: string, payload: Partial<DailyCheckinData>): Promise<DailyCheckinData> {
    const res = await httpClient.post(`/planning/projects/${projectId}/checkins`, payload);
    return res as unknown as DailyCheckinData;
  },
};
