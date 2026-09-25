import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { OpportunitiesPage } from '../pages/OpportunitiesPage';
import { opportunityService } from '../services/opportunityService';
import { swotService } from '@/features/swot/services/swotService';
import { OpportunityBoard } from '../types';

vi.mock('../services/opportunityService', () => ({
  opportunityService: {
    getBoard: vi.fn(),
    getOpportunityById: vi.fn(),
    generateFromSwot: vi.fn(),
    createOpportunity: vi.fn(),
    updateOpportunity: vi.fn(),
    updateStatus: vi.fn(),
    deleteOpportunity: vi.fn(),
  },
}));

vi.mock('@/features/swot/services/swotService', () => ({
  swotService: {
    getLatestSwot: vi.fn(),
  },
}));

vi.mock('@/features/copilot/context/CopilotContext', () => ({
  useCopilot: () => ({
    isOpen: false,
    openCopilot: vi.fn(),
    closeCopilot: vi.fn(),
    activeThreadId: null,
    context: null,
  }),
}));

const mockBoard: OpportunityBoard = {
  IDENTIFIED: [
    {
      id: 'opp-1',
      organizationId: 'org-1',
      title: 'Asistente IA para atención de soporte',
      description: 'Automatiza la resolución de tickets de primer nivel',
      reachScore: 80,
      impactScore: 90,
      confidenceScore: 70,
      effortScore: 50,
      priorityScore: 100.8,
      status: 'IDENTIFIED',
      evidence: ['trend-1'],
      createdAt: new Date().toISOString(),
    },
  ],
  EVALUATING: [],
  APPROVED: [
    {
      id: 'opp-2',
      organizationId: 'org-1',
      title: 'Integración con Stripe Billing',
      description: 'Facturación automática recurrente',
      reachScore: 70,
      impactScore: 80,
      confidenceScore: 80,
      effortScore: 30,
      priorityScore: 149.33,
      status: 'APPROVED',
      evidence: [],
      createdAt: new Date().toISOString(),
    },
  ],
  REJECTED: [],
  CONVERTED: [],
};

const mockSwot = {
  id: 'swot-1',
  organizationId: 'org-1',
  profileSnapshot: {},
  strengths: [],
  weaknesses: [],
  opportunities: [],
  threats: [],
  generatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

describe('OpportunitiesPage Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
    vi.mocked(opportunityService.getBoard).mockResolvedValue(mockBoard);
    vi.mocked(swotService.getLatestSwot).mockResolvedValue(mockSwot as any);
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OpportunitiesPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

  it('renders Kanban board with 5 status columns and cards', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Estrategia & Oportunidades RICE')).toBeInTheDocument();
      expect(screen.getByTestId('column-IDENTIFIED')).toBeInTheDocument();
      expect(screen.getByTestId('column-EVALUATING')).toBeInTheDocument();
      expect(screen.getByTestId('column-APPROVED')).toBeInTheDocument();
      expect(screen.getByTestId('column-REJECTED')).toBeInTheDocument();
      expect(screen.getByTestId('column-CONVERTED')).toBeInTheDocument();
    });

    expect(screen.getByText('Asistente IA para atención de soporte')).toBeInTheDocument();
    expect(screen.getByText('RICE 100.8')).toBeInTheDocument();
    expect(screen.getByText('Integración con Stripe Billing')).toBeInTheDocument();
    expect(screen.getByText('RICE 149.3')).toBeInTheDocument();
  });

  it('generates opportunities from SWOT when clicking button', async () => {
    vi.mocked(opportunityService.generateFromSwot).mockResolvedValue({
      generated: 2,
      opportunities: [],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Generar desde FODA')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Generar desde FODA'));

    await waitFor(() => {
      expect(opportunityService.generateFromSwot).toHaveBeenCalledWith('swot-1');
    });
  });

  it('advances opportunity status when clicking right button', async () => {
    vi.mocked(opportunityService.updateStatus).mockResolvedValue({
      ...mockBoard.IDENTIFIED[0],
      status: 'EVALUATING',
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Asistente IA para atención de soporte')).toBeInTheDocument();
    });

    const advanceBtns = screen.getAllByLabelText('Avanzar al siguiente estado');
    fireEvent.click(advanceBtns[0]);

    await waitFor(() => {
      expect(opportunityService.updateStatus).toHaveBeenCalledWith('opp-1', 'EVALUATING');
    });
  });

  it('deletes opportunity when clicking trash button', async () => {
    vi.mocked(opportunityService.deleteOpportunity).mockResolvedValue();

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Asistente IA para atención de soporte')).toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByLabelText('Eliminar oportunidad');
    fireEvent.click(deleteBtns[0]);

    await waitFor(() => {
      expect(opportunityService.deleteOpportunity).toHaveBeenCalledWith('opp-1');
    });
  });

  it('opens create modal and submits new opportunity', async () => {
    vi.mocked(opportunityService.createOpportunity).mockResolvedValue({
      id: 'opp-new',
      organizationId: 'org-1',
      title: 'Portal de autoservicio B2B',
      description: 'Facilita la gestión de licencias',
      reachScore: 70,
      impactScore: 70,
      confidenceScore: 70,
      effortScore: 50,
      priorityScore: 68.6,
      status: 'IDENTIFIED',
      evidence: [],
      createdAt: new Date().toISOString(),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Nueva Oportunidad')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Nueva Oportunidad'));

    expect(screen.getByText('Nueva Oportunidad Estratégica')).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText('Ej. Integración de checkout con pagos instantáneos');
    fireEvent.change(titleInput, { target: { value: 'Portal de autoservicio B2B' } });

    const submitBtn = screen.getByText('Guardar Oportunidad');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(opportunityService.createOpportunity).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Portal de autoservicio B2B',
          swotAnalysisId: 'swot-1',
        })
      );
    });
  });
});
