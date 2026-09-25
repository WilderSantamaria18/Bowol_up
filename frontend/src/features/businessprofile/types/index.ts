import { OrganizationSize } from '@/features/organization/types';

export interface GoalItem {
  text: string;
  priority: number;
}

export interface BusinessProfile {
  id: string;
  organizationId: string;
  industry: string;
  size: OrganizationSize;
  market: string;
  goals: GoalItem[];
  problems: string[];
  tools: string[];
  competitors: string[];
  channels: string[];
  digitalMaturity: number;
  aiMaturity: number;
  onboardingCompletedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OnboardingPayload {
  industry: string;
  size: OrganizationSize;
  market: string;
  goals: GoalItem[];
  problems: string[];
  tools: string[];
  competitors: string[];
  channels: string[];
  digitalMaturity: number;
  aiMaturity: number;
}

export interface UpdateProfilePayload {
  industry?: string;
  size?: OrganizationSize;
  market?: string;
  goals?: GoalItem[];
  problems?: string[];
  tools?: string[];
  competitors?: string[];
  channels?: string[];
  digitalMaturity?: number;
  aiMaturity?: number;
}
