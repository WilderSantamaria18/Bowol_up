export type ConversationContextType = 'GENERAL' | 'TREND' | 'SWOT' | 'OPPORTUNITY' | 'PROJECT';

export type AIMessageRole = 'SYSTEM' | 'USER' | 'ASSISTANT' | 'TOOL';

export interface ConversationMessage {
  id: number;
  role: AIMessageRole;
  content: string;
  tokensUsed?: number | null;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  organizationId: string;
  userId: string;
  contextType: ConversationContextType;
  contextId?: string | null;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string | null;
}

export interface ConversationDetail {
  conversation: AIConversation;
  messages: ConversationMessage[];
}

export interface CreateConversationPayload {
  contextType?: ConversationContextType;
  contextId?: string;
  title?: string;
  initialMessage?: string;
}

export interface SendMessagePayload {
  content: string;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
