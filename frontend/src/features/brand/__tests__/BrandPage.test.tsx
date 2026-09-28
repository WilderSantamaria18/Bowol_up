import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrandPage } from '../pages/BrandPage';
import { brandService } from '../services/brandService';
import { BrandProfile } from '../types';

vi.mock('../services/brandService', () => ({
  brandService: {
    getBrandProfile: vi.fn(),
    saveBrandProfile: vi.fn(),
  },
}));

const mockBrandProfile: BrandProfile = {
  id: 'bp-1',
  organizationId: 'org-1',
  brandName: 'BOWOL Intelligence',
  tagline: 'Autonomous Strategy Engine',
  brandVoiceTone: 'INNOVATIVE',
  targetAudience: 'Directores de Estrategia e Innovación',
  primaryColor: '#EA580C',
  secondaryColor: '#10B981',
  accentColor: '#6366F1',
  fontHeading: 'Plus Jakarta Sans',
  fontBody: 'Inter',
  keyValues: ['Innovación', 'Rigor Cuantitativo', 'Velocidad'],
  doGuidelines: 'Usar lenguaje asertivo y métricas empíricas',
  dontGuidelines: 'Evitar jerga vacía y promesas no fundamentadas',
  createdAt: '2026-09-01T00:00:00Z',
};

describe('BrandPage Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
    vi.mocked(brandService.getBrandProfile).mockResolvedValue(mockBrandProfile);
    vi.mocked(brandService.saveBrandProfile).mockResolvedValue({
      ...mockBrandProfile,
      brandName: 'BOWOL Intelligence 2.0',
    });
  });

  it('renderiza la cabecera del Manual de Marca y los campos con los datos cargados', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <BrandPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Header y badges explicables
    expect(await screen.findByText('Manual de Marca & Voz (Brand Kit)')).toBeInTheDocument();
    expect(screen.getByText('Identidad & Comunicación')).toBeInTheDocument();
    expect(screen.getByText('Integrado en generación de contenido IA')).toBeInTheDocument();

    // Campos del formulario
    expect(screen.getByDisplayValue('BOWOL Intelligence')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Autonomous Strategy Engine')).toBeInTheDocument();
    expect(screen.getByText('Innovación')).toBeInTheDocument();
    expect(screen.getByText('Rigor Cuantitativo')).toBeInTheDocument();
  });

  it('permite modificar y guardar el perfil de marca', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <BrandPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await screen.findByText('Manual de Marca & Voz (Brand Kit)');

    const inputName = screen.getByDisplayValue('BOWOL Intelligence');
    fireEvent.change(inputName, { target: { value: 'BOWOL Intelligence 2.0' } });

    const submitBtn = screen.getByRole('button', { name: /Guardar Manual de Marca/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(brandService.saveBrandProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          brandName: 'BOWOL Intelligence 2.0',
        })
      );
    });

    expect(await screen.findByText('¡Manual de identidad y voz guardado exitosamente!')).toBeInTheDocument();
  });
});
