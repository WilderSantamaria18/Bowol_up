import React from 'react';
import { Grid2X2, Sparkles, MessageSquare, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCopilot } from '@/features/copilot/context/CopilotContext';

interface SwotHeaderProps {
  onGenerate: () => void;
  onOpenEvidences?: () => void;
  isGenerating?: boolean;
  hasSwot?: boolean;
}

export const SwotHeader: React.FC<SwotHeaderProps> = ({
  onGenerate,
  onOpenEvidences,
  isGenerating = false,
  hasSwot = false,
}) => {
  const { openCopilot } = useCopilot();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-inner">
          <Grid2X2 className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Matriz FODA Dinámica
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Diagnóstico estratégico de capacidades internas cruzadas con tendencias de mercado
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {hasSwot && onOpenEvidences && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenEvidences}
            leftIcon={Layers}
            className="text-xs"
          >
            Evidencias de Mercado
          </Button>
        )}

        <Button
          variant="glass"
          size="sm"
          onClick={() => openCopilot({ contextType: 'SWOT' })}
          leftIcon={MessageSquare}
          className="text-xs"
        >
          Consultar Copilot
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onGenerate}
          isLoading={isGenerating}
          leftIcon={Sparkles}
          className="text-xs shadow-lg shadow-orange-950/40"
        >
          {isGenerating ? 'Generando con IA...' : hasSwot ? 'Regenerar con IA' : 'Generar FODA con IA'}
        </Button>
      </div>
    </div>
  );
};
