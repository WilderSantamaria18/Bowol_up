import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocialPage } from '../pages/SocialPage';
import { socialService } from '../services/socialService';
import { brandService } from '@/features/brand/services/brandService';
import { SocialPost } from '../types';
import { BrandProfile } from '@/features/brand/types';

vi.mock('../services/socialService', () => ({
  socialService: {
    getPosts: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    publishPost: vi.fn(),
    deletePost: vi.fn(),
    generateContentWithAI: vi.fn(),
  },
}));

vi.mock('@/features/brand/services/brandService', () => ({
  brandService: {
    getBrandProfile: vi.fn(),
    saveBrandProfile: vi.fn(),
  },
}));

const mockBrand: BrandProfile = {
  id: 'brand-1',
  organizationId: 'org-1',
  brandName: 'BOWOL Intelligence',
  tagline: 'Autonomous Strategy Engine',
  brandVoiceTone: 'INNOVATIVE',
  targetAudience: 'Product Leaders & CTOs',
  primaryColor: '#EA580C',
  secondaryColor: '#10B981',
  accentColor: '#6366F1',
  fontHeading: 'Plus Jakarta Sans',
  fontBody: 'Inter',
  keyValues: ['Innovación', 'Transparencia', 'Velocidad'],
  doGuidelines: 'Usar tono propositivo y métricas reales',
  dontGuidelines: 'Evitar promesas vacías',
  createdAt: '2026-09-01T00:00:00Z',
};

const mockPosts: SocialPost[] = [
  {
    id: 'post-1',
    organizationId: 'org-1',
    channel: 'LINKEDIN',
    title: 'La era de la innovación autónoma',
    content: 'Descubre cómo la IA acelera las hipótesis de negocio...',
    status: 'DRAFT',
    predictedImpact: {
      reachEstimateMin: 2000,
      reachEstimateMax: 5000,
      engagementRate: 4.5,
      viralityScore: 75,
      sentiment: 'POSITIVE',
      bestTimeToPost: 'Martes 09:00 AM',
      strategicReasoning: 'Alta afinidad con la red profesional de LinkedIn',
    },
    mediaUrls: [],
    tags: ['AI', 'Strategy'],
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 'post-2',
    organizationId: 'org-1',
    channel: 'TWITTER_X',
    title: 'Hito clave alcanzado',
    content: 'Redujimos el ciclo de validación de 3 semanas a 48 horas.',
    status: 'PUBLISHED',
    predictedImpact: {
      reachEstimateMin: 1200,
      reachEstimateMax: 3000,
      engagementRate: 3.2,
      viralityScore: 60,
      sentiment: 'POSITIVE',
      bestTimeToPost: 'Miércoles 12:00 PM',
      strategicReasoning: 'Gancho directo para formato microblogging',
    },
    mediaUrls: [],
    tags: ['BuildInPublic'],
    createdAt: '2026-09-22T14:00:00Z',
  },
];

