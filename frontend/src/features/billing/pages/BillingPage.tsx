import React, { useEffect, useState } from 'react';
import { CreditCard, RefreshCw, CheckCircle2 } from 'lucide-react';
import { billingService } from '../services/billingService';
import {
  SubscriptionPlan,
  OrganizationSubscription,
  BillingInvoice,
  BillingCycle,
  PaymentGateway,
} from '../types';
import { SubscriptionOverviewCard } from '../components/SubscriptionOverviewCard';
import { PlanCard } from '../components/PlanCard';
import { InvoicesTable } from '../components/InvoicesTable';
import { UpgradePlanModal } from '../components/UpgradePlanModal';
import { BuyCreditsModal } from '../components/BuyCreditsModal';
import { Alert } from '@/components/ui/Alert';

export const BillingPage: React.FC = () => {
  const [subscription, setSubscription] = useState<OrganizationSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>('MONTHLY');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals state
  const [upgradePlanModal, setUpgradePlanModal] = useState<SubscriptionPlan | null>(null);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [subData, plansData, invoicesData] = await Promise.all([
        billingService.getCurrentSubscription(),
        billingService.getPlans(),
        billingService.getInvoices(),
      ]);
      setSubscription(subData);
      setPlans(plansData);
      setInvoices(invoicesData);
      if (subData?.billingCycle) {
        setSelectedCycle(subData.billingCycle);
      }
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string };
      setError(e.detail || e.message || 'Error al cargar los datos de facturación');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpgrade = async (
    planKey: SubscriptionPlan['planKey'],
    cycle: BillingCycle,
    gateway: PaymentGateway
  ) => {
    try {
      const updated = await billingService.upgradeSubscription({
        planKey,
        billingCycle: cycle,
        paymentGateway: gateway,
      });
      setSubscription(updated);
      setSuccessMessage(`¡Plan actualizado exitosamente a ${updated.plan.name}!`);
      setTimeout(() => setSuccessMessage(null), 5000);
      // Reload invoices
      const invs = await billingService.getInvoices();
      setInvoices(invs);
    } catch (err: unknown) {
      throw err;
    }
  };

  const handleBuyCredits = async (packSize: number, gateway: PaymentGateway) => {
    try {
      const updated = await billingService.buyCredits({
        packSize,
        paymentGateway: gateway,
      });
      setSubscription(updated);
      setSuccessMessage(`¡Añadidos ${packSize.toLocaleString()} créditos de IA exitosamente!`);
      setTimeout(() => setSuccessMessage(null), 5000);
      const invs = await billingService.getInvoices();
      setInvoices(invs);
    } catch (err: unknown) {
      throw err;
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar la renovación automática de tu suscripción? Mantendrás tus beneficios hasta el final del periodo facturado.')) {
      return;
    }

    setIsCancelling(true);
    try {
      const updated = await billingService.cancelSubscription();
      setSubscription(updated);
      setSuccessMessage('Renovación automática cancelada. Tu suscripción continuará activa hasta la fecha de expiración.');
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string };
      setError(e.detail || e.message || 'Error al cancelar la suscripción');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" strokeWidth={1.5} />
        <p className="text-sm text-zinc-400">Cargando información de suscripción y facturación...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-orange-500" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Suscripción y Facturación
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Administra los planes de tu organización, cuotas de créditos IA e historial de pagos.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <Alert variant="error" detail={error} />
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Overview Card */}
      {subscription && (
        <SubscriptionOverviewCard
          subscription={subscription}
          onUpgradeClick={() => {
            const nextPlan = plans.find((p) => p.planKey === (subscription.plan.planKey === 'FREE' ? 'PRO' : 'BUSINESS')) || plans[1];
            setUpgradePlanModal(nextPlan);
          }}
          onBuyCreditsClick={() => setIsBuyCreditsOpen(true)}
          onCancelClick={handleCancelSubscription}
          isCancelling={isCancelling}
        />
      )}

      {/* Plans Section */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Planes Disponibles
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Escoge el plan que mejor se adapte al ritmo de crecimiento y necesidades de tu equipo.
            </p>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center self-start sm:self-auto bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedCycle('MONTHLY')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCycle === 'MONTHLY'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Facturación Mensual
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('ANNUAL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedCycle === 'ANNUAL'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Facturación Anual</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                -15%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              billingCycle={selectedCycle}
              isCurrent={subscription?.plan.planKey === p.planKey}
              onSelect={(selected) => setUpgradePlanModal(selected)}
            />
          ))}
        </div>
      </div>

      {/* Invoices History */}
      <div className="pt-4">
        <InvoicesTable invoices={invoices} />
      </div>

      {/* Upgrade Modal */}
      {upgradePlanModal && (
        <UpgradePlanModal
          plan={upgradePlanModal}
          currentCycle={selectedCycle}
          isOpen={true}
          onClose={() => setUpgradePlanModal(null)}
          onConfirm={handleUpgrade}
        />
      )}

      {/* Buy Credits Modal */}
      <BuyCreditsModal
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
        onConfirm={handleBuyCredits}
      />
    </div>
  );
};
