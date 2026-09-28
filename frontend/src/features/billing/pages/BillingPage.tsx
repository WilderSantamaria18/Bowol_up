import React, { useEffect, useState } from 'react';
import { CreditCard, RefreshCw, CheckCircle2, Zap, Sparkles, Cpu, Layers, Bot } from 'lucide-react';
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

const AI_CREDIT_RATES = [
  { action: 'Evaluación y filtrado de Señal en Radar', cost: 5, icon: Cpu, desc: 'Clasificación de relevancia, sectores y fuentes' },
  { action: 'Generación y Síntesis de Matriz FODA', cost: 25, icon: Layers, desc: 'Análisis contextual de fortalezas y debilidades' },
  { action: 'Priorización Cuantitativa RICE', cost: 15, icon: Sparkles, desc: 'Cálculo de alcance, impacto, confianza y esfuerzo' },
  { action: 'Descomposición Ágil de Proyecto en Épicas', cost: 40, icon: Zap, desc: 'Planificación y desglose de tareas con IA' },
  { action: 'Generación de Propuestas de Contenido Social', cost: 20, icon: Bot, desc: 'Adaptación a tono de marca y predicción de impacto' },
  { action: 'Interacción con Asistente BOWOL Copilot', cost: 10, icon: Sparkles, desc: 'Consultoría estratégica interactiva en tiempo real' },
];

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
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Page Header Liquid Glass */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/80 to-zinc-950 p-6 sm:p-8 border border-zinc-200/90 dark:border-white/[0.08] shadow-lg dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-500/15 border border-orange-500/25 text-orange-400">
                <CreditCard className="w-5 h-5" strokeWidth={1.5} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 font-mono">
                Suscripción & Facturación
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight font-display">
              Suscripción y Facturación
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Administra los planes de tu organización, cuotas de créditos IA predecibles y trazabilidad de facturas para tu equipo.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <Alert variant="error" detail={error} />
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
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

      {/* AI Credits Consumption Reference (Explainability) */}
      <div className="rounded-3xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-2xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
            <Zap className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Transparencia en el Consumo de AI Credits
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tarifas fijas y predecibles por cada operación de inteligencia artificial ejecutada en el ciclo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {AI_CREDIT_RATES.map((rate, rIdx) => {
            const Icon = rate.icon;
            return (
              <div
                key={rIdx}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/70 dark:border-white/5 space-y-1.5 transition-colors hover:border-orange-500/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" strokeWidth={1.5} />
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                      {rate.action}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shrink-0">
                    {rate.cost} créditos
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {rate.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plans Section */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2 font-display">
              Planes Disponibles
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Escoge el plan que mejor se adapte al ritmo de crecimiento y necesidades de tu equipo.
            </p>
          </div>

          {/* Billing Cycle Switcher with Light/Dark contrast */}
          <div className="flex items-center self-start sm:self-auto bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setSelectedCycle('MONTHLY')}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCycle === 'MONTHLY'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Facturación Mensual
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('ANNUAL')}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedCycle === 'ANNUAL'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <span>Facturación Anual</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/30">
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
