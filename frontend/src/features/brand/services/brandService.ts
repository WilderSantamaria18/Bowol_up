import { httpClient } from '@/services/http';
import { BrandProfile, SaveBrandProfilePayload } from '../types';

export const brandService = {
  async getBrandProfile(): Promise<BrandProfile> {
    return httpClient.get('/brand-profile');
  },

  async saveBrandProfile(payload: SaveBrandProfilePayload): Promise<BrandProfile> {
    return httpClient.put('/brand-profile', payload);
  },
};
