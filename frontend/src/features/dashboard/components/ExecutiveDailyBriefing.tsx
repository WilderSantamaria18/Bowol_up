import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Compass, ArrowRight, Activity, AlertTriangle, ArrowUpRight, ChevronRight, HelpCircle } from 'lucide-react';
import { DashboardExecutiveBriefing, DashboardHealthScoreInfo } from '../types';
import { useCopilot } from '@/features/copilot/context/CopilotContext';
import { BusinessHealthDetailModal } from './BusinessHealthDetailModal';

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
  const navigate = useNavigate();
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

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
  const risks = briefing?.risks || [];
  const suggestedActions = briefing?.suggestedActions || [];

  const handleAskCopilot = () => {
    openCopilot({
      contextType: 'GENERAL',
      initialMessage: `Actuemos como Director de Estrategia para ${organizationName}. Basado en el briefing ejecutivo de hoy: "${highlights.join(' ')}", ¿cuáles son los 3 pasos de mayor apalancamiento que debemos ejecutar hoy?`,
    });
  };

  const handleActionClick = (actionText: string) => {
    const lower = actionText.toLowerCase();
    if (lower.includes('sprint') || lower.includes('tarea') || lower.includes('proyecto')) {
      navigate('/projects');
    } else if (lower.includes('oportunidad') || lower.includes('rice') || lower.includes('prioriz')) {
      navigate('/opportunities');
    } else if (lower.includes('radar') || lower.includes('señal') || lower.includes('tendencia')) {
      navigate('/trends');
    } else {
      openCopilot({
        contextType: 'GENERAL',
        initialMessage: `Profundicemos en la recomendación estratégica: "${actionText}". ¿Qué acciones inmediatas sugiere el equipo de estrategia?`,
      });
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/80 to-zinc-950 p-6 sm:p-7 border border-zinc-200/90 dark:border-white/[0.08] shadow-lg dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        {/* Background ambient radial glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Briefing Narrative */}
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
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

            {/* Strategic Risks Callout (if any) */}
            {risks.length > 0 && (
              <div className="pt-2">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div className="space-y-1">
                    <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">
                      Atención Estratégica
                    </span>
                    <ul className="space-y-0.5">
                      {risks.map((risk, rIdx) => (
                        <li key={rIdx} className="text-amber-200/90 leading-relaxed">
                          • {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Actions */}
            {suggestedActions.length > 0 && (
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold mr-1">
                  Acciones recomendadas:
                </span>
                {suggestedActions.map((action, aIdx) => (
                  <button
                    key={aIdx}
                    type="button"
                    onClick={() => handleActionClick(action)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] font-medium text-zinc-200 hover:text-white transition-all group"
                  >
                    <span>{action}</span>
                    <ArrowUpRight className="w-3 h-3 text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: BusinessHealthScore Badge & Quick Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-800/80">
            <button
              type="button"
              onClick={() => setIsHealthModalOpen(true)}
              className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-emerald-500/30 flex items-center gap-4 w-full sm:w-auto text-left transition-all group cursor-pointer"
              title={explanation}
            >
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                  <span>Salud del Negocio</span>
                  <HelpCircle className="w-3 h-3 text-zinc-500 group-hover:text-emerald-400 transition-colors ml-0.5" strokeWidth={1.5} />
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
                <div className="flex items-center gap-1 text-[10px] text-emerald-400/80 group-hover:text-emerald-300 font-medium pt-0.5">
                  <span>Ver desglose explicable</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                </div>
              </div>
            </button>

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

      {/* Modal de Explicabilidad Matemática del Health Score */}
      <BusinessHealthDetailModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        healthScore={healthScore}
      />
    </>
  );
};

