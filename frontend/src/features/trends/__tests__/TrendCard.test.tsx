import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TrendCard } from '../components/TrendCard';
import { Trend } from '../types';

const mockTrend: Trend = {
  id: 'trend-123',
  sourceCode: 'GITHUB',
  sourceName: 'GitHub',
  externalId: 'deepseek-ai/DeepSeek-V3',
  title: 'DeepSeek-V3 Architecture',
  description: 'An open-source mixture-of-experts LLM with state-of-the-art reasoning.',
  url: 'https://github.com/deepseek-ai/DeepSeek-V3',
  score: 95,
  tags: ['moe', 'llm', 'deepseek'],
  metadata: { stars: 52000, forks: 6400 },
  fetchedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  isRelevantForTenant: false,
};

describe('TrendCard Component', () => {
  it('renders trend title, score, source, and tags correctly', () => {
    const handleToggle = vi.fn();
    const handleDetails = vi.fn();

    render(
      <TrendCard
        trend={mockTrend}
        onToggleRelevance={handleToggle}
        onOpenDetails={handleDetails}
      />
    );

    expect(screen.getByText('DeepSeek-V3 Architecture')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('#moe')).toBeInTheDocument();
    expect(screen.getByText('52,000')).toBeInTheDocument();
  });

  it('triggers onToggleRelevance when bookmark button is clicked', () => {
    const handleToggle = vi.fn();
    const handleDetails = vi.fn();

    render(
      <TrendCard
        trend={mockTrend}
        onToggleRelevance={handleToggle}
        onOpenDetails={handleDetails}
      />
    );

    const bookmarkBtn = screen.getByLabelText('Marcar como relevante');
    fireEvent.click(bookmarkBtn);
    expect(handleToggle).toHaveBeenCalledWith(mockTrend);
  });

  it('triggers onOpenDetails when Detalles button is clicked', () => {
    const handleToggle = vi.fn();
    const handleDetails = vi.fn();

    render(
      <TrendCard
        trend={mockTrend}
        onToggleRelevance={handleToggle}
        onOpenDetails={handleDetails}
      />
    );

    const detailsBtn = screen.getByText('Detalles');
    fireEvent.click(detailsBtn);
    expect(handleDetails).toHaveBeenCalledWith(mockTrend);
  });

  it('triggers onEvaluateWithAi when Evaluar button is clicked', () => {
    const handleToggle = vi.fn();
    const handleDetails = vi.fn();
    const handleEvaluate = vi.fn();

    render(
      <TrendCard
        trend={mockTrend}
        onToggleRelevance={handleToggle}
        onOpenDetails={handleDetails}
        onEvaluateWithAi={handleEvaluate}
      />
    );

    const evaluateBtn = screen.getByLabelText('Evaluar con IA');
    fireEvent.click(evaluateBtn);
    expect(handleEvaluate).toHaveBeenCalledWith(mockTrend);
  });

  it('displays AI relevance summary snippet when present', () => {
    const evaluatedTrend: Trend = {
      ...mockTrend,
      isRelevantForTenant: true,
      relevanceScore: 88,
      relevanceSummary: 'Alineación táctica con arquitectura MoE interna.',
    };

    render(
      <TrendCard
        trend={evaluatedTrend}
        onToggleRelevance={vi.fn()}
        onOpenDetails={vi.fn()}
      />
    );

    expect(screen.getByText('Alineación táctica con arquitectura MoE interna.')).toBeInTheDocument();
    expect(screen.getByText('IA: 88')).toBeInTheDocument();
  });
});
