import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { SprintsPage } from '../pages/SprintsPage';
import { sprintService } from '../services/sprintService';
import { projectService } from '@/features/projects/services/projectService';
import {
  Sprint,
  SprintBurndownResponse,
  SprintMetricsResponse,
  ProjectVelocityResponse,
} from '../types';

vi.mock('../services/sprintService', () => ({
  sprintService: {
    getSprintsByProject: vi.fn(),
    getSprintById: vi.fn(),
    createSprint: vi.fn(),
    updateSprint: vi.fn(),
    startSprint: vi.fn(),
    completeSprint: vi.fn(),
    cancelSprint: vi.fn(),
    deleteSprint: vi.fn(),
    getSprintBurndown: vi.fn(),
    getSprintMetrics: vi.fn(),
    getProjectVelocity: vi.fn(),
    planSprintWithAi: vi.fn(),
  },
}));

vi.mock('@/features/projects/services/projectService', () => ({
  projectService: {
    getProjects: vi.fn(),
  },
}));

const mockProject = {
  id: 'proj-1',
  organizationId: 'org-1',
  name: 'Plataforma BOWOL v2',
  description: 'AI Innovation Operating System',
  status: 'ACTIVE' as const,
  createdAt: new Date().toISOString(),
};

const mockActiveSprint: Sprint = {
  id: 'sprint-active',
  projectId: 'proj-1',
  name: 'Sprint 2: MVP Alpha',
  goal: 'Desplegar MVP y métricas de ciclo',
  startDate: '2026-09-01',
  endDate: '2026-09-15',
  status: 'ACTIVE',
  totalTasks: 10,
  completedTasks: 6,
  totalEstimateHours: 40,
  completedEstimateHours: 24,
  createdAt: '2026-09-01T00:00:00Z',
};

const mockPlannedSprint: Sprint = {
  id: 'sprint-planned',
  projectId: 'proj-1',
  name: 'Sprint 3: Beta Launch',
  goal: 'Lanzamiento público beta',
  startDate: '2026-09-16',
  endDate: '2026-09-30',
  status: 'PLANNED',
  totalTasks: 5,
  completedTasks: 0,
  totalEstimateHours: 30,
  completedEstimateHours: 0,
  createdAt: '2026-09-05T00:00:00Z',
};

const mockCompletedSprint: Sprint = {
  id: 'sprint-completed',
  projectId: 'proj-1',
  name: 'Sprint 1: Fundación',
  goal: 'Arquitectura base y auth',
  startDate: '2026-08-15',
  endDate: '2026-08-31',
  status: 'COMPLETED',
  totalTasks: 8,
  completedTasks: 8,
  totalEstimateHours: 35,
  completedEstimateHours: 35,
  createdAt: '2026-08-15T00:00:00Z',
};

const mockMetrics: SprintMetricsResponse = {
  sprintId: 'sprint-active',
  sprintName: 'Sprint 2: MVP Alpha',
  status: 'ACTIVE',
  totalTasks: 10,
  completedTasks: 6,
  inProgressTasks: 3,
  todoTasks: 1,
  completionRate: 60,
  totalEstimateHours: 40,
  completedEstimateHours: 24,
  averageCycleTimeHours: 18.5,
};

const mockBurndown: SprintBurndownResponse = {
  sprintId: 'sprint-active',
  sprintName: 'Sprint 2: MVP Alpha',
  startDate: '2026-09-01',
  endDate: '2026-09-15',
  totalEstimatedHours: 40,
  remainingHours: 16,
  dataPoints: [
    { date: '2026-09-01', idealHours: 40, remainingHours: 40 },
    { date: '2026-09-08', idealHours: 20, remainingHours: 25 },
    { date: '2026-09-15', idealHours: 0, remainingHours: 16 },
  ],
};

const mockVelocity: ProjectVelocityResponse = {
  projectId: 'proj-1',
  averageVelocityHours: 29.5,
  averageCompletionRate: 80,
  history: [
    {
      sprintId: 'sprint-completed',
      sprintName: 'Sprint 1: Fundación',
      startDate: '2026-08-15',
      endDate: '2026-08-31',
      status: 'COMPLETED',
      committedHours: 35,
      completedHours: 35,
      totalTasks: 8,
      completedTasks: 8,
      completionRate: 100,
    },
    {
      sprintId: 'sprint-active',
      sprintName: 'Sprint 2: MVP Alpha',
      startDate: '2026-09-01',
      endDate: '2026-09-15',
      status: 'ACTIVE',
      committedHours: 40,
      completedHours: 24,
      totalTasks: 10,
      completedTasks: 6,
      completionRate: 60,
    },
  ],
};

const renderSprintsPage = () => {
  return render(
    <BrowserRouter>
      <SprintsPage />
    </BrowserRouter>
  );
};

