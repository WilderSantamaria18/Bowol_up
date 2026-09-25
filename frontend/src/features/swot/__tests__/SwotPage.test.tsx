import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SwotPage } from '../pages/SwotPage';
import { swotService } from '../services/swotService';
import { SwotAnalysis } from '../types';

vi.mock('../services/swotService', () => ({
  swotService: {
    getLatestSwot: vi.fn(),
    getSwotById: vi.fn(),
    generateSwot: vi.fn(),
    updateSwot: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
    getEvidence: vi.fn(),
    deleteSwot: vi.fn(),
  },
}));

// Mock CopilotContext
vi.mock('@/features/copilot/context/CopilotContext', () => ({
  useCopilot: () => ({
    isOpen: false,
    openCopilot: vi.fn(),
    closeCopilot: vi.fn(),
    activeThreadId: null,
    context: null,
  }),
}));

const mockSwot: SwotAnalysis = {
  id: 'swot-123',
  organizationId: 'org-123',
  profileSnapshot: {
    industry: 'Fintech',
    market: 'LATAM',
    size: 'SMALL',
    digitalMaturity: 80,
  },
  strengths: [
    { id: 's-1', text: 'Equipo técnico de alta velocidad', evidenceIds: [] },
  ],
  weaknesses: [
    { id: 'w-1', text: 'Presupuesto inicial ajustado', evidenceIds: [] },
  ],
  opportunities: [
    { id: 'o-1', text: 'Automatización de pagos recurrentes', evidenceIds: ['trend-99'] },
  ],
  threats: [
    { id: 't-1', text: 'Regulación financiera más estricta', evidenceIds: [] },
  ],
  summary: 'Diagnóstico favorable para acelerar producto mínimo viable.',
  aiProvider: 'openai',
  aiModelUsed: 'gpt-4o',
  generatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

describe('SwotPage Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('renders empty state when no SWOT exists and triggers AI generation', async () => {
    vi.mocked(swotService.getLatestSwot).mockRejectedValue(new Error('Not found'));
    vi.mocked(swotService.generateSwot).mockResolvedValue(mockSwot);

    render(
      <QueryClientProvider client={queryClient}>
        <SwotPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Aún no tienes una Matriz FODA activa')).toBeInTheDocument();
      expect(screen.getByText('Generar Primer FODA con IA')).toBeInTheDocument();
    });

    const generateBtn = screen.getByText('Generar Primer FODA con IA');
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(swotService.generateSwot).toHaveBeenCalledWith({
        includeTrends: true,
        maxTrends: 20,
      });
    });
  });

  it('renders 2x2 matrix and executive summary when SWOT exists', async () => {
    vi.mocked(swotService.getLatestSwot).mockResolvedValue(mockSwot);

    render(
      <QueryClientProvider client={queryClient}>
        <SwotPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Matriz FODA Dinámica')).toBeInTheDocument();
      expect(screen.getByText('Diagnóstico Estratégico Ejecutivo')).toBeInTheDocument();
      expect(screen.getByText('Diagnóstico favorable para acelerar producto mínimo viable.')).toBeInTheDocument();
    });

    // Check 4 quadrants
    expect(screen.getByTestId('quadrant-strengths')).toBeInTheDocument();
    expect(screen.getByTestId('quadrant-weaknesses')).toBeInTheDocument();
    expect(screen.getByTestId('quadrant-opportunities')).toBeInTheDocument();
    expect(screen.getByTestId('quadrant-threats')).toBeInTheDocument();

    // Check items
    expect(screen.getByText('Equipo técnico de alta velocidad')).toBeInTheDocument();
    expect(screen.getByText('Presupuesto inicial ajustado')).toBeInTheDocument();
    expect(screen.getByText('Automatización de pagos recurrentes')).toBeInTheDocument();
    expect(screen.getByText('Regulación financiera más estricta')).toBeInTheDocument();
  });

  it('adds an item to a quadrant', async () => {
    vi.mocked(swotService.getLatestSwot).mockResolvedValue(mockSwot);
    vi.mocked(swotService.addItem).mockResolvedValue({
      ...mockSwot,
      strengths: [
        ...mockSwot.strengths,
        { id: 's-2', text: 'Nueva fortaleza añadida', evidenceIds: [] },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SwotPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Equipo técnico de alta velocidad')).toBeInTheDocument();
    });

    // Find and click "Añadir elemento" in strengths quadrant
    const allAddBtns = screen.getAllByText('Añadir elemento');
    fireEvent.click(allAddBtns[0]);

    const textarea = screen.getByPlaceholderText('Añadir nuevo punto a fortalezas...');
    fireEvent.change(textarea, { target: { value: 'Nueva fortaleza añadida' } });

    const saveBtn = screen.getByText('Guardar');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(swotService.addItem).toHaveBeenCalledWith('swot-123', {
        quadrant: 'strengths',
        text: 'Nueva fortaleza añadida',
      });
    });
  });

  it('removes an item from a quadrant', async () => {
    vi.mocked(swotService.getLatestSwot).mockResolvedValue(mockSwot);
    vi.mocked(swotService.removeItem).mockResolvedValue({
      ...mockSwot,
      strengths: [],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SwotPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Equipo técnico de alta velocidad')).toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByLabelText('Eliminar elemento');
    fireEvent.click(deleteBtns[0]);

    await waitFor(() => {
      expect(swotService.removeItem).toHaveBeenCalledWith('swot-123', 's-1');
    });
  });

  it('opens and closes evidence modal', async () => {
    vi.mocked(swotService.getLatestSwot).mockResolvedValue(mockSwot);
    vi.mocked(swotService.getEvidence).mockResolvedValue([
      {
        id: 1,
        organizationId: 'org-123',
        entityType: 'SWOT',
        entityId: 'swot-123',
        trendId: 'trend-99',
        trendTitle: 'LLM Multi-Agent Orchestration',
        trendScore: 95,
        trendSource: 'GitHub',
        note: 'Señal fuerte de tracción',
        weight: 95,
        createdAt: new Date().toISOString(),
      },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <SwotPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Evidencias de Mercado')).toBeInTheDocument();
    });

    // Click button to open modal
    fireEvent.click(screen.getByText('Evidencias de Mercado'));

    await waitFor(() => {
      expect(screen.getByText('Evidencias de Mercado (Tendencias)')).toBeInTheDocument();
      expect(screen.getByText('LLM Multi-Agent Orchestration')).toBeInTheDocument();
      expect(screen.getByText('95/100')).toBeInTheDocument();
    });

    // Close modal
    const closeBtn = screen.getByLabelText('Cerrar modal');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Evidencias de Mercado (Tendencias)')).not.toBeInTheDocument();
  });
});
