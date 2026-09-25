export type SocialChannel =
  | 'LINKEDIN'
  | 'TWITTER_X'
  | 'INSTAGRAM'
  | 'BLOG'
  | 'NEWSLETTER';

export type SocialPostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export interface PredictedImpact {
  reachEstimateMin: number;
  reachEstimateMax: number;
  engagementRate: number;
  viralityScore: number;
  sentiment: string;
  bestTimeToPost: string;
  strategicReasoning: string;
}

export interface SocialPost {
  id: string;
  organizationId: string;
  projectId?: string;
  opportunityId?: string;
  channel: SocialChannel;
  title: string;
  content: string;
  status: SocialPostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  predictedImpact?: PredictedImpact;
  mediaUrls: string[];
  tags: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSocialPostPayload {
  projectId?: string;
  opportunityId?: string;
  channel: SocialChannel;
  title: string;
  content: string;
  status?: SocialPostStatus;
  scheduledAt?: string;
  predictedImpact?: PredictedImpact;
  mediaUrls?: string[];
  tags?: string[];
}

export interface UpdateSocialPostPayload {
  projectId?: string;
  opportunityId?: string;
  channel?: SocialChannel;
  title?: string;
  content?: string;
  status?: SocialPostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  predictedImpact?: PredictedImpact;
  mediaUrls?: string[];
  tags?: string[];
}

export interface SocialPostProposal {
  channel: SocialChannel;
  title: string;
  content: string;
  tags: string[];
  predictedImpact: PredictedImpact;
}

export interface GenerateSocialContentPayload {
  projectId?: string;
  opportunityId?: string;
  topic: string;
  channels?: SocialChannel[];
  customInstructions?: string;
}

export interface GeneratedSocialContentResponse {
  topic: string;
  proposals: SocialPostProposal[];
}
