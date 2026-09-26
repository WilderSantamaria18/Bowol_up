import { httpClient } from '@/services/http';
import { AuditLog, AuditSummary, AuditFilterParams, PageResponse } from '../types';

export const auditService = {
  async getLogs(params?: AuditFilterParams): Promise<PageResponse<AuditLog>> {
    const cleanParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    return httpClient.get('/audit-logs', { params: cleanParams });
  },

  async getSummary(): Promise<AuditSummary> {
    return httpClient.get('/audit-logs/summary');
  },

  async exportCsv(params?: AuditFilterParams): Promise<Blob> {
    const cleanParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const response = await httpClient.get('/audit-logs/export/csv', {
      params: cleanParams,
      responseType: 'blob',
    });
    return response as unknown as Blob;
  },

  async exportJson(params?: AuditFilterParams): Promise<AuditLog[]> {
    const cleanParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    return httpClient.get('/audit-logs/export/json', { params: cleanParams });
  },
};
