import { httpClient } from '@/services/http';
import {
  Trend,
  TrendRelevance,
  TrendSourceCode,
  MarkRelevantPayload,
  PageResponse,
  TrendSyncResult,
} from '../types';

export interface GetTrendsParams {
  source?: TrendSourceCode;
  query?: string;
  minScore?: number;
  page?: number;
  size?: number;
}

export const trendService = {
  async getTrends(params?: GetTrendsParams): Promise<PageResponse<Trend>> {
    const queryParams = new URLSearchParams();
    if (params?.source) queryParams.append('source', params.source);
    if (params?.query) queryParams.append('query', params.query);
    if (params?.minScore) queryParams.append('minScore', params.minScore.toString());
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    const qs = queryParams.toString();
    const endpoint = qs ? `/trends?${qs}` : '/trends';
    return httpClient.get(endpoint);
  },

  async getTrendById(id: string): Promise<Trend> {
    return httpClient.get(`/trends/${id}`);
  },

  async getTrendsForMe(page = 0, size = 20): Promise<PageResponse<TrendRelevance>> {
    return httpClient.get(`/trends/for-me?page=${page}&size=${size}`);
  },

  async markRelevant(id: string, payload?: MarkRelevantPayload): Promise<TrendRelevance> {
    return httpClient.post(`/trends/${id}/mark-relevant`, payload || {});
  },

  async dismissRelevance(id: string): Promise<void> {
    return httpClient.delete(`/trends/${id}/relevance`);
  },

  async evaluateWithAi(id: string): Promise<TrendRelevance> {
    return httpClient.post(`/trends/${id}/ai-evaluate`, {});
  },

  async triggerSync(limit = 10): Promise<TrendSyncResult> {
    return httpClient.post(`/trends/sync?limit=${limit}`, {});
  },
};
