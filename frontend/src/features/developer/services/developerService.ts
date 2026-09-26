import { httpClient } from '@/services/http';
import {
  ApiKey,
  ApiKeyCreated,
  CreateApiKeyDTO,
  WebhookEndpoint,
  CreateWebhookDTO,
  UpdateWebhookDTO,
  WebhookDelivery,
} from '../types';
import { PageResponse } from '@/features/audit/types';

export const developerService = {
  // API Keys
  async listApiKeys(): Promise<ApiKey[]> {
    return httpClient.get('/developer/api-keys');
  },

  async createApiKey(data: CreateApiKeyDTO): Promise<ApiKeyCreated> {
    return httpClient.post('/developer/api-keys', data);
  },

  async revokeApiKey(id: string): Promise<void> {
    return httpClient.delete(`/developer/api-keys/${id}`);
  },

  // Webhooks
  async listWebhooks(): Promise<WebhookEndpoint[]> {
    return httpClient.get('/developer/webhooks');
  },

  async createWebhook(data: CreateWebhookDTO): Promise<WebhookEndpoint> {
    return httpClient.post('/developer/webhooks', data);
  },

  async updateWebhook(id: string, data: UpdateWebhookDTO): Promise<WebhookEndpoint> {
    return httpClient.put(`/developer/webhooks/${id}`, data);
  },

  async deleteWebhook(id: string): Promise<void> {
    return httpClient.delete(`/developer/webhooks/${id}`);
  },

  async testWebhookPing(id: string): Promise<WebhookDelivery> {
    return httpClient.post(`/developer/webhooks/${id}/test`);
  },

  async getWebhookDeliveries(id: string, page = 0, size = 15): Promise<PageResponse<WebhookDelivery>> {
    return httpClient.get(`/developer/webhooks/${id}/deliveries`, {
      params: { page, size },
    });
  },
};
