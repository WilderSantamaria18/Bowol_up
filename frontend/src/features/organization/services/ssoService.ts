import { httpClient } from '@/services/http';

export type SsoProvider = 'GOOGLE' | 'AZURE_AD' | 'OIDC' | 'SAML2';

export interface SsoConfig {
  id: string;
  organizationId: string;
  provider: SsoProvider;
  displayName: string;
  clientId: string;
  issuerUri?: string;
  metadataUrl?: string;
  authorizationUrl?: string;
  domainRestriction?: string;
  isEnabled: boolean;
  enforceSso: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SaveSsoConfigDTO {
  provider: SsoProvider;
  displayName?: string;
  clientId: string;
  clientSecret?: string;
  issuerUri?: string;
  metadataUrl?: string;
  authorizationUrl?: string;
  domainRestriction?: string;
  isEnabled?: boolean;
  enforceSso?: boolean;
}

export interface SsoInitiateResponse {
  organizationId: string;
  organizationName: string;
  provider: SsoProvider;
  authorizationUrl: string;
  state: string;
}

export const ssoService = {
  async getConfigs(orgId: string): Promise<SsoConfig[]> {
    return httpClient.get(`/organizations/${orgId}/sso`);
  },

  async saveConfig(orgId: string, data: SaveSsoConfigDTO): Promise<SsoConfig> {
    return httpClient.post(`/organizations/${orgId}/sso`, data);
  },

  async deleteConfig(orgId: string, configId: string): Promise<void> {
    return httpClient.delete(`/organizations/${orgId}/sso/${configId}`);
  },

  async initiate(email: string): Promise<SsoInitiateResponse> {
    return httpClient.post('/auth/sso/initiate', { email });
  },

  async callback(data: {
    organizationId: string;
    provider: SsoProvider;
    code: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  }): Promise<unknown> {
    return httpClient.post('/auth/sso/callback', data);
  },
};
