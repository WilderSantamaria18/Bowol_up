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
  },
};

vi.mock('../services/dashboardService', () => ({
  dashboardService: {
    getSummary: vi.fn(() => Promise.resolve(mockSummary)),
  },
}));

vi.mock('@/features/trends/services/trendService', () => ({
  trendService: {
    triggerSync: vi.fn(() => Promise.resolve({ created: 5, updated: 0, total: 5 })),
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
  });
});
