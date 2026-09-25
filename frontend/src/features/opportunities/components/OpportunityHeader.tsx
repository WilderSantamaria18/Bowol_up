import React from 'react';
import { Lightbulb, Sparkles, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCopilot } from '@/features/copilot/context/CopilotContext';

interface OpportunityHeaderProps {
  onGenerateFromSwot: () => void;
  onCreateOpen: () => void;
  isGenerating?: boolean;
}

export const OpportunityHeader: React.FC<OpportunityHeaderProps> = ({
  onGenerateFromSwot,
  onCreateOpen,
  isGenerating = false,
}) => {
  const { openCopilot } = useCopilot();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-inner">
          <Lightbulb className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Estrategia & Oportunidades RICE
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Tablero Kanban priorizado por puntuación determinista RICE: (Reach × Impact × Confidence) / Effort
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          variant="glass"
          size="sm"
          onClick={() => openCopilot({ contextType: 'OPPORTUNITY' })}
          leftIcon={MessageSquare}
          className="text-xs"
        >
          Consultar Copilot
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onGenerateFromSwot}
          isLoading={isGenerating}
          leftIcon={Sparkles}
          className="text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
        >
          Generar desde FODA
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onCreateOpen}
          leftIcon={Plus}
          className="text-xs shadow-lg shadow-orange-950/40"
        >
          Nueva Oportunidad
        </Button>
      </div>
    </div>
  );
};
