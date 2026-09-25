import React from 'react';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SubscriptionPlan, BillingCycle } from '../types';

interface PlanCardProps {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  isCurrent: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
  isLoading?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  billingCycle,
  isCurrent,
  onSelect,
  isLoading = false,
}) => {
  const isPro = plan.planKey === 'PRO';
  const isBusiness = plan.planKey === 'BUSINESS';

  const price = billingCycle === 'ANNUAL' ? plan.annualPrice : plan.monthlyPrice;
  const periodLabel = billingCycle === 'ANNUAL' ? '/año' : '/mes';

  const features = [
    {
      text: `${plan.maxMonthlyCredits.toLocaleString()} créditos de IA al mes`,
      highlight: true,
      icon: Zap,
    },
    {
      text: plan.maxProjects === -1 ? 'Proyectos ilimitados' : `Hasta ${plan.maxProjects} proyectos`,
      highlight: false,
    },
    {
      text: plan.maxSocialProfiles === -1 ? 'Perfiles sociales ilimitados' : `Hasta ${plan.maxSocialProfiles} perfiles sociales`,
      highlight: false,
    },
    {
      text: plan.unlimitedResearch ? 'Investigación de mercado profunda con IA' : 'Investigación de mercado estándar',
      highlight: plan.unlimitedResearch,
    },
    {
      text: plan.unlimitedCompetitors ? 'Análisis ilimitado de competidores' : 'Seguimiento básico de competencia',
      highlight: false,
    },
    {
      text: plan.hasApiAccess ? 'Acceso completo a la API REST' : 'Sin acceso a API',
      available: plan.hasApiAccess,
    },
    {
      text: plan.hasDedicatedSupport ? 'Soporte prioritario y consultoría' : 'Soporte comunitario estándar',
      available: plan.hasDedicatedSupport,
    },
  ];

  return (
    <Card
      className={`relative flex flex-col justify-between transition-all duration-300 border ${
        isPro
          ? 'border-orange-500/50 bg-gradient-to-b from-orange-500/10 via-zinc-900 to-zinc-950 shadow-xl shadow-orange-500/5'
          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
      }`}
    >
      {/* Popular badge */}
      {isPro && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <Badge variant="brand" className="px-3 py-1 font-semibold uppercase tracking-wider text-[11px] shadow-md bg-orange-500 text-white border-orange-400">
            <Sparkles className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} /> Más Popular
          </Badge>
        </div>
      )}

      {/* Plan Header */}
      <div>
        <div className="flex items-center justify-between mt-1 mb-2">
          <h4 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {plan.name}
            {isBusiness && <ShieldCheck className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />}
          </h4>
          {isCurrent && (
            <Badge variant="success">Tu Plan Actual</Badge>
          )}
        </div>

        <p className="text-xs text-zinc-400 min-h-[36px]">{plan.description}</p>

        {/* Pricing */}
        <div className="my-6 pb-6 border-b border-zinc-800/80">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              ${price}
            </span>
            <span className="text-sm font-medium text-zinc-400">
              {plan.planKey === 'FREE' ? 'para siempre' : periodLabel}
            </span>
          </div>
          {billingCycle === 'ANNUAL' && plan.planKey !== 'FREE' && (
            <span className="text-[11px] text-emerald-400 font-medium inline-block mt-1">
              Ahorro de ~15% comparado al plan mensual
            </span>
          )}
        </div>

        {/* Features Checklist */}
        <div className="space-y-3 mb-6">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
            Características incluidas
          </span>
          <ul className="space-y-2.5">
            {features.map((item, idx) => {
              const isAvailable = item.available ?? true;
              return (
                <li
                  key={idx}
                  className={`flex items-start gap-2.5 text-xs ${
                    isAvailable ? 'text-zinc-300' : 'text-zinc-600 line-through'
                  }`}
                >
                  <Check
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isAvailable
                        ? item.highlight
                          ? 'text-orange-400'
                          : 'text-emerald-400'
                        : 'text-zinc-700'
                    }`}
                    strokeWidth={2}
                  />
                  <span className={item.highlight ? 'font-medium text-white' : ''}>
                    {item.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-zinc-800/60 mt-auto">
        <Button
          variant={isCurrent ? 'outline' : isPro ? 'primary' : 'secondary'}
          disabled={isCurrent || isLoading}
          onClick={() => onSelect(plan)}
          className={`w-full justify-center ${
            isCurrent
              ? 'opacity-60 cursor-default border-zinc-700 text-zinc-400'
              : isPro
              ? 'shadow-lg shadow-orange-500/20'
              : ''
          }`}
        >
          {isCurrent ? 'Plan Actual' : `Elegir ${plan.name}`}
        </Button>
      </div>
    </Card>
  );
};
