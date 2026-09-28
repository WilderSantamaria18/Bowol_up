import React from 'react';
import { 
  Zap, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Layers,
  Rocket,
  SlidersHorizontal,
  Target,
  User
} from 'lucide-react';
import { Opportunity, OpportunityStatus } from '../types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onStatusChange: (id: string, newStatus: OpportunityStatus) => void;
  onDelete: (id: string) => void;
  onSelect?: (opportunity: Opportunity) => void;
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
  onSelect,
  onConvertToProject,
}) => {
  const currentIndex = STATUS_ORDER.indexOf(opportunity.status);
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < STATUS_ORDER.length - 1;

  const handleMoveLeft = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canMoveLeft) {
      onStatusChange(opportunity.id, STATUS_ORDER[currentIndex - 1]);
    }
  };

  const handleMoveRight = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canMoveRight) {
      onStatusChange(opportunity.id, STATUS_ORDER[currentIndex + 1]);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(opportunity.id);
  };

  // Format RICE priority score
  const scoreDisplay = opportunity.priorityScore !== undefined && opportunity.priorityScore !== null
    ? Number(opportunity.priorityScore).toFixed(1)
    : 'N/A';

  const renderRiskBadge = () => {
    if (!opportunity.riskLevel) return null;
    switch (opportunity.riskLevel) {
      case 'LOW':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Riesgo Bajo</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Riesgo Medio</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Riesgo Alto</span>;
      default:
        return null;
    }
  };

  return (
    <div
      data-testid={`opportunity-card-${opportunity.id}`}
      onClick={() => onSelect?.(opportunity)}
      className="group relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.14] transition-all duration-200 shadow-md flex flex-col justify-between space-y-3 cursor-pointer"
    >
      <div className="space-y-2">
        {/* Header & Score Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
              <Zap className="w-3 h-3" strokeWidth={1.5} />
              <span>RICE {scoreDisplay}</span>
            </span>
            {renderRiskBadge()}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(opportunity);
              }}
              className="p-1 rounded-md text-zinc-500 hover:text-orange-400 hover:bg-white/[0.05] transition-colors"
              title="Abrir simulador RICE y detalles"
              aria-label="Simular RICE"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-white/[0.05]"
              title="Eliminar oportunidad"
              aria-label="Eliminar oportunidad"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-white tracking-tight leading-snug">
          {opportunity.title}
        </h4>

        {/* Description or Problem */}
        {opportunity.problem ? (
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
            <span className="text-zinc-500 font-medium">Problema: </span>{opportunity.problem}
          </p>
        ) : opportunity.description ? (
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
            {opportunity.description}
          </p>
        ) : null}

        {/* Metadata Tags: Target Segment & Owner */}
        {(opportunity.targetSegment || opportunity.ownerName) && (
          <div className="flex items-center gap-2 pt-1 flex-wrap text-[10px] text-zinc-400">
            {opportunity.targetSegment && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.02] border border-white/[0.04]">
                <Target className="w-2.5 h-2.5 text-sky-400" strokeWidth={1.5} />
                <span className="truncate max-w-[120px]">{opportunity.targetSegment}</span>
              </span>
            )}
            {opportunity.ownerName && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.02] border border-white/[0.04]">
                <User className="w-2.5 h-2.5 text-orange-400" strokeWidth={1.5} />
                <span className="truncate max-w-[100px]">{opportunity.ownerName}</span>
              </span>
            )}
          </div>
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
            onClick={(e) => {
              e.stopPropagation();
              onConvertToProject(opportunity.id);
            }}
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
