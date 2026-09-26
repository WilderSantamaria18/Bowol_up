import React, { useState } from 'react';
import { Sparkles, Brain, Bookmark, Check, Clock } from 'lucide-react';
import { useCopilot } from '@/features/copilot/context/CopilotContext';

export const BentoAiAssistantCard: React.FC = () => {
  const { openCopilot } = useCopilot();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const insightText =
    'Se detecta una divergencia positiva del 14% entre la adopción de modelos locales por competidores tier-1 y nuestra capacidad actual en el Sprint 14.';

  const handleDeepDive = () => {
    openCopilot({
      contextType: 'GENERAL',
      initialMessage: `Analicemos en profundidad el siguiente insight estratégico: "${insightText}". ¿Cómo podemos capitalizar esta oportunidad y qué experimentos inmediatos deberíamos lanzar?`,
    });
  };

  return (
    <div className="rounded-2xl bg-[#1e1f26]/70 backdrop-blur-2xl p-6 border border-white/[0.08] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.45)] relative overflow-hidden flex flex-col justify-between space-y-4">
      {/* Background ambient radial glow */}
      <div className="absolute -left-12 -bottom-12 w-44 h-44 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Asistente BOWOL
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold">
            Insight de Alta Relevancia
          </span>
        </div>

        {/* Insight content container */}
        <div className="mt-4 p-4 rounded-xl bg-[#1a1b22]/70 border border-white/[0.04] space-y-3">
          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
            {insightText}
          </p>
          <div className="pt-1 flex items-center gap-2 text-[11px] text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Generado hace 34 minutos • Fuente: Mercado & FODA</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleDeepDive}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_4px_12px_rgba(249,115,22,0.25)] active:scale-[0.985]"
        >
          <Brain className="w-4 h-4" />
          <span>Profundizar con IA</span>
        </button>

        <button
          type="button"
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`p-2.5 rounded-xl border transition-colors ${
            isBookmarked
              ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
              : 'bg-[#292931]/60 hover:bg-[#33343c] border-white/[0.06] text-zinc-400 hover:text-white'
          }`}
          title={isBookmarked ? 'Guardado en biblioteca estratégica' : 'Guardar síntesis'}
        >
          {isBookmarked ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
