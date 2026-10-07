import React, { useState } from 'react';
import { X, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { CREDIT_PRICE_USD, MIN_CREDITS_PACK } from '../types';

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (credits: number) => Promise<void>;
}

interface CreditPack {
  credits: number;
  price: number;
  badge?: string;
  popular?: boolean;
}

// El backend cobra CREDIT_PRICE_USD por crédito y exige un mínimo por compra (sin descuentos por volumen).
const CREDIT_PACKS: CreditPack[] = [MIN_CREDITS_PACK, 1000, 2500, 5000].map((credits) => ({
  credits,
  price: Math.round(credits * CREDIT_PRICE_USD * 100) / 100,
  popular: credits === 1000,
  badge: credits === 1000 ? 'Recomendado' : undefined,
}));

export const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedPack, setSelectedPack] = useState<CreditPack>(CREDIT_PACKS[1]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm(selectedPack.credits);
      onClose();
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string };
      setError(e.detail || e.message || 'Error al comprar créditos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <Zap className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Comprar Créditos IA</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Recarga créditos adicionales que nunca expiran</p>
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
          {/* Pack selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Selecciona un Paquete
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CREDIT_PACKS.map((pack) => {
                const isSelected = selectedPack.credits === pack.credits;
                return (
                  <button
                    key={pack.credits}
                    type="button"
                    onClick={() => setSelectedPack(pack)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10 text-zinc-900 dark:text-white shadow-md'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {pack.badge && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {pack.badge}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      <Zap className="w-3.5 h-3.5 text-orange-400" strokeWidth={1.5} />
                      {pack.credits.toLocaleString()} Créditos
                    </div>
                    <div className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                      ${pack.price.toFixed(2)} USD
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span>Recarga de Créditos IA</span>
              <span className="text-orange-400 font-medium">+{selectedPack.credits.toLocaleString()} créditos</span>
            </div>
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-sm font-bold text-zinc-900 dark:text-white">
              <span>Total a pagar</span>
              <span>${selectedPack.price.toFixed(2)} USD</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.5} />
            <span>Los créditos se acreditan inmediatamente a tu organización.</span>
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
              {isLoading ? 'Procesando...' : `Comprar por $${selectedPack.price.toFixed(2)} USD`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
