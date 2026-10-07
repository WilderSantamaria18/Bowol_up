import React, { useState } from 'react';
import { X, Sparkles, CreditCard, ShieldCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { SubscriptionPlan, PaymentGateway } from '../types';

interface UpgradePlanModalProps {
  plan: SubscriptionPlan;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (planId: string, gateway: PaymentGateway) => Promise<void>;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  plan,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [gateway, setGateway] = useState<PaymentGateway>('STRIPE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const price = plan.priceUsdMonthly;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm(plan.id, gateway);
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
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <Sparkles className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Mejorar al Plan {plan.name}</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Desbloquea el máximo potencial de Bowol AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
          {/* Precio mensual del plan (el backend factura por ciclo de 30 días) */}
          <div className="p-3 rounded-xl border border-orange-500 bg-orange-500/10">
            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Facturación mensual</div>
            <div className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">${price.toFixed(2)} / mes</div>
          </div>

          {/* Payment Gateway */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Pasarela de Pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGateway('STRIPE')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  gateway === 'STRIPE'
                    ? 'border-orange-500 bg-orange-500/10 text-zinc-900 dark:text-white'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
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
                    ? 'border-orange-500 bg-orange-500/10 text-zinc-900 dark:text-white'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
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
          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span>Suscripción {plan.name} (Mensual)</span>
              <span className="text-zinc-900 dark:text-zinc-200 font-medium">${price.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span>Créditos de IA incluidos</span>
              <span className="text-orange-400 font-medium">+{plan.aiCreditsMonthly.toLocaleString()} / mes</span>
            </div>
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-sm font-bold text-zinc-900 dark:text-white">
              <span>Total a pagar hoy</span>
              <span>${price.toFixed(2)} USD</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.5} />
            <span>Pago seguro con encriptación SSL de 256 bits. Cancela cuando quieras.</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
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
              {isLoading ? 'Procesando...' : `Confirmar y Pagar $${price.toFixed(2)} USD`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
