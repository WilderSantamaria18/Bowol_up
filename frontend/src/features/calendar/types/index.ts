export type CalendarEventType = 'MILESTONE' | 'SPRINT' | 'EXPERIMENT' | 'KEY_EVENT';

export interface CalendarEvent {
  id: string;
  organizationId: string;
  projectId?: string;
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startDate: string;
  endDate?: string;
  color?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UnifiedCalendarItem {
  id: string;
  source: 'CALENDAR_EVENT' | 'SPRINT' | 'EXPERIMENT';
  eventType: CalendarEventType;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  color: string;
  status: string;
  projectId?: string;
  projectName?: string;
  metadata?: Record<string, any>;
}

export interface CreateCalendarEventPayload {
  projectId?: string;
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startDate: string;
  endDate?: string;
  color?: string;
}

export interface UpdateCalendarEventPayload {
  projectId?: string;
  title?: string;
  description?: string;
  eventType?: CalendarEventType;
  startDate?: string;
  endDate?: string;
  color?: string;
}
