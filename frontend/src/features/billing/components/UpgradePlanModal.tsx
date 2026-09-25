import React, { useState } from 'react';
import { X, Sparkles, CreditCard, ShieldCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { SubscriptionPlan, BillingCycle, PaymentGateway } from '../types';

interface UpgradePlanModalProps {
  plan: SubscriptionPlan;
  currentCycle: BillingCycle;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (planKey: SubscriptionPlan['planKey'], cycle: BillingCycle, gateway: PaymentGateway) => Promise<void>;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  plan,
  currentCycle,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [cycle, setCycle] = useState<BillingCycle>(currentCycle);
  const [gateway, setGateway] = useState<PaymentGateway>('STRIPE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const price = cycle === 'ANNUAL' ? plan.annualPrice : plan.monthlyPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm(plan.planKey, cycle, gateway);
      onClose();
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string };
      setError(e.detail || e.message || 'Error al procesar la actualización del plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <Sparkles className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Mejorar al Plan {plan.name}</h3>
              <p className="text-xs text-zinc-400">Desbloquea el máximo potencial de Bowol AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {error && (
          <div className="mt-4">
            <Alert variant="error" detail={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Cycle selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Ciclo de Facturación
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCycle('MONTHLY')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  cycle === 'MONTHLY'
                    ? 'border-orange-500 bg-orange-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="text-xs font-medium">Mensual</div>
                <div className="text-base font-bold text-white mt-0.5">${plan.monthlyPrice} / mes</div>
              </button>

              <button
                type="button"
                onClick={() => setCycle('ANNUAL')}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                  cycle === 'ANNUAL'
                    ? 'border-orange-500 bg-orange-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  -15% Descuento
                </span>
                <div className="text-xs font-medium">Anual</div>
                <div className="text-base font-bold text-white mt-0.5">${plan.annualPrice} / año</div>
              </button>
            </div>
          </div>

          {/* Payment Gateway */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Pasarela de Pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGateway('STRIPE')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  gateway === 'STRIPE'
                    ? 'border-orange-500 bg-orange-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
                  <span className="text-xs font-semibold">Stripe / Tarjeta</span>
                </div>
                {gateway === 'STRIPE' && <Check className="w-4 h-4 text-orange-400" />}
              </button>

              <button
                type="button"
                onClick={() => setGateway('MERCADOPAGO')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  gateway === 'MERCADOPAGO'
                    ? 'border-orange-500 bg-orange-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                  <span className="text-xs font-semibold">Mercado Pago</span>
                </div>
                {gateway === 'MERCADOPAGO' && <Check className="w-4 h-4 text-orange-400" />}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Suscripción {plan.name} ({cycle === 'ANNUAL' ? 'Anual' : 'Mensual'})</span>
              <span className="text-zinc-200 font-medium">${price}.00 USD</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Créditos de IA incluidos</span>
              <span className="text-orange-400 font-medium">+{plan.maxMonthlyCredits.toLocaleString()} / mes</span>
            </div>
            <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-bold text-white">
              <span>Total a pagar hoy</span>
              <span>${price}.00 USD</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.5} />
            <span>Pago seguro con encriptación SSL de 256 bits. Cancela cuando quieras.</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="shadow-lg shadow-orange-500/20"
            >
              {isLoading ? 'Procesando...' : `Confirmar y Pagar $${price}.00 USD`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
