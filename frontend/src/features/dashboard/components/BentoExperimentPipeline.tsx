import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { hypothesisService } from '@/features/hypotheses/services/hypothesisService';

interface ExperimentItem {
  id: string;
  code: string;
  statement: string;
  targetMetric: string;
  ownerInitials: string;
  ownerColor: string;
  stage: string;
  active: boolean;
}

export const BentoExperimentPipeline: React.FC = () => {
  const { data: realHypotheses } = useQuery({
    queryKey: ['dashboard-hypotheses'],
    queryFn: () => hypothesisService.getHypotheses(),
    retry: false,
  });

  const defaultExperiments: ExperimentItem[] = [
    {
      id: 'h-12',
      code: 'H12',
      statement: 'Asistente guiado reduce churn en onboarding',
      targetMetric: 'Retención semana 2 (+18%)',
      ownerInitials: 'AM',
      ownerColor: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      stage: 'Día 8 / 14',
      active: true,
    },
    {
      id: 'h-14',
      code: 'H14',
      statement: 'Pricing dinámico basado en consumo de tokens',
      targetMetric: 'ARPU expansión (+24%)',
      ownerInitials: 'LC',
      ownerColor: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
      stage: 'Día 3 / 21',
      active: true,
    },
    {
      id: 'h-15',
      code: 'H15',
      statement: 'Integración nativa con Data Warehouse corporativo',
      targetMetric: 'Reducción fricción setup (-40%)',
      ownerInitials: 'SK',
      ownerColor: 'bg-zinc-700/60 text-zinc-300 border border-zinc-600/40',
      stage: 'Diseño',
      active: false,
    },
  ];

  const items: ExperimentItem[] = realHypotheses && realHypotheses.length > 0
    ? realHypotheses.slice(0, 3).map((h, index) => ({
        id: h.id,
        code: `H${10 + index}`,
        statement: h.statement,
        targetMetric: h.successMetric || h.targetValue || 'Validación de hipótesis cuantitativa',
        ownerInitials: index === 0 ? 'AM' : index === 1 ? 'LC' : 'SK',
        ownerColor: index === 0
          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          : index === 1
          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
          : 'bg-zinc-700/60 text-zinc-300 border border-zinc-600/40',
        stage: h.status === 'RUNNING' ? 'En ejecución' : h.status === 'VALIDATED' ? 'Validada' : 'Diseño',
        active: h.status === 'RUNNING' || h.status === 'VALIDATED',
      }))
    : defaultExperiments;

  return (
    <div className="rounded-2xl bg-[#1e1f26]/70 backdrop-blur-2xl p-6 border border-white/[0.08] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.45)] flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Pipeline de Experimentación
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Validación continua orientada a métricas clave
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-[#292931] border border-white/[0.06] text-xs font-semibold text-zinc-200">
          {items.length} Activas
        </span>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#1a1b22]/60 hover:bg-[#292931]/60 transition-colors border border-white/[0.04] group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  item.active ? 'bg-orange-500 ring-4 ring-orange-500/10' : 'bg-zinc-600'
                }`}
              />
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-zinc-200 block truncate group-hover:text-white transition-colors">
                  {item.code}: {item.statement}
                </span>
                <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                  Objetivo: {item.targetMetric}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 ml-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${item.ownerColor}`}
              >
                {item.ownerInitials}
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#292931] text-zinc-300 border border-white/[0.06]">
                {item.stage}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer link */}
      <div className="pt-1 border-t border-white/[0.04]">
        <Link
          to="/hypotheses"
          className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1.5 group inline-flex"
        >
          <span>Administrar experimentos del sprint</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
