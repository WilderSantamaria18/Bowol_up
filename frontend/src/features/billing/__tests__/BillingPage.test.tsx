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

const mockPlans: SubscriptionPlan[] = [
  {
    id: 'FREE',
    planKey: 'FREE',
    name: 'Free Starter',
    description: 'Para profesionales y startups explorando la plataforma',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'USD',
    maxMonthlyCredits: 500,
    maxProjects: 1,
    maxSocialProfiles: 1,
    unlimitedResearch: false,
    unlimitedCompetitors: false,
    hasApiAccess: false,
    hasDedicatedSupport: false,
    active: true,
  },
  {
    id: 'PRO',
    planKey: 'PRO',
    name: 'Growth Pro',
    description: 'Para scaleups y equipos de producto con alta cadencia',
    monthlyPrice: 49,
    annualPrice: 490,
    currency: 'USD',
    maxMonthlyCredits: 5000,
    maxProjects: 10,
    maxSocialProfiles: 5,
    unlimitedResearch: true,
    unlimitedCompetitors: true,
    hasApiAccess: false,
    hasDedicatedSupport: false,
    active: true,
  },
  {
    id: 'BUSINESS',
    planKey: 'BUSINESS',
    name: 'Enterprise Scale',
    description: 'Para organizaciones consolidadas y agencias',
    monthlyPrice: 199,
    annualPrice: 1990,
    currency: 'USD',
    maxMonthlyCredits: 25000,
    maxProjects: -1,
    maxSocialProfiles: -1,
    unlimitedResearch: true,
    unlimitedCompetitors: true,
    hasApiAccess: true,
    hasDedicatedSupport: true,
    active: true,
  },
];

const mockSubscription: OrganizationSubscription = {
  id: 'sub-1',
  organizationId: 'org-1',
  plan: mockPlans[0],
  status: 'ACTIVE',
  billingCycle: 'MONTHLY',
  currentPeriodStart: '2026-09-01T00:00:00Z',
  currentPeriodEnd: '2026-10-01T00:00:00Z',
  cancelAtPeriodEnd: false,
  canceledAt: null,
  creditsBalance: 400,
  creditsUsedThisCycle: 100,
  externalSubscriptionId: null,
};

const mockInvoices: BillingInvoice[] = [
  {
    id: 'inv-1',
    organizationId: 'org-1',
    invoiceNumber: 'INV-2026-0001',
    amount: 49.0,
    currency: 'USD',
    status: 'PAID',
    billingReason: 'Suscripción Growth Pro (MONTHLY)',
    paymentGateway: 'STRIPE',
    paidAt: '2026-09-01T00:00:00Z',
    invoicePdfUrl: null,
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
      expect(screen.getByText('Growth Pro')).toBeInTheDocument();
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
      creditsBalance: 5000,
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
        planKey: 'PRO',
        billingCycle: 'MONTHLY',
        paymentGateway: 'STRIPE',
      });
    });
  });

  it('opens buy credits modal and purchases credit pack', async () => {
    const updatedCreditsSub: OrganizationSubscription = {
      ...mockSubscription,
      creditsBalance: 1400,
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
        packSize: 1000,
        paymentGateway: 'STRIPE',
      });
    });
  });
});
