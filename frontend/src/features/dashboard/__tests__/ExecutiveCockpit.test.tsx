import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ExecutiveCockpit } from '../components/ExecutiveCockpit';
import { DashboardSummary } from '../types';

vi.mock('@/features/auth/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Alonso Founder', email: 'alonso@startup.io' },
    organization: { id: 'org-1', name: 'AI Innovations Labs', slug: 'ai-labs' },
    isAuthenticated: true,
  }),
}));

vi.mock('@/features/copilot/context/CopilotContext', () => ({
  useCopilot: () => ({
    openCopilot: vi.fn(),
  }),
}));

const mockSummary: DashboardSummary = {
  organization: {
    id: 'org-1',
    name: 'AI Innovations Labs',
    slug: 'ai-labs',
    plan: 'PRO',
    memberCount: 5,
  },
  maturity: {
    digitalMaturity: 85,
    aiMaturity: 60,
    stage: 'AVANZADO',
    onboardingCompleted: true,
  },
  trends: {
    totalGlobalTrends: 12,
    evaluatedTrendsCount: 4,
    topTrends: [
      {
        id: 'trend-1',
        title: 'Autonomous Code Refactoring Agents',
        score: 95,
        source: 'GITHUB',
        url: 'https://github.com/example/refactor-agent',
        tags: ['ai-agents', 'devops'],
        relevanceScore: 90,
      },
    ],
  },
  strategy: {
    swotCount: 1,
    opportunitiesCount: 6,
    opportunitiesBacklog: 4,
    opportunitiesPrioritized: 2,
    averageRiceScore: 78.5,
  },
  execution: {
    activeProjectsCount: 2,
    activeSprint: {
      id: 'sprint-1',
      name: 'Sprint 1 — Core Intelligence Engine',
      goal: 'Completar evaluador de tendencias',
      status: 'ACTIVE',
      totalTasks: 8,
      completedTasks: 6,
      progressPercent: 75,
    },
    totalTasksCount: 15,
    completedTasksCount: 10,
  },
  briefing: {
    headline: 'Briefing Estratégico Ejecutivo',
    highlights: [
      'Se detectaron 4 señales relevantes para tu sector.',
      '2 oportunidades superaron el umbral de prioridad RICE.',
      'Sprint activo al 75% de avance.',
    ],
    generatedAt: '2026-09-28T18:00:00Z',
  },
  healthScore: {
    overallScore: 82,
    executionScore: 75,
    strategyScore: 80,
    marketScore: 85,
    maturityScore: 73,
    statusLabel: 'OPTIMAL',
    explanation: 'Score ponderado de ejecución, estrategia, mercado y madurez.',
    formulaVariables: {
      completedTasks: 10,
      totalTasks: 15,
      activeSprintProgress: 75,
      approvedOpportunities: 2,
      totalOpportunities: 6,
      evaluatedTrends: 4,
      totalGlobalTrends: 12,
      digitalMaturity: 85,
      aiMaturity: 60,
    },
  },
};

const mockActivities = [
  {
    id: 'act-1',
    action: 'CREATE_OPPORTUNITY',
    entityType: 'OPPORTUNITY',
    entityId: 'opp-1',
    description: 'Nueva oportunidad RICE agregada al radar',
    actorEmail: 'alonso@startup.io',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'act-2',
    action: 'COMPLETE_TASK',
    entityType: 'TASK',
    entityId: 'task-10',
    description: 'Tarea finalizada en Sprint activo',
    actorEmail: 'dev@startup.io',
    createdAt: new Date().toISOString(),
  },
];

vi.mock('../services/dashboardService', () => ({
  dashboardService: {
    getSummary: vi.fn(() => Promise.resolve(mockSummary)),
    getActivity: vi.fn(() => Promise.resolve(mockActivities)),
    getHealth: vi.fn(() => Promise.resolve(mockSummary.healthScore)),
    getBrief: vi.fn(() => Promise.resolve(mockSummary.briefing)),
  },
}));

vi.mock('@/features/trends/services/trendService', () => ({
  trendService: {
    triggerSync: vi.fn(() => Promise.resolve({ created: 5, updated: 0, total: 5 })),
  },
}));

vi.mock('@/features/swot/services/swotService', () => ({
  swotService: {
    getLatestSwot: vi.fn(() =>
      Promise.resolve({
        id: 'swot-1',
        strengths: [{ id: 's1', text: 'Infraestructura analítica' }],
        opportunities: [{ id: 'o1', text: 'Expansión Enterprise' }],
        weaknesses: [{ id: 'w1', text: 'Onboarding' }],
        threats: [{ id: 't1', text: 'Comoditización' }],
      })
    ),
  },
}));

vi.mock('@/features/hypotheses/services/hypothesisService', () => ({
  hypothesisService: {
    getHypotheses: vi.fn(() => Promise.resolve([])),
  },
}));

describe('ExecutiveCockpit Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it('renderiza correctamente el Cockpit Ejecutivo con indicadores y métricas', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ExecutiveCockpit />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Esperar a que se resuelva la consulta
    expect(await screen.findByText('Visión Estratégica')).toBeInTheDocument();
    expect(screen.getByText('AI Innovations Labs')).toBeInTheDocument();

    // Validar Briefing Ejecutivo y Salud del Negocio
    expect(screen.getByText('Briefing Estratégico Ejecutivo')).toBeInTheDocument();
    expect(screen.getByText('Se detectaron 4 señales relevantes para tu sector.')).toBeInTheDocument();
    expect(screen.getByText('Salud del Negocio')).toBeInTheDocument();
    expect(screen.getByText('82')).toBeInTheDocument();

    // Validar Ciclo de Trazabilidad Estratégica
    expect(screen.getByText('Ciclo de Trazabilidad Estratégica')).toBeInTheDocument();
    expect(screen.getByText('Señal')).toBeInTheDocument();
    expect(screen.getByText('Experimento')).toBeInTheDocument();

    // Validar indicadores
    expect(screen.getByText('Autonomous Code Refactoring Agents')).toBeInTheDocument();
    expect(screen.getByText('Sprint 1 — Core Intelligence Engine')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Sincronizar')).toBeInTheDocument();

    // Validar Actividad Reciente del Ciclo
    expect(await screen.findByText('Actividad Reciente del Ciclo')).toBeInTheDocument();
    expect(screen.getByText('Nueva oportunidad RICE agregada al radar')).toBeInTheDocument();
  });

  it('abre el modal de explicabilidad matemática al hacer click en Salud del Negocio', async () => {
    const { fireEvent } = await import('@testing-library/react');
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ExecutiveCockpit />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Ver desglose explicable')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Ver desglose explicable'));

    expect(await screen.findByTestId('business-health-modal')).toBeInTheDocument();
    expect(screen.getByText('Transparencia del BusinessHealthScore')).toBeInTheDocument();
    expect(screen.getByText('Score = (Ejecución × 0.30) + (Estrategia × 0.25) + (Mercado × 0.20) + (Madurez × 0.25)')).toBeInTheDocument();
    expect(screen.getByText('1. Ejecución Ágil (30%)')).toBeInTheDocument();
  });
});
