import React from 'react';
import { Sparkles, Calendar, Zap, AlertTriangle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { OrganizationSubscription } from '../types';

interface SubscriptionOverviewCardProps {
  subscription: OrganizationSubscription;
  onUpgradeClick: () => void;
  onBuyCreditsClick: () => void;
  onCancelClick: () => void;
  isCancelling?: boolean;
}

export const SubscriptionOverviewCard: React.FC<SubscriptionOverviewCardProps> = ({
  subscription,
  onUpgradeClick,
  onBuyCreditsClick,
  onCancelClick,
  isCancelling = false,
}) => {
  const { plan, status, billingCycle, creditsBalance, creditsUsedThisCycle, currentPeriodEnd, cancelAtPeriodEnd } =
    subscription;

  const totalCredits = creditsBalance + creditsUsedThisCycle;
  const usagePercentage = totalCredits > 0 ? Math.min(100, Math.round((creditsUsedThisCycle / totalCredits) * 100)) : 0;
  const isNearLimit = usagePercentage >= 80;

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Card className="relative overflow-hidden border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950/80 backdrop-blur-md">
      {/* Background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left Column: Current Plan & Status */}
        <div className="space-y-4 lg:border-r lg:border-zinc-800/80 lg:pr-6">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Plan Actual</span>
            <div className="flex items-center gap-2">
              <Badge variant={status === 'ACTIVE' ? 'success' : 'warning'}>
                {status === 'ACTIVE' ? 'Activo' : status}
              </Badge>
              <Badge variant="brand">
                {billingCycle === 'ANNUAL' ? 'Anual' : 'Mensual'}
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {plan.name}
              {plan.planKey !== 'FREE' && (
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" strokeWidth={1.5} />
              )}
            </h3>
            <p className="text-sm text-zinc-400 mt-1">{plan.description}</p>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-2 text-xs text-zinc-400">
            <Calendar className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
            <span>
              {cancelAtPeriodEnd ? 'Expira el:' : 'Próxima renovación:'}{' '}
              <strong className="text-zinc-200">{formatDate(currentPeriodEnd)}</strong>
            </span>
          </div>

          {cancelAtPeriodEnd && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>Cancelación programada al final del periodo.</span>
            </div>
          )}
        </div>

        {/* Center Column: AI Credits Usage */}
        <div className="space-y-4 lg:border-r lg:border-zinc-800/80 lg:pr-6 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-orange-400" strokeWidth={1.5} />
              Créditos de Inteligencia Artificial
            </span>
            <span className="text-xs font-medium text-zinc-300">
              {creditsBalance} disponibles
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-zinc-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-zinc-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isNearLimit ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-orange-500 to-amber-400'
                }`}
                style={{ width: `${Math.max(4, usagePercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>{creditsUsedThisCycle} usados en este ciclo</span>
              <span className={isNearLimit ? 'text-rose-400 font-semibold' : 'text-zinc-400'}>
                {usagePercentage}% consumido
              </span>
            </div>
          </div>

          <div className="pt-2 text-xs text-zinc-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
            <span>Los créditos se recargan mensualmente según tu plan.</span>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="flex flex-col justify-center gap-3">
          <Button
            variant="primary"
            onClick={onUpgradeClick}
            className="w-full justify-center shadow-lg shadow-orange-500/10"
          >
            <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
            {plan.planKey === 'BUSINESS' ? 'Gestionar Plan' : 'Mejorar a Pro / Business'}
            <ArrowUpRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
          </Button>

          <Button
            variant="outline"
            onClick={onBuyCreditsClick}
            className="w-full justify-center border-zinc-700 hover:border-orange-500/40 text-zinc-300 hover:text-white"
          >
            <Zap className="w-4 h-4 mr-2 text-orange-400" strokeWidth={1.5} />
            Comprar Paquete de Créditos
          </Button>

          {!cancelAtPeriodEnd && plan.planKey !== 'FREE' && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={onCancelClick}
              className="text-xs text-zinc-500 hover:text-rose-400 transition-colors text-center py-1 mt-1 disabled:opacity-50"
            >
              {isCancelling ? 'Cancelando...' : 'Cancelar renovación automática'}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
