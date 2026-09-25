import { httpClient } from '@/services/http';
import {
  SocialPost,
  SocialChannel,
  SocialPostStatus,
  CreateSocialPostPayload,
  UpdateSocialPostPayload,
  GenerateSocialContentPayload,
  GeneratedSocialContentResponse,
} from '../types';

export const socialService = {
  async getPosts(params?: { channel?: SocialChannel; status?: SocialPostStatus }): Promise<SocialPost[]> {
    const query = new URLSearchParams();
    if (params?.channel) query.append('channel', params.channel);
    if (params?.status) query.append('status', params.status);
    const qs = query.toString();
    return httpClient.get(`/social/posts${qs ? `?${qs}` : ''}`);
  },

  async getPostById(id: string): Promise<SocialPost> {
    return httpClient.get(`/social/posts/${id}`);
  },

  async createPost(payload: CreateSocialPostPayload): Promise<SocialPost> {
    return httpClient.post('/social/posts', payload);
  },

  async updatePost(id: string, payload: UpdateSocialPostPayload): Promise<SocialPost> {
    return httpClient.put(`/social/posts/${id}`, payload);
  },

  async publishPost(id: string): Promise<SocialPost> {
    return httpClient.post(`/social/posts/${id}/publish`, {});
  },

  async deletePost(id: string): Promise<void> {
    return httpClient.delete(`/social/posts/${id}`);
  },

  async generateContentWithAI(payload: GenerateSocialContentPayload): Promise<GeneratedSocialContentResponse> {
    return httpClient.post('/social/generate', payload);
  },
};
