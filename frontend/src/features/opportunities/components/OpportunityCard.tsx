import React from 'react';
import { 
  Zap, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Layers,
  Rocket
} from 'lucide-react';
import { Opportunity, OpportunityStatus } from '../types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onStatusChange: (id: string, newStatus: OpportunityStatus) => void;
  onDelete: (id: string) => void;
  onConvertToProject?: (id: string) => void;
}

const STATUS_ORDER: OpportunityStatus[] = [
  'IDENTIFIED',
  'EVALUATING',
  'APPROVED',
  'REJECTED',
  'CONVERTED',
];

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onStatusChange,
  onDelete,
  onConvertToProject,
}) => {
  const currentIndex = STATUS_ORDER.indexOf(opportunity.status);
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < STATUS_ORDER.length - 1;

  const handleMoveLeft = () => {
    if (canMoveLeft) {
      onStatusChange(opportunity.id, STATUS_ORDER[currentIndex - 1]);
    }
  };

  const handleMoveRight = () => {
    if (canMoveRight) {
      onStatusChange(opportunity.id, STATUS_ORDER[currentIndex + 1]);
    }
  };

  // Format RICE priority score
  const scoreDisplay = opportunity.priorityScore !== undefined && opportunity.priorityScore !== null
    ? Number(opportunity.priorityScore).toFixed(1)
    : 'N/A';

  return (
    <div
      data-testid={`opportunity-card-${opportunity.id}`}
      className="group relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.14] transition-all duration-200 shadow-md flex flex-col justify-between space-y-3"
    >
      <div className="space-y-2">
        {/* Header & Score Badge */}
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <Zap className="w-3 h-3" strokeWidth={1.5} />
            <span>RICE {scoreDisplay}</span>
          </span>

          <button
            type="button"
            onClick={() => onDelete(opportunity.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-white/[0.05]"
            title="Eliminar oportunidad"
            aria-label="Eliminar oportunidad"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-white tracking-tight leading-snug">
          {opportunity.title}
        </h4>

        {/* Description */}
        {opportunity.description && (
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
            {opportunity.description}
          </p>
        )}
      </div>

      <div className="space-y-2 pt-2 border-t border-white/[0.04]">
        {/* RICE Factors Pills */}
        <div className="grid grid-cols-4 gap-1 text-center">
          <div className="p-1 rounded bg-black/30 border border-white/[0.04]">
            <span className="text-[10px] text-zinc-500 block">Alcance</span>
            <span className="text-[11px] font-semibold text-zinc-200">{opportunity.reachScore ?? '-'}</span>
          </div>
          <div className="p-1 rounded bg-black/30 border border-white/[0.04]">
            <span className="text-[10px] text-zinc-500 block">Impacto</span>
            <span className="text-[11px] font-semibold text-emerald-400">{opportunity.impactScore ?? '-'}</span>
          </div>
          <div className="p-1 rounded bg-black/30 border border-white/[0.04]">
            <span className="text-[10px] text-zinc-500 block">Conf.</span>
            <span className="text-[11px] font-semibold text-sky-400">{opportunity.confidenceScore ?? '-'}</span>
          </div>
          <div className="p-1 rounded bg-black/30 border border-white/[0.04]">
            <span className="text-[10px] text-zinc-500 block">Esfuerzo</span>
            <span className="text-[11px] font-semibold text-amber-400">{opportunity.effortScore ?? '-'}</span>
          </div>
        </div>

        {/* Evidence Count */}
        {opportunity.evidence && opportunity.evidence.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
            <Layers className="w-3 h-3 text-sky-400" strokeWidth={1.5} />
            <span>{opportunity.evidence.length} señales/evidencias asociadas</span>
          </div>
        )}

        {/* Convert to Project & AI Backlog Button */}
        {opportunity.status === 'APPROVED' && onConvertToProject && (
          <button
            type="button"
            onClick={() => onConvertToProject(opportunity.id)}
            className="w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 text-orange-200 border border-orange-500/30 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Rocket className="w-3.5 h-3.5 text-orange-400" strokeWidth={1.5} />
            <span>Crear Proyecto & Backlog IA</span>
          </button>
        )}

        {/* Pipeline Navigation Arrows */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleMoveLeft}
            disabled={!canMoveLeft}
            className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-400 transition-colors p-1"
            title="Mover al estado anterior"
            aria-label="Mover al estado anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="text-[10px]">Atrás</span>
          </button>

          <button
            type="button"
            onClick={handleMoveRight}
            disabled={!canMoveRight}
            className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-orange-400 disabled:opacity-20 disabled:hover:text-zinc-400 transition-colors p-1"
            title="Avanzar al siguiente estado"
            aria-label="Avanzar al siguiente estado"
          >
            <span className="text-[10px]">Avanzar</span>
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
