import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TrendDetailModal } from '../components/TrendDetailModal';
import { Trend, TrendRelevance } from '../types';

const mockTrend: Trend = {
  id: 'trend-456',
  sourceCode: 'GITHUB',
  sourceName: 'GitHub',
  externalId: 'langchain-ai/langchain',
  title: 'LangChain Framework',
  description: 'Building applications with LLMs through composability.',
  url: 'https://github.com/langchain-ai/langchain',
  score: 90,
  tags: ['llm', 'agents'],
  metadata: { stars: 85000 },
  fetchedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  isRelevantForTenant: false,
};

const mockAiRelevance: TrendRelevance = {
  id: 'rel-999',
  organizationId: 'org-111',
  trend: mockTrend,
  score: 94,
  aiSummary: 'Altamente recomendable para orquestar flujos de trabajo con agentes autónomos.',
  tags: ['agentes', 'orquestacion', 'automatizacion'],
  evaluatedAt: new Date().toISOString(),
  strategicAlignment: 'HIGH',
  recommendedActions: [
    'Prototipar pipeline de agentes en el sprint 4',
    'Integrar con almacén de memoria vectorial',
  ],
  tokensUsed: 420,
};

describe('TrendDetailModal Component', () => {
  it('renders modal details and triggers AI evaluation successfully', async () => {
    const handleSave = vi.fn();
    const handleDismiss = vi.fn();
    const handleEvaluateAi = vi.fn().mockResolvedValue(mockAiRelevance);

    render(
      <TrendDetailModal
        trend={mockTrend}
        isOpen={true}
        onClose={vi.fn()}
        onSaveRelevance={handleSave}
        onDismissRelevance={handleDismiss}
        onEvaluateWithAi={handleEvaluateAi}
      />
    );

    expect(screen.getByText('LangChain Framework')).toBeInTheDocument();
    expect(screen.getByText('Evaluación Estratégica con IA')).toBeInTheDocument();

    const evalBtn = screen.getByText('Evaluar con IA');
    fireEvent.click(evalBtn);

    expect(handleEvaluateAi).toHaveBeenCalledWith('trend-456');

    await waitFor(() => {
      expect(screen.getByText(/Alineación HIGH/i)).toBeInTheDocument();
      expect(screen.getByText(/Score: 94\/100/i)).toBeInTheDocument();
      expect(screen.getByText(/420 tokens/i)).toBeInTheDocument();
      expect(screen.getByText('Prototipar pipeline de agentes en el sprint 4')).toBeInTheDocument();
      expect(screen.getByText('Integrar con almacén de memoria vectorial')).toBeInTheDocument();
      expect(screen.getByText('#agentes')).toBeInTheDocument();
    });
  });
});
