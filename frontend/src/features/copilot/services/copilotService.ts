import { httpClient } from '@/services/http';
import {
  AIConversation,
  ConversationDetail,
  ConversationMessage,
  ConversationContextType,
  CreateConversationPayload,
  SendMessagePayload,
  PageResponse,
} from '../types';

export const copilotService = {
  async getConversations(
    contextType?: ConversationContextType,
    page = 0,
    size = 20
  ): Promise<PageResponse<AIConversation>> {
    const params = new URLSearchParams();
    if (contextType) params.append('contextType', contextType);
    params.append('page', page.toString());
    params.append('size', size.toString());

    return httpClient.get(`/ai/conversations?${params.toString()}`);
  },

  async getConversation(id: string): Promise<ConversationDetail> {
    return httpClient.get(`/ai/conversations/${id}`);
  },

  async createConversation(payload: CreateConversationPayload): Promise<AIConversation> {
    return httpClient.post('/ai/conversations', payload);
  },

  async sendMessage(conversationId: string, payload: SendMessagePayload): Promise<ConversationMessage> {
    return httpClient.post(`/ai/conversations/${conversationId}/messages`, payload);
  },

  async deleteConversation(id: string): Promise<void> {
    return httpClient.delete(`/ai/conversations/${id}`);
  },
};
