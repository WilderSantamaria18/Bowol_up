import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BillingPage } from '../pages/BillingPage';
import { billingService } from '../services/billingService';
import {
  SubscriptionPlan,
  OrganizationSubscription,
  BillingInvoice,
} from '../types';

vi.mock('../services/billingService', () => ({
  billingService: {
    getCurrentSubscription: vi.fn(),
    getPlans: vi.fn(),
    upgradeSubscription: vi.fn(),
    cancelSubscription: vi.fn(),
    getInvoices: vi.fn(),
    buyCredits: vi.fn(),
  },
}));

// Datos con la forma exacta de los DTO del backend (com.bowol.subscription.dto).
const mockPlans: SubscriptionPlan[] = [
  {
    id: 'FREE',
    name: 'Free Starter',
    description: 'Para profesionales y startups explorando la plataforma',
    priceUsdMonthly: 0,
    aiCreditsMonthly: 500,
    maxProjects: 3,
    maxMembers: 5,
    features: ['Matriz FODA dinámica'],
    isActive: true,
  },
  {
    id: 'PRO',
    name: 'Growth Pro',
    description: 'Para scaleups y equipos de producto con alta cadencia',
    priceUsdMonthly: 49,
    aiCreditsMonthly: 5000,
    maxProjects: 25,
    maxMembers: 20,
    features: ['Investigación de mercado profunda'],
    isActive: true,
  },
  {
    id: 'BUSINESS',
    name: 'Enterprise Scale',
    description: 'Para organizaciones consolidadas y agencias',
    priceUsdMonthly: 199,
    aiCreditsMonthly: 25000,
    maxProjects: -1,
    maxMembers: -1,
    features: ['Soporte prioritario'],
    isActive: true,
  },
];

const mockSubscription: OrganizationSubscription = {
  id: 'sub-1',
  organizationId: 'org-1',
  plan: mockPlans[0],
  status: 'ACTIVE',
  currentPeriodStart: '2026-09-01T00:00:00Z',
  currentPeriodEnd: '2026-10-01T00:00:00Z',
  aiCreditsTotal: 500,
  aiCreditsUsed: 100,
  aiCreditsRemaining: 400,
  usagePercentage: 20,
  paymentGateway: 'MOCK_STRIPE',
  cancelAtPeriodEnd: false,
  createdAt: '2026-09-01T00:00:00Z',
};

const mockInvoices: BillingInvoice[] = [
  {
    id: 'inv-1',
    organizationId: 'org-1',
    invoiceNumber: 'INV-2026-0001',
    amountUsd: 49.0,
    status: 'PAID',
    planName: 'Growth Pro',
    periodStart: '2026-09-01T00:00:00Z',
    periodEnd: '2026-10-01T00:00:00Z',
    pdfUrl: null,
    createdAt: '2026-09-01T00:00:00Z',
  },
];

const renderComponent = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <BillingPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('BillingPage Component (SaaS Subscriptions & Monetization)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(billingService.getCurrentSubscription).mockResolvedValue(mockSubscription);
    vi.mocked(billingService.getPlans).mockResolvedValue(mockPlans);
    vi.mocked(billingService.getInvoices).mockResolvedValue(mockInvoices);
  });

  it('renders current plan overview and AI credits gauge', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Suscripción y Facturación')).toBeInTheDocument();
      expect(screen.getAllByText('Free Starter')[0]).toBeInTheDocument();
      expect(screen.getByText('400 disponibles')).toBeInTheDocument();
      expect(screen.getByText('100 usados en este ciclo')).toBeInTheDocument();
    });
  });

  it('displays the three subscription plan cards', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Growth Pro').length).toBeGreaterThan(0);
      expect(screen.getByText('Enterprise Scale')).toBeInTheDocument();
      expect(screen.getByText('$49')).toBeInTheDocument();
      expect(screen.getByText('$199')).toBeInTheDocument();
    });
  });

  it('displays invoice history in the table', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('INV-2026-0001')).toBeInTheDocument();
      expect(screen.getByText('$49.00 USD')).toBeInTheDocument();
      expect(screen.getByText('Pagada')).toBeInTheDocument();
    });
  });

  it('opens upgrade modal and submits upgrade', async () => {
    const upgradedSub: OrganizationSubscription = {
      ...mockSubscription,
      plan: mockPlans[1],
      aiCreditsRemaining: 5000,
    };
    vi.mocked(billingService.upgradeSubscription).mockResolvedValue(upgradedSub);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Elegir Growth Pro')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Elegir Growth Pro'));

    await waitFor(() => {
      expect(screen.getByText('Mejorar al Plan Growth Pro')).toBeInTheDocument();
    });

    const submitBtn = screen.getByText(/Confirmar y Pagar/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(billingService.upgradeSubscription).toHaveBeenCalledWith({
        planId: 'PRO',
        paymentGateway: 'STRIPE',
      });
    });
  });

  it('opens buy credits modal and purchases credit pack', async () => {
    const updatedCreditsSub: OrganizationSubscription = {
      ...mockSubscription,
      aiCreditsTotal: 1500,
      aiCreditsRemaining: 1400,
    };
    vi.mocked(billingService.buyCredits).mockResolvedValue(updatedCreditsSub);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Comprar Paquete de Créditos')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Comprar Paquete de Créditos'));

    await waitFor(() => {
      expect(screen.getByText('Comprar Créditos IA')).toBeInTheDocument();
    });

    const buyBtn = screen.getByText(/Comprar por \$10.00 USD/i);
    fireEvent.click(buyBtn);

    await waitFor(() => {
      expect(billingService.buyCredits).toHaveBeenCalledWith({
        credits: 1000,
      });
    });
  });

  it('renders the AI Credits Consumption Reference Table with explainable rates', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Transparencia en el Consumo de AI Credits')).toBeInTheDocument();
      expect(screen.getByText('Evaluación y filtrado de Señal en Radar')).toBeInTheDocument();
      expect(screen.getByText('5 créditos')).toBeInTheDocument();
      expect(screen.getByText('Descomposición Ágil de Proyecto en Épicas')).toBeInTheDocument();
      expect(screen.getByText('40 créditos')).toBeInTheDocument();
    });
  });
});