describe('SocialPage Component (Brand & Social Intelligence)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(socialService.getPosts).mockResolvedValue(mockPosts);
    vi.mocked(brandService.getBrandProfile).mockResolvedValue(mockBrand);
  });

  const renderComponent = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SocialPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders the header and the feed of strategic posts with impact metrics', async () => {
    renderComponent();

    expect(screen.getByText('Social & Brand Intelligence')).toBeInTheDocument();
    expect(screen.getByText(/Manual de identidad corporativa/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(socialService.getPosts).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('La era de la innovación autónoma')).toBeInTheDocument();
      expect(screen.getByText('Hito clave alcanzado')).toBeInTheDocument();
      expect(screen.getByText('75/100')).toBeInTheDocument();
    });
  });

  it('switches to the Brand Kit tab and displays visual identity controls', async () => {
    renderComponent();

    const brandTab = screen.getByRole('button', { name: /Kit de Marca/i });
    fireEvent.click(brandTab);

    await waitFor(() => {
      expect(screen.getByText('Kit de Identidad de Marca (Brand Profile)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('BOWOL Intelligence')).toBeInTheDocument();
      expect(screen.getByText('Paleta Cromática de Marca')).toBeInTheDocument();
    });
  });

  it('filters posts by channel', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'LinkedIn' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'LinkedIn' }));

    await waitFor(() => {
      expect(socialService.getPosts).toHaveBeenCalledWith(
        expect.objectContaining({ channel: 'LINKEDIN' })
      );
    });
  });

  it('publishes a draft post when clicking Marcar Publicado', async () => {
    vi.mocked(socialService.publishPost).mockResolvedValue({
      ...mockPosts[0],
      status: 'PUBLISHED',
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Marcar Publicado/i })).toBeInTheDocument();
    });

    const publishBtn = screen.getByRole('button', { name: /Marcar Publicado/i });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(socialService.publishPost).toHaveBeenCalledWith('post-1');
    });
  });

  it('opens and closes the manual post creation modal', async () => {
    renderComponent();

    const newPostBtn = screen.getByRole('button', { name: /Nueva Publicación/i });
    fireEvent.click(newPostBtn);

    expect(screen.getByRole('heading', { name: 'Nueva Publicación' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Reflexiones sobre la escalabilidad/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Reflexiones sobre la escalabilidad/i)).not.toBeInTheDocument();
    });
  });

  it('triggers AI Content Studio generation and allows adopting proposals', async () => {
    vi.mocked(socialService.generateContentWithAI).mockResolvedValue({
      topic: 'Lanzamiento de módulo de IA',
      proposals: [
        {
          channel: 'LINKEDIN',
          title: 'IA aplicada a decisiones estratégicas',
          content: 'Nuevo lanzamiento de BOWOL para optimizar el ciclo ágil.',
          tags: ['AI', 'Product'],
          predictedImpact: {
            reachEstimateMin: 3000,
            reachEstimateMax: 7000,
            engagementRate: 5.0,
            viralityScore: 82,
            sentiment: 'POSITIVE',
            bestTimeToPost: 'Jueves 09:30 AM',
            strategicReasoning: 'Excelente tracción para CTOs',
          },
        },
      ],
    });

    vi.mocked(socialService.createPost).mockResolvedValue({
      id: 'post-new-ai',
      organizationId: 'org-1',
      channel: 'LINKEDIN',
      title: 'IA aplicada a decisiones estratégicas',
      content: 'Nuevo lanzamiento de BOWOL para optimizar el ciclo ágil.',
      status: 'DRAFT',
      mediaUrls: [],
      tags: ['AI', 'Product'],
      createdAt: '2026-09-25T16:00:00Z',
    });

    renderComponent();

    // Open AI Modal
    const aiBtn = screen.getByRole('button', { name: /Generar con IA \(Studio\)/i });
    fireEvent.click(aiBtn);

    expect(screen.getByText('AI Content Studio')).toBeInTheDocument();

    // Fill topic
    const topicInput = screen.getByPlaceholderText(/Lanzamiento de nueva función de IA/i);
    fireEvent.change(topicInput, { target: { value: 'Lanzamiento de módulo de IA' } });

    // Submit AI generation
    const generateBtn = screen.getByRole('button', { name: /Generar Propuestas con IA/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(socialService.generateContentWithAI).toHaveBeenCalledWith(
        expect.objectContaining({ topic: 'Lanzamiento de módulo de IA' })
      );
    });

    // Verify generated proposal appeared
    await waitFor(() => {
      expect(screen.getByText('IA aplicada a decisiones estratégicas')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Guardar en Borradores/i })).toBeInTheDocument();
    });

    // Adopt proposal
    const adoptBtn = screen.getByRole('button', { name: /Guardar en Borradores/i });
    fireEvent.click(adoptBtn);

    await waitFor(() => {
      expect(socialService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'LINKEDIN',
          title: 'IA aplicada a decisiones estratégicas',
          status: 'DRAFT',
        })
      );
      expect(screen.getByText('Añadido al Feed')).toBeInTheDocument();
    });
  });
});
