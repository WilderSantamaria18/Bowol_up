import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TaskBoardPage } from '../pages/TaskBoardPage';
import { taskService } from '../services/taskService';
import { projectService } from '@/features/projects/services/projectService';
import { TaskBoardData } from '../types';

vi.mock('../services/taskService', () => ({
  taskService: {
    getBoard: vi.fn(),
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTaskStatus: vi.fn(),
    deleteTask: vi.fn(),
    decomposeProject: vi.fn(),
  },
}));

vi.mock('@/features/projects/services/projectService', () => ({
  projectService: {
    getProjects: vi.fn(),
    getProjectSprints: vi.fn(),
    createProject: vi.fn(),
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

const mockBoard: TaskBoardData = {
  BACKLOG: [
    {
      id: 'task-1',
      projectId: 'proj-1',
      title: 'Diseñar arquitectura multi-tenant',
      description: 'Configurar RLS y filtros JPA',
      status: 'BACKLOG',
      priority: 'HIGH',
      estimateHours: 8,
      position: 1000,
      createdAt: new Date().toISOString(),
    },
  ],
  TODO: [
    {
      id: 'task-2',
      projectId: 'proj-1',
      title: 'Crear endpoints REST de tareas',
      description: 'Endpoints CRUD con Spring Boot',
      status: 'TODO',
      priority: 'MEDIUM',
      estimateHours: 12,
      position: 2000,
      createdAt: new Date().toISOString(),
    },
  ],
  IN_PROGRESS: [],
  REVIEW: [],
  DONE: [
    {
      id: 'task-3',
      projectId: 'proj-1',
      title: 'Configurar base de datos PostgreSQL',
      status: 'DONE',
      priority: 'LOW',
      estimateHours: 4,
      position: 3000,
      createdAt: new Date().toISOString(),
    },
  ],
  CANCELED: [],
};

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('TaskBoardPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projectService.getProjects).mockResolvedValue({
      items: [mockProject],
      totalElements: 1,
    });
    vi.mocked(projectService.getProjectSprints).mockResolvedValue([]);
    vi.mocked(taskService.getBoard).mockResolvedValue(mockBoard);
  });

  it('renders the Kanban board with columns and tasks', async () => {
    renderWithProviders(<TaskBoardPage />);

    // Wait for project name to display
    await waitFor(() => {
      expect(screen.getByText('Plataforma BOWOL v2')).toBeInTheDocument();
    });

    // Check columns
    expect(screen.getByTestId('task-column-BACKLOG')).toBeInTheDocument();
    expect(screen.getByTestId('task-column-TODO')).toBeInTheDocument();
    expect(screen.getByTestId('task-column-IN_PROGRESS')).toBeInTheDocument();
    expect(screen.getByTestId('task-column-REVIEW')).toBeInTheDocument();
    expect(screen.getByTestId('task-column-DONE')).toBeInTheDocument();

    // Check task cards with waitFor for async board fetch
    await waitFor(() => {
      expect(screen.getByText('Diseñar arquitectura multi-tenant')).toBeInTheDocument();
      expect(screen.getByText('Crear endpoints REST de tareas')).toBeInTheDocument();
      expect(screen.getByText('Configurar base de datos PostgreSQL')).toBeInTheDocument();
    });
  });

  it('opens and closes the create task modal and creates a task', async () => {
    vi.mocked(taskService.createTask).mockResolvedValue({
      id: 'task-new',
      projectId: 'proj-1',
      title: 'Nueva Tarea de Prueba',
      status: 'BACKLOG',
      priority: 'HIGH',
      estimateHours: 6,
      position: 4000,
      createdAt: new Date().toISOString(),
    });

    renderWithProviders(<TaskBoardPage />);

    await waitFor(() => {
      expect(screen.getByText('Nueva Tarea')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Nueva Tarea'));
    expect(screen.getByText('Nueva Tarea de Backlog')).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/Implementar autenticación/i);
    fireEvent.change(titleInput, { target: { value: 'Nueva Tarea de Prueba' } });

    const submitBtn = screen.getByRole('button', { name: /Crear Tarea/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(taskService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'proj-1',
          title: 'Nueva Tarea de Prueba',
        })
      );
    });
  });

  it('moves task to another column when advancing status', async () => {
    vi.mocked(taskService.updateTaskStatus).mockResolvedValue({
      id: 'task-1',
      projectId: 'proj-1',
      title: 'Diseñar arquitectura multi-tenant',
      status: 'TODO',
      priority: 'HIGH',
      position: 1000,
      createdAt: new Date().toISOString(),
    });

    renderWithProviders(<TaskBoardPage />);

    await waitFor(() => {
      expect(screen.getByText('Diseñar arquitectura multi-tenant')).toBeInTheDocument();
    });

    // Advance task-1 from BACKLOG to TODO
    const advanceButton = screen.getByTitle('Mover a TODO');
    fireEvent.click(advanceButton);

    await waitFor(() => {
      expect(taskService.updateTaskStatus).toHaveBeenCalledWith('task-1', 'TODO');
    });
  });

  it('triggers AI Backlog Decomposer from the modal', async () => {
    vi.mocked(taskService.decomposeProject).mockResolvedValue({
      epicTitle: 'Arquitectura Núcleo',
      epicObjective: 'Desplegar capacidades base',
      totalEstimatedHours: 42,
      generatedTasksCount: 4,
      tasks: [
        {
          id: 'ai-task-1',
          projectId: 'proj-1',
          title: 'Diseñar esquema relacional y aislamiento multi-tenant',
          status: 'BACKLOG',
          priority: 'HIGH',
          estimateHours: 8,
          position: 1000,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    renderWithProviders(<TaskBoardPage />);

    await waitFor(() => {
      expect(screen.getByText('Descomponer con IA')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Descomponer con IA'));
    expect(screen.getByText('AI Backlog Decomposer')).toBeInTheDocument();

    const generateBtn = screen.getByRole('button', { name: /Generar Backlog con IA/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(taskService.decomposeProject).toHaveBeenCalledWith('proj-1');
      expect(screen.getByText('Backlog Generado Exitosamente')).toBeInTheDocument();
      expect(screen.getByText('Arquitectura Núcleo')).toBeInTheDocument();
    });
  });
});
