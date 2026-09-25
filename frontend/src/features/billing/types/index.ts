export type PlanKey = 'FREE' | 'PRO' | 'BUSINESS';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'TRIALING';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';
export type PaymentGateway = 'STRIPE' | 'MERCADOPAGO' | 'MANUAL';
export type InvoiceStatus = 'DRAFT' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE';

export interface SubscriptionPlan {
  id: string;
  planKey: PlanKey;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  maxMonthlyCredits: number;
  maxProjects: number;
  maxSocialProfiles: number;
  unlimitedResearch: boolean;
  unlimitedCompetitors: boolean;
  hasApiAccess: boolean;
  hasDedicatedSupport: boolean;
  active: boolean;
}

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
  creditsBalance: number;
  creditsUsedThisCycle: number;
  externalSubscriptionId?: string | null;
}

export interface BillingInvoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  billingReason: string;
  paymentGateway: PaymentGateway;
  paidAt?: string | null;
  invoicePdfUrl?: string | null;
  createdAt: string;
}

export interface UpgradeSubscriptionPayload {
  planKey: PlanKey;
  billingCycle: BillingCycle;
  paymentGateway?: PaymentGateway;
  paymentMethodId?: string;
}

export interface BuyCreditsPayload {
  packSize: number;
  paymentGateway?: PaymentGateway;
  paymentMethodId?: string;
}
