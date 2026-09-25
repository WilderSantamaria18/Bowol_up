import { httpClient } from '@/services/http';
import {
  SubscriptionPlan,
  OrganizationSubscription,
  BillingInvoice,
  UpgradeSubscriptionPayload,
  BuyCreditsPayload,
} from '../types';

export const billingService = {
  async getCurrentSubscription(): Promise<OrganizationSubscription> {
    return httpClient.get('/subscriptions/current');
  },

  async getPlans(): Promise<SubscriptionPlan[]> {
    return httpClient.get('/subscriptions/plans');
  },

  async upgradeSubscription(payload: UpgradeSubscriptionPayload): Promise<OrganizationSubscription> {
    return httpClient.post('/subscriptions/upgrade', payload);
  },

  async cancelSubscription(): Promise<OrganizationSubscription> {
    return httpClient.post('/subscriptions/cancel');
  },

  async getInvoices(): Promise<BillingInvoice[]> {
    return httpClient.get('/subscriptions/invoices');
  },

  async buyCredits(payload: BuyCreditsPayload): Promise<OrganizationSubscription> {
    return httpClient.post('/subscriptions/buy-credits', payload);
  },
};
