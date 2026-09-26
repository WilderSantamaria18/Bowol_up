export interface AuditLog {
  id: number;
  organizationId: string;
  userId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  detailsJson: string;
  createdAt: string;
}

export interface AuditSummary {
  totalEvents: number;
  eventsLast24Hours: number;
  recentActivities: AuditLog[];
  complianceStatus: string;
}

export interface AuditFilterParams {
  action?: string;
  entityType?: string;
  actorEmail?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
