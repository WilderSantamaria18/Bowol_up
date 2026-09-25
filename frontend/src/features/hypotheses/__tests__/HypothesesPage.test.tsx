import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { HypothesesPage } from '../pages/HypothesesPage';
import { hypothesisService } from '../services/hypothesisService';
import { experimentService } from '@/features/experiments/services/experimentService';
import { opportunityService } from '@/features/opportunities/services/opportunityService';
import { Hypothesis } from '../types';
import { Experiment } from '@/features/experiments/types';

vi.mock('../services/hypothesisService', () => ({
  hypothesisService: {
    getHypotheses: vi.fn(),
    createHypothesis: vi.fn(),
    updateHypothesis: vi.fn(),
    recordResult: vi.fn(),
    formulateFromOpportunity: vi.fn(),
    convertToProject: vi.fn(),
    deleteHypothesis: vi.fn(),
  },
}));

vi.mock('@/features/experiments/services/experimentService', () => ({
  experimentService: {
    getExperiments: vi.fn(),
    createExperiment: vi.fn(),
    updateExperiment: vi.fn(),
    updateStatus: vi.fn(),
    recordConclusion: vi.fn(),
    deleteExperiment: vi.fn(),
  },
}));

vi.mock('@/features/opportunities/services/opportunityService', () => ({
  opportunityService: {
    getBoard: vi.fn(),
  },
}));

const mockHypotheses: Hypothesis[] = [
  {
    id: 'hypo-1',
    organizationId: 'org-1',
    opportunityId: 'opp-1',
    statement: 'Creemos que ofrecer onboarding con IA aumentará la retención un 25%.',
    validationMethod: 'Test A/B en nuevos usuarios',
    successMetric: 'Retención D7',
    targetValue: '>= 25%',
    status: 'READY',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hypo-2',
    organizationId: 'org-1',
    opportunityId: 'opp-1',
    statement: 'Creemos que las clínicas pagarán una suscripción anual con 20% descuento.',
    validationMethod: 'Llamadas de preventa a 30 directores médicos',
    successMetric: 'Tasa de pre-ordenes confirmadas',
    targetValue: '>= 30%',
    status: 'VALIDATED',
    result: 'SUPPORTED',
    resultNotes: '11 de 30 clínicas aceptaron la oferta anticipada.',
    createdAt: new Date().toISOString(),
  },
];

const mockExperiments: Experiment[] = [
  {
    id: 'exp-1',
    organizationId: 'org-1',
    hypothesisId: 'hypo-1',
    name: 'Experimento A/B Onboarding Guiado',
    description: 'Dividir registros 50/50 entre flujo nuevo y tradicional',
    method: 'Split Testing Web',
    startDate: '2026-10-01',
    endDate: '2026-10-15',
    status: 'RUNNING',
    resultMetric: 'Retención D7',
    resultValue: '32%',
    createdAt: new Date().toISOString(),
  },
];

const mockOppBoard = {
  IDENTIFIED: [
    {
      id: 'opp-1',
      organizationId: 'org-1',
      title: 'Diagnóstico Inteligente en la Nube',
      description: 'Plataforma SaaS para clínicas',
      status: 'IDENTIFIED',
      priorityScore: 84.5,
      evidence: [],
      createdAt: new Date().toISOString(),
    },
  ],
  EVALUATING: [],
  APPROVED: [],
  REJECTED: [],
  CONVERTED: [],
};

const renderWithProviders = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <HypothesesPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('HypothesesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hypothesisService.getHypotheses).mockResolvedValue(mockHypotheses);
    vi.mocked(experimentService.getExperiments).mockResolvedValue(mockExperiments);
    vi.mocked(opportunityService.getBoard).mockResolvedValue(mockOppBoard as any);
  });

  it('renderiza el título, las pestañas y la lista de hipótesis', async () => {
    renderWithProviders();

    expect(screen.getByText('Experimentación & Validación')).toBeInTheDocument();
    expect(screen.getByText('Hipótesis de Negocio')).toBeInTheDocument();
    expect(screen.getByText('Experimentos Tácticos')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText('Creemos que ofrecer onboarding con IA aumentará la retención un 25%.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Creemos que las clínicas pagarán una suscripción anual con 20% descuento.')
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Test A/B en nuevos usuarios')).toBeInTheDocument();
    expect(screen.getByText('>= 25%')).toBeInTheDocument();
  });

  it('cambia a la pestaña de experimentos y visualiza los tests activos', async () => {
    renderWithProviders();

    const expTab = screen.getByText('Experimentos Tácticos');
    fireEvent.click(expTab);

    await waitFor(() => {
      expect(screen.getByText('Experimento A/B Onboarding Guiado')).toBeInTheDocument();
      expect(screen.getByText('Split Testing Web')).toBeInTheDocument();
    });
  });

  it('permite abrir el modal de formulación con IA y llamar al servicio', async () => {
    vi.mocked(hypothesisService.formulateFromOpportunity).mockResolvedValue({
      id: 'hypo-new',
      organizationId: 'org-1',
      opportunityId: 'opp-1',
      statement: 'Nueva hipótesis generada por IA',
      status: 'READY',
      createdAt: new Date().toISOString(),
    });

    renderWithProviders();

    await waitFor(() => {
      expect(
        screen.getByText('Creemos que ofrecer onboarding con IA aumentará la retención un 25%.')
      ).toBeInTheDocument();
    });

    const aiButton = screen.getByTestId('open-ai-formulate-modal');
    fireEvent.click(aiButton);

    await waitFor(() => {
      expect(screen.getByText('Formular Hipótesis con IA')).toBeInTheDocument();
      expect(screen.getAllByText('Diagnóstico Inteligente en la Nube')[0]).toBeInTheDocument();
    });

    const submitBtn = screen.getByTestId('submit-ai-formulate');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(hypothesisService.formulateFromOpportunity).toHaveBeenCalledWith('opp-1');
    });
  });

  it('permite registrar resultado SUPPORTED para una hipótesis', async () => {
    vi.mocked(hypothesisService.recordResult).mockResolvedValue({
      ...mockHypotheses[0],
      status: 'VALIDATED',
      result: 'SUPPORTED',
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Creemos que ofrecer onboarding con IA aumentará la retención un 25%.')).toBeInTheDocument();
    });

    const recordButtons = screen.getAllByRole('button', { name: /Registrar Resultado/i });
    fireEvent.click(recordButtons[0]);

    expect(screen.getByText('Registrar Conclusión de Hipótesis')).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /Guardar Resultado/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(hypothesisService.recordResult).toHaveBeenCalledWith('hypo-1', expect.objectContaining({
        result: 'SUPPORTED',
      }));
    });
  });

  it('convierte una hipótesis validada a proyecto y muestra el banner de confirmación', async () => {
    vi.mocked(hypothesisService.convertToProject).mockResolvedValue({
      id: 'proj-new',
      name: 'Proyecto Validado Clínicas',
      status: 'PLANNING',
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Convertir a Proyecto')).toBeInTheDocument();
    });

    const convertBtn = screen.getByRole('button', { name: /Convertir a Proyecto/i });
    fireEvent.click(convertBtn);

    await waitFor(() => {
      expect(hypothesisService.convertToProject).toHaveBeenCalledWith('hypo-2');
      expect(screen.getByText(/Proyecto creado exitosamente desde hipótesis validada/i)).toBeInTheDocument();
    });
  });
});
