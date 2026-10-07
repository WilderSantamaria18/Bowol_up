/**
 * Contrato de facturación alineado con el backend (com.bowol.subscription.dto).
 * Los planes se identifican por su id de catálogo ('FREE', 'PRO', 'BUSINESS').
 */
export type PlanKey = 'FREE' | 'PRO' | 'BUSINESS';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';
export type PaymentGateway = 'STRIPE' | 'MERCADOPAGO' | 'MOCK_STRIPE';
export type InvoiceStatus = 'PAID' | 'PENDING' | 'FAILED';

/** Mínimo de créditos por compra que acepta el backend (BuyCreditsRequest). */
export const MIN_CREDITS_PACK = 500;
/** Precio por crédito adicional que aplica el backend (USD). */
export const CREDIT_PRICE_USD = 0.01;

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceUsdMonthly: number;
  aiCreditsMonthly: number;
  maxProjects: number;
  maxMembers: number;
  features: string[];
  isActive: boolean;
}

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  aiCreditsTotal: number;
  aiCreditsUsed: number;
  aiCreditsRemaining: number;
  usagePercentage: number;
  paymentGateway?: PaymentGateway | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface BillingInvoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  amountUsd: number;
  status: InvoiceStatus;
  planName: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  pdfUrl?: string | null;
  createdAt: string;
}

export interface UpgradeSubscriptionPayload {
  planId: string;
  paymentGateway?: PaymentGateway;
}

export interface BuyCreditsPayload {
  credits: number;
}
