import { httpClient } from '@/services/http';
import { BusinessProfile, OnboardingPayload, UpdateProfilePayload } from '../types';

export const businessProfileService = {
  async getProfile(): Promise<BusinessProfile> {
    return httpClient.get('/business-profile');
  },

  async replaceProfile(payload: UpdateProfilePayload): Promise<BusinessProfile> {
    return httpClient.put('/business-profile', payload);
  },

  async patchProfile(payload: UpdateProfilePayload): Promise<BusinessProfile> {
    return httpClient.patch('/business-profile', payload);
  },

  async completeOnboarding(payload: OnboardingPayload): Promise<BusinessProfile> {
    return httpClient.post('/business-profile/onboarding', payload);
  },
};
