import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectsPage } from '../pages/ProjectsPage';
import { projectService } from '../services/projectService';
import { opportunityService } from '@/features/opportunities/services/opportunityService';
import { Project } from '../types';

vi.mock('../services/projectService', () => ({
  projectService: {
    getProjects: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    decomposeProject: vi.fn(),
  },
}));

vi.mock('@/features/opportunities/services/opportunityService', () => ({
  opportunityService: {
    getBoard: vi.fn(),
  },
}));

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    organizationId: 'org-1',
    name: 'Agente Estratégico FODA',
    description: 'Generación autónoma de matrices estratégicas en tiempo real',
    status: 'ACTIVE',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    opportunityId: 'opp-101',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'proj-2',
    organizationId: 'org-1',
    name: 'Conector Enterprise SSO',
    description: 'SAML y OIDC para clientes corporativos',
    status: 'PLANNING',
    startDate: '2026-10-01',
    createdAt: '2026-09-10T10:00:00Z',
  },
];

const renderComponent = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ProjectsPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ProjectsPage Component (Fase 7 - Ejecución Ágil)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (projectService.getProjects as any).mockResolvedValue({
      items: mockProjects,
      totalElements: mockProjects.length,
    });
    (opportunityService.getBoard as any).mockResolvedValue({
      IDENTIFIED: [],
      EVALUATING: [],
      APPROVED: [
        { id: 'opp-101', title: 'Integración LLM en Streaming', status: 'APPROVED' },
      ],
      REJECTED: [],
      CONVERTED: [],
    });
  });

  it('renderiza la cabecera y el listado de proyectos con indicadores de trazabilidad', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Iniciativas & Proyectos')).toBeInTheDocument();
      expect(screen.getByText('Agente Estratégico FODA')).toBeInTheDocument();
      expect(screen.getByText('Conector Enterprise SSO')).toBeInTheDocument();
    });

    // Traceability badge for project born from opportunity
    expect(screen.getByText('Oportunidad RICE')).toBeInTheDocument();
  });

  it('permite filtrar proyectos por estado', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Agente Estratégico FODA')).toBeInTheDocument();
    });

    const planningTab = screen.getByRole('button', { name: 'Planificación' });
    fireEvent.click(planningTab);

    // Only planning project should be visible
    expect(screen.getByText('Conector Enterprise SSO')).toBeInTheDocument();
    expect(screen.queryByText('Agente Estratégico FODA')).not.toBeInTheDocument();
  });

  it('permite filtrar proyectos por texto de búsqueda', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Agente Estratégico FODA')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar proyectos...');
    fireEvent.change(searchInput, { target: { value: 'SSO' } });

    expect(screen.getByText('Conector Enterprise SSO')).toBeInTheDocument();
    expect(screen.queryByText('Agente Estratégico FODA')).not.toBeInTheDocument();
  });

  it('abre el modal de nueva iniciativa y envía el formulario', async () => {
    (projectService.createProject as any).mockResolvedValue({
      id: 'proj-new',
      name: 'Nueva Iniciativa de Prueba',
      status: 'PLANNING',
      createdAt: new Date().toISOString(),
    });

    renderComponent();

    const newBtn = screen.getByRole('button', { name: /Nueva Iniciativa/i });
    fireEvent.click(newBtn);

    await waitFor(() => {
      expect(screen.getByText('Nueva Iniciativa de Innovación')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Ej. Agente Autónomo de Análisis FODA/i);
    fireEvent.change(nameInput, { target: { value: 'Nueva Iniciativa de Prueba' } });

    const submitBtn = screen.getByRole('button', { name: 'Crear Iniciativa' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(projectService.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Nueva Iniciativa de Prueba',
        })
      );
    });
  });
});
