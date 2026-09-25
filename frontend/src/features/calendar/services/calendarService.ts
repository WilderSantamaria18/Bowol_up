import { httpClient } from '@/services/http';
import {
  CalendarEvent,
  UnifiedCalendarItem,
  CreateCalendarEventPayload,
  UpdateCalendarEventPayload,
  CalendarEventType,
} from '../types';

export const calendarService = {
  async getUnifiedCalendar(params?: {
    startDate?: string;
    endDate?: string;
    type?: CalendarEventType;
    projectId?: string;
  }): Promise<UnifiedCalendarItem[]> {
    return httpClient.get('/calendar/unified', { params });
  },

  async getEvents(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<CalendarEvent[]> {
    return httpClient.get('/calendar/events', { params });
  },

  async createEvent(payload: CreateCalendarEventPayload): Promise<CalendarEvent> {
    return httpClient.post('/calendar/events', payload);
  },

  async updateEvent(id: string, payload: UpdateCalendarEventPayload): Promise<CalendarEvent> {
    return httpClient.patch(`/calendar/events/${id}`, payload);
  },

  async deleteEvent(id: string): Promise<void> {
    return httpClient.delete(`/calendar/events/${id}`);
  },

  async downloadICalendar(startDate?: string, endDate?: string): Promise<void> {
    const raw = await httpClient.get<string>('/calendar/export.ics', {
      params: { startDate, endDate },
      responseType: 'text' as any,
    });

    const blob = new Blob([typeof raw === 'string' ? raw : (raw as any).data || ''], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bowol-roadmap.ics');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
