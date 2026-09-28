import { httpClient } from '@/services/http';
import { 
  DashboardSummary, 
  DashboardExecutiveBriefing, 
  DashboardHealthScoreInfo, 
  DashboardActivityItem 
} from '../types';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    return httpClient.get('/dashboard/summary');
  },

  async getBrief(): Promise<DashboardExecutiveBriefing> {
    return httpClient.get('/dashboard/brief');
  },

  async getHealth(): Promise<DashboardHealthScoreInfo> {
    return httpClient.get('/dashboard/health');
  },

  async getActivity(): Promise<DashboardActivityItem[]> {
    return httpClient.get('/dashboard/activity');
  },
};

