import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CalendarPage } from '../pages/CalendarPage';
import { calendarService } from '../services/calendarService';
import { projectService } from '@/features/projects/services/projectService';
import { UnifiedCalendarItem } from '../types';

vi.mock('../services/calendarService', () => ({
  calendarService: {
    getUnifiedCalendar: vi.fn(),
    createEvent: vi.fn(),
    deleteEvent: vi.fn(),
    downloadICalendar: vi.fn(),
  },
}));

vi.mock('@/features/projects/services/projectService', () => ({
  projectService: {
    getProjects: vi.fn(),
  },
}));

const mockItems: UnifiedCalendarItem[] = [
  {
    id: 'item-sprint-1',
    source: 'SPRINT',
    eventType: 'SPRINT',
    title: 'Sprint 1: Core Engine',
    description: 'Sprint planning and core execution',
    startDate: '2026-09-01',
    endDate: '2026-09-14',
    status: 'ACTIVE',
    color: 'emerald',
    projectId: 'proj-1',
    projectName: 'Proyecto Alpha',
  },
  {
    id: 'item-milestone-1',
    source: 'CALENDAR_EVENT',
    eventType: 'MILESTONE',
    title: 'Lanzamiento Beta Cerrada',
    description: 'Hito clave para 50 usuarios iniciales',
    startDate: '2026-09-20',
    endDate: '2026-09-20',
    status: 'SCHEDULED',
    color: 'purple',
    projectId: 'proj-1',
    projectName: 'Proyecto Alpha',
  },
  {
    id: 'item-exp-1',
    source: 'EXPERIMENT',
    eventType: 'EXPERIMENT',
    title: 'Validación Canales B2B',
    description: 'Test de adquisición outbound',
    startDate: '2026-09-22',
    endDate: '2026-09-28',
    status: 'RUNNING',
    color: 'sky',
    projectId: 'proj-2',
    projectName: 'Proyecto Growth',
  },
];

describe('CalendarPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(calendarService.getUnifiedCalendar).mockResolvedValue(mockItems);
    vi.mocked(projectService.getProjects).mockResolvedValue({
      items: [
        {
          id: 'proj-1',
          organizationId: 'org-1',
          name: 'Proyecto Alpha',
          description: 'Demo project',
          status: 'ACTIVE',
          createdAt: '2026-09-01T00:00:00Z',
        },
      ],
      totalElements: 1,
    });
  });

  const renderComponent = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CalendarPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders the strategic calendar header and loads unified items', async () => {
    renderComponent();

    expect(screen.getByText('Calendario Estratégico')).toBeInTheDocument();
    expect(screen.getByText(/Vista unificada de sprints/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(calendarService.getUnifiedCalendar).toHaveBeenCalled();
    });

    // Month grid shows items or chips
    await waitFor(() => {
      expect(screen.getAllByText('Sprint 1: Core Engine').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Lanzamiento Beta Cerrada').length).toBeGreaterThan(0);
    });
  });

  it('switches between Month view and Agenda view', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Agenda/i })).toBeInTheDocument();
    });

    const agendaButton = screen.getByRole('button', { name: /Agenda/i });
    fireEvent.click(agendaButton);

    await waitFor(() => {
      // Agenda view should display items
      expect(screen.getByText('Validación Canales B2B')).toBeInTheDocument();
    });

    // Switch back to Mes
    const mesButton = screen.getByRole('button', { name: /^Mes$/i });
    fireEvent.click(mesButton);

    await waitFor(() => {
      expect(screen.getAllByText('Sprint 1: Core Engine').length).toBeGreaterThan(0);
    });
  });

  it('filters items by event type', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Hitos/i })).toBeInTheDocument();
    });

    // Click Hitos filter
    fireEvent.click(screen.getByRole('button', { name: /Hitos/i }));

    await waitFor(() => {
      expect(calendarService.getUnifiedCalendar).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'MILESTONE' })
      );
    });
  });

  it('calls downloadICalendar when clicking Exportar .ics', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Exportar \.ics/i })).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /Exportar \.ics/i });
    fireEvent.click(exportBtn);

    expect(calendarService.downloadICalendar).toHaveBeenCalled();
  });

  it('opens and closes the create event modal', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Nuevo Hito \/ Evento/i })).toBeInTheDocument();
    });

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Nuevo Hito \/ Evento/i }));

    expect(screen.getByText('Agrega un punto de control o fecha clave al roadmap')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Lanzamiento Demo MVP/i)).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    await waitFor(() => {
      expect(screen.queryByText('Agrega un punto de control o fecha clave al roadmap')).not.toBeInTheDocument();
    });
  });
});
