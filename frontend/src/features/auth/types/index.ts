export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  status?: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'STRATEGIST' | 'EXECUTOR' | 'VIEWER' | 'PLATFORM_ADMIN';
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserSummary;
  organization: OrganizationSummary;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organizationName?: string;
}

export interface MeResponse {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  status: string;
  currentOrganization: OrganizationSummary;
  organizations: OrganizationSummary[];
}
