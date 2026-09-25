import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrendsPage } from '../pages/TrendsPage';
import { trendService } from '../services/trendService';

vi.mock('../services/trendService', () => ({
  trendService: {
    getTrends: vi.fn(),
    getTrendsForMe: vi.fn(),
    markRelevant: vi.fn(),
    dismissRelevance: vi.fn(),
    evaluateWithAi: vi.fn(),
    triggerSync: vi.fn(),
  },
}));

const mockTrendsResponse = {
  items: [
    {
      id: 'trend-1',
      sourceCode: 'GITHUB' as const,
      sourceName: 'GitHub',
      externalId: 'vllm-project/vllm',
      title: 'vLLM Serving Engine',
      description: 'High-throughput LLM serving engine with PagedAttention.',
      url: 'https://github.com/vllm-project/vllm',
      score: 92,
      tags: ['inference', 'serving'],
      metadata: { stars: 32000 },
      fetchedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isRelevantForTenant: false,
    },
  ],
  page: 0,
  size: 50,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
};

const mockForMeResponse = {
  items: [],
  page: 0,
  size: 50,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
};

describe('TrendsPage Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.mocked(trendService.getTrends).mockResolvedValue(mockTrendsResponse);
    vi.mocked(trendService.getTrendsForMe).mockResolvedValue(mockForMeResponse);
  });

  it('renders page title and trend cards correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TrendsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Explorador de Tendencias & Señales')).toBeInTheDocument();
    expect(screen.getByText('Todas las Tendencias')).toBeInTheDocument();
    expect(screen.getByText('Estratégicas para mi Empresa')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('vLLM Serving Engine')).toBeInTheDocument();
      expect(screen.getByText('92')).toBeInTheDocument();
    });
  });
});
