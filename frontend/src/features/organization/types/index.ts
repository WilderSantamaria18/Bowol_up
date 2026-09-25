export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'STRATEGIST' | 'EXECUTOR' | 'VIEWER' | 'PLATFORM_ADMIN';
export type MemberStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';
export type OrganizationSize = 'SOLO' | 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  industry?: string;
  country?: string;
  size?: OrganizationSize;
  website?: string;
  memberCount: number;
  role?: Role;
  createdAt: string;
  updatedAt?: string;
}

export interface Member {
  id: number;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  status: MemberStatus;
  joinedAt: string;
}

export interface UpdateOrganizationDTO {
  name?: string;
  logoUrl?: string;
  industry?: string;
  country?: string;
  size?: OrganizationSize;
  website?: string;
}

export interface InviteMemberDTO {
  email: string;
  role: Role;
}

export interface UpdateMemberRoleDTO {
  role: Role;
}
