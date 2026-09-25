import { httpClient } from '@/services/http';
import { DashboardSummary } from '../types';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    return httpClient.get('/dashboard/summary');
  },
};
