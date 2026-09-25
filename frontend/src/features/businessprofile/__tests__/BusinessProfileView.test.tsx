import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BusinessProfileView } from '../components/BusinessProfileView';
import { BusinessProfile } from '../types';

const mockProfile: BusinessProfile = {
  id: '0191a3f2-1111-7000-8000-000000000001',
  organizationId: 'org-123',
  industry: 'Fintech & Pagos',
  size: 'SMALL',
  market: 'Perú y Colombia',
  goals: [
    { text: 'Procesar 10k transacciones diarias', priority: 1 },
    { text: 'Certificación PCI-DSS', priority: 2 },
  ],
  problems: ['Fraude en pagos', 'Integraciones lentas'],
  tools: ['Stripe', 'PostgreSQL', 'Redis'],
  competitors: ['PayTech'],
  channels: ['API Directa', 'Partners'],
  digitalMaturity: 80,
  aiMaturity: 45,
  onboardingCompletedAt: '2026-01-15T12:00:00Z',
  createdAt: '2026-01-15T10:00:00Z',
};

describe('BusinessProfileView Component', () => {
  it('renderiza correctamente el resumen, objetivos y madurez', () => {
    render(<BusinessProfileView profile={mockProfile} />);

    expect(screen.getByText('Fintech & Pagos')).toBeInTheDocument();
    expect(screen.getByText('Perú y Colombia')).toBeInTheDocument();
    expect(screen.getByText('Procesar 10k transacciones diarias')).toBeInTheDocument();
    expect(screen.getByText('Fraude en pagos')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });
});
