import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CopilotProvider, useCopilot } from '../context/CopilotContext';
import { CopilotDrawer } from '../components/CopilotDrawer';
import { copilotService } from '../services/copilotService';
import { AIConversation, ConversationDetail } from '../types';

vi.mock('../services/copilotService', () => ({
  copilotService: {
    getConversations: vi.fn(),
    getConversation: vi.fn(),
    createConversation: vi.fn(),
    sendMessage: vi.fn(),
    deleteConversation: vi.fn(),
  },
}));

const mockConversation: AIConversation = {
  id: 'conv-123',
  organizationId: 'org-1',
  userId: 'user-1',
  contextType: 'GENERAL',
  title: 'Consultoría Estratégica',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messageCount: 2,
};

const mockDetail: ConversationDetail = {
  conversation: mockConversation,
  messages: [
    {
      id: 1,
      role: 'USER',
      content: '¿Cómo podemos optimizar el coste de infraestructura?',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      role: 'ASSISTANT',
      content: `### DATO
Se ha observado una saturación de instancias dedicadas con picos de uso del 25%.

### ANÁLISIS
La sobreprovisión genera un sobrecoste evitable mediante contenedores elásticos.

### HIPÓTESIS
Migrar a infraestructura serverless recortaría un 40% del gasto mensual.

### RECOMENDACIÓN
Ejecutar un spike técnico de 1 semana en el entorno de staging.`,
      tokensUsed: 310,
      createdAt: new Date().toISOString(),
    },
  ],
};

const TestConsumer = () => {
  const { openCopilot } = useCopilot();
  return (
    <button onClick={() => openCopilot({ contextType: 'GENERAL', title: 'Consultoría Estratégica' })}>
      Abrir Test
    </button>
  );
};

describe('CopilotDrawer Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(copilotService.getConversations).mockResolvedValue({
      items: [mockConversation],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    vi.mocked(copilotService.getConversation).mockResolvedValue(mockDetail);
    vi.mocked(copilotService.createConversation).mockResolvedValue(mockConversation);
    vi.mocked(copilotService.sendMessage).mockResolvedValue({
      id: 3,
      role: 'ASSISTANT',
      content: 'Respuesta generada',
      tokensUsed: 150,
      createdAt: new Date().toISOString(),
    });
  });

  it('renders messages and structured strategic blocks when opened', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CopilotProvider>
          <TestConsumer />
          <CopilotDrawer />
        </CopilotProvider>
      </QueryClientProvider>
    );

    // Click trigger
    fireEvent.click(screen.getByText('Abrir Test'));

    await waitFor(() => {
      expect(screen.getByText('Consultoría Estratégica')).toBeInTheDocument();
      expect(screen.getByText('¿Cómo podemos optimizar el coste de infraestructura?')).toBeInTheDocument();
      expect(screen.getByText('Dato Observable')).toBeInTheDocument();
      expect(screen.getByText(/Se ha observado una saturación/i)).toBeInTheDocument();
      expect(screen.getByText('Análisis Estratégico')).toBeInTheDocument();
      expect(screen.getByText('Hipótesis Proyectada')).toBeInTheDocument();
      expect(screen.getByText('Recomendación Táctica (1-4 semanas)')).toBeInTheDocument();
      expect(screen.getByText(/310 tokens/i)).toBeInTheDocument();
    });
  });

  it('allows typing and sending a message', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CopilotProvider>
          <TestConsumer />
          <CopilotDrawer />
        </CopilotProvider>
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByText('Abrir Test'));

    await waitFor(() => {
      expect(screen.getByText('Consultoría Estratégica')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Haz una pregunta estratégica/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Haz una pregunta estratégica/i);
    fireEvent.change(textarea, { target: { value: '¿Cuál es el siguiente paso?' } });

    const sendBtn = screen.getByLabelText('Enviar mensaje');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(copilotService.sendMessage).toHaveBeenCalledWith(
        'conv-123',
        { content: '¿Cuál es el siguiente paso?' }
      );
    });
  });
});