describe('SprintsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projectService.getProjects).mockResolvedValue({
      items: [mockProject],
      totalElements: 1,
    });
    vi.mocked(sprintService.getSprintsByProject).mockResolvedValue([
      mockActiveSprint,
      mockPlannedSprint,
      mockCompletedSprint,
    ]);
    vi.mocked(sprintService.getSprintMetrics).mockResolvedValue(mockMetrics);
    vi.mocked(sprintService.getSprintBurndown).mockResolvedValue(mockBurndown);
    vi.mocked(sprintService.getProjectVelocity).mockResolvedValue(mockVelocity);
  });

  it('renders page header and active sprint tab by default', async () => {
    renderSprintsPage();

    await waitFor(() => {
      expect(screen.getByText('Gestión de Sprints & Velocidad')).toBeInTheDocument();
      expect(screen.getByText('Plataforma BOWOL v2')).toBeInTheDocument();
    });

    // Check active sprint details
    await waitFor(() => {
      expect(screen.getAllByText('Sprint 2: MVP Alpha').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Desplegar MVP y métricas de ciclo')).toBeInTheDocument();
      expect(screen.getByText('Tasa de Completitud')).toBeInTheDocument();
      expect(screen.getByText('Horas Quemadas / Estimadas')).toBeInTheDocument();
      expect(screen.getByText('18.5h')).toBeInTheDocument(); // Cycle time
      expect(screen.getByText('Burndown Chart')).toBeInTheDocument();
    });
  });

  it('navigates to Planning tab and lists planned & completed sprints', async () => {
    renderSprintsPage();

    await waitFor(() => {
      expect(screen.getByText(/Planificación & Backlog/i)).toBeInTheDocument();
    });

    const planningTab = screen.getByText(/Planificación & Backlog/i);
    fireEvent.click(planningTab);

    await waitFor(() => {
      expect(screen.getByText('Sprint 3: Beta Launch')).toBeInTheDocument();
      expect(screen.getByText('Sprint 1: Fundación')).toBeInTheDocument();
    });
  });

  it('navigates to Velocity & Metrics tab and displays velocity chart', async () => {
    renderSprintsPage();

    await waitFor(() => {
      expect(screen.getByText(/Velocidad & Burndown/i)).toBeInTheDocument();
    });

    const velocityTab = screen.getByText(/Velocidad & Burndown/i);
    fireEvent.click(velocityTab);

    await waitFor(() => {
      expect(screen.getByText('Velocity Engine')).toBeInTheDocument();
      expect(screen.getByText('Velocidad por Sprint & Rendimiento del Equipo')).toBeInTheDocument();
      expect(screen.getByText('Promedio (29.5h)')).toBeInTheDocument();
      expect(screen.getAllByText(/80%/).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('opens Create Sprint modal when clicking Nuevo Sprint', async () => {
    renderSprintsPage();

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /Nuevo Sprint/i });
      expect(btn).not.toBeDisabled();
    });

    const newSprintBtn = screen.getByRole('button', { name: /Nuevo Sprint/i });
    fireEvent.click(newSprintBtn);

    await waitFor(() => {
      expect(screen.getByText('Planificar Nuevo Sprint')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/p\. ej\. Sprint 1/i)).toBeInTheDocument();
    });
  });

  it('starts a planned sprint successfully', async () => {
    vi.mocked(sprintService.startSprint).mockResolvedValue({
      ...mockPlannedSprint,
      status: 'ACTIVE',
    });

    renderSprintsPage();

    await waitFor(() => {
      expect(screen.getByText(/Planificación & Backlog/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Planificación & Backlog/i));

    await waitFor(() => {
      expect(screen.getByText('Sprint 3: Beta Launch')).toBeInTheDocument();
    });

    const startBtn = screen.getByRole('button', { name: /Iniciar Sprint/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(sprintService.startSprint).toHaveBeenCalledWith('sprint-planned');
    });
  });

  it('triggers AI Sprint Planning from Create Sprint modal', async () => {
    vi.mocked(sprintService.planSprintWithAi).mockResolvedValue({
      sprintName: 'Sprint 1: Cimientos y MVP de Validación',
      sprintGoal: 'Desplegar la infraestructura núcleo y validar la arquitectura.',
      recommendedTaskIds: ['task-1'],
      recommendedTaskTitles: ['Diseñar esquema relacional y aislamiento multi-tenant'],
      suggestedDurationDays: 14,
      totalEstimatedHours: 32,
      rationale: 'Prioriza componentes de arquitectura para desbloquear el desarrollo posterior.',
    });

    renderSprintsPage();

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /Nuevo Sprint/i });
      expect(btn).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /Nuevo Sprint/i }));

    await waitFor(() => {
      expect(screen.getByText('AI Sprint Planner')).toBeInTheDocument();
    });

    const aiBtn = screen.getByRole('button', { name: /Sugerir Plan IA/i });
    fireEvent.click(aiBtn);

    await waitFor(() => {
      expect(sprintService.planSprintWithAi).toHaveBeenCalledWith('proj-1');
      expect(screen.getByDisplayValue('Sprint 1: Cimientos y MVP de Validación')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Desplegar la infraestructura núcleo y validar la arquitectura.')).toBeInTheDocument();
      expect(screen.getByText(/Plan sugerido por Agile Coach IA/i)).toBeInTheDocument();
    });
  });
});
