import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { projectService } from '../services/projectService';
import { taskService } from '@/features/tasks/services/taskService';
import { opportunityService } from '@/features/opportunities/services/opportunityService';

vi.mock('../services/projectService', () => ({
  projectService: {
    getProjectById: vi.fn(),
    getProjectSprints: vi.fn(),
    getProjectMembers: vi.fn(),
    updateProject: vi.fn(),
    addProjectMember: vi.fn(),
    removeProjectMember: vi.fn(),
    decomposeProject: vi.fn(),
  },
}));

vi.mock('@/features/tasks/services/taskService', () => ({
  taskService: {
    getTasks: vi.fn(),
  },
}));

vi.mock('@/features/sprints/services/sprintService', () => ({
  sprintService: {
    createSprint: vi.fn(),
  },
}));

vi.mock('@/features/opportunities/services/opportunityService', () => ({
  opportunityService: {
    getOpportunityById: vi.fn(),
  },
}));

const mockProject = {
  id: 'proj-123',
  organizationId: 'org-1',
  name: 'Motor de Búsqueda Semántica',
  description: 'Vector embeddings con PostgreSQL pgvector y Spring AI',
  status: 'ACTIVE' as const,
  startDate: '2026-09-01',
  endDate: '2026-10-31',
  opportunityId: 'opp-999',
  createdAt: '2026-09-01T00:00:00Z',
};

const renderComponent = (projectId = 'proj-123') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ProjectDetailPage Component (Fase 7 - Trazabilidad y Detalle)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (projectService.getProjectById as any).mockResolvedValue(mockProject);
    (projectService.getProjectSprints as any).mockResolvedValue([
      {
        id: 'sprint-1',
        projectId: 'proj-123',
        name: 'Sprint 1 - Indexación Vectorial',
        goal: 'Indexar 10k documentos con pgvector',
        startDate: '2026-09-01',
        endDate: '2026-09-15',
        status: 'ACTIVE',
      },
    ]);
    (taskService.getTasks as any).mockResolvedValue([
      {
        id: 'task-1',
        projectId: 'proj-123',
        title: 'Crear migración de pgvector',
        status: 'DONE',
        estimateHours: 4,
      },
      {
        id: 'task-2',
        projectId: 'proj-123',
        title: 'Implementar endpoint de búsqueda',
        status: 'IN_PROGRESS',
        estimateHours: 8,
      },
    ]);
    (projectService.getProjectMembers as any).mockResolvedValue([
      {
        id: 1,
        projectId: 'proj-123',
        userId: 'admin@bowol.ai',
        role: 'LEAD',
        addedAt: '2026-09-01T00:00:00Z',
      },
    ]);
    (opportunityService.getOpportunityById as any).mockResolvedValue({
      id: 'opp-999',
      title: 'Búsqueda contextual rápida',
      description: 'Reducir tiempo de descubrimiento de 15m a 30s',
      priorityScore: 84,
      status: 'CONVERTED',
    });
  });

  it('renderiza el detalle de la iniciativa con la barra de trazabilidad estratégica', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Motor de Búsqueda Semántica')).toBeInTheDocument();
      expect(screen.getByText(/Trazabilidad Estratégica Integral/i)).toBeInTheDocument();
      expect(screen.getByText(/Radar Señales/i)).toBeInTheDocument();
      expect(screen.getByText(/FODA Dinámico/i)).toBeInTheDocument();
      expect(screen.getByText(/Oportunidad RICE/i)).toBeInTheDocument();
      expect(screen.getByText(/Proyecto Activo/i)).toBeInTheDocument();
    });

    expect(screen.getByText('50%')).toBeInTheDocument(); // 1 done out of 2 tasks
  });

  it('permite alternar entre pestañas y ver sprints y tareas', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Motor de Búsqueda Semántica')).toBeInTheDocument();
    });

    // Switch to Sprints tab
    const sprintsTab = screen.getByRole('button', { name: /Sprints de Innovación/i });
    fireEvent.click(sprintsTab);

    await waitFor(() => {
      expect(screen.getByText('Sprint 1 - Indexación Vectorial')).toBeInTheDocument();
    });

    // Switch to Tasks tab
    const tasksTab = screen.getByRole('button', { name: /Tareas del Backlog/i });
    fireEvent.click(tasksTab);

    await waitFor(() => {
      expect(screen.getByText('Crear migración de pgvector')).toBeInTheDocument();
      expect(screen.getByText('Implementar endpoint de búsqueda')).toBeInTheDocument();
    });
  });
});
