import React from 'react';
import { Sparkles, Compass, ArrowRight, Activity } from 'lucide-react';
import { DashboardExecutiveBriefing, DashboardHealthScoreInfo } from '../types';
import { useCopilot } from '@/features/copilot/context/CopilotContext';

interface ExecutiveDailyBriefingProps {
  briefing?: DashboardExecutiveBriefing;
  healthScore?: DashboardHealthScoreInfo;
  organizationName: string;
}

export const ExecutiveDailyBriefing: React.FC<ExecutiveDailyBriefingProps> = ({
  briefing,
  healthScore,
  organizationName,
}) => {
  const { openCopilot } = useCopilot();

  const highlights = briefing?.highlights && briefing.highlights.length > 0
    ? briefing.highlights
    : [
        'Se detectaron 7 señales relevantes para tu sector y mercados objetivo.',
        '2 oportunidades estratégicas superaron el umbral de prioridad RICE.',
        'Sprint activo en curso; avance sostenido en validación de hipótesis.',
      ];

  const overallScore = healthScore?.overallScore ?? 84;
  const statusLabel = healthScore?.statusLabel ?? 'OPTIMAL';
  const explanation = healthScore?.explanation ?? 'Índice ponderado de ejecución, estrategia, mercado y madurez digital/IA.';

  const handleAskCopilot = () => {
    openCopilot({
      contextType: 'GENERAL',
      initialMessage: `Actuemos como Director de Estrategia para ${organizationName}. Basado en el briefing ejecutivo de hoy: "${highlights.join(' ')}", ¿cuáles son los 3 pasos de mayor apalancamiento que debemos ejecutar hoy?`,
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/80 to-zinc-950 p-6 border border-zinc-200/90 dark:border-white/[0.08] shadow-lg dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      {/* Background ambient radial glow */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Briefing Narrative */}
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 font-mono">
              Briefing Ejecutivo Diario
            </span>
            <span className="text-zinc-600 dark:text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-medium">
              Sincronizado hoy
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-zinc-100 tracking-tight font-display">
              {briefing?.headline || `Visión del Ciclo de Innovación — ${organizationName}`}
            </h2>
            <ul className="space-y-1.5 pt-1">
              {highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: BusinessHealthScore Badge & Quick Action */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-800/80">
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-4 w-full sm:w-auto">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                <Activity className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                <span>Salud del Negocio</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-zinc-100 font-display tabular-nums">
                  {overallScore}
                </span>
                <span className="text-xs text-zinc-400">/ 100</span>
                <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {statusLabel === 'OPTIMAL' ? 'ÓPTIMO' : statusLabel === 'GOOD' ? 'ESTABLE' : 'ATENCIÓN'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 max-w-[200px] truncate" title={explanation}>
                {explanation}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAskCopilot}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-md shadow-orange-500/20 active:scale-[0.985]"
          >
            <Compass className="w-4 h-4" strokeWidth={1.5} />
            <span>Consultar al Copiloto</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
