import React, { useState } from 'react';
import { 
  LucideIcon, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Link2,
  Loader2,
  Target,
  FlaskConical,
  EyeOff,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { SwotItem, QuadrantType } from '../types';
import { Button } from '@/components/ui/Button';

interface QuadrantCardProps {
  type: QuadrantType;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  items: SwotItem[];
  colorTheme: {
    accent: string;
    border: string;
    bgBadge: string;
    textBadge: string;
    bullet: string;
  };
  onAddItem: (text: string) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
  onUpdateItemStatus?: (itemId: string, status: string) => Promise<void>;
  onOpenEvidence?: (evidenceId?: string) => void;
  onConvertToOpportunity?: (item: SwotItem) => void;
  onConvertToHypothesis?: (item: SwotItem) => void;
  showDismissed?: boolean;
}

export const QuadrantCard: React.FC<QuadrantCardProps> = ({
  type,
  title,
  subtitle,
  icon: Icon,
  items,
  colorTheme,
  onAddItem,
  onRemoveItem,
  onUpdateItemStatus,
  onOpenEvidence,
  onConvertToOpportunity,
  onConvertToHypothesis,
  showDismissed = true,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const displayedItems = showDismissed 
    ? items 
    : items.filter(it => it.status !== 'DISMISSED');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    try {
      setIsSubmitting(true);
      await onAddItem(newText.trim());
      setNewText('');
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      setDeletingId(itemId);
      await onRemoveItem(itemId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (item: SwotItem) => {
    if (!onUpdateItemStatus) return;
    const nextStatus = item.status === 'DISMISSED' ? 'ACTIVE' : 'DISMISSED';
    try {
      setUpdatingStatusId(item.id);
      await onUpdateItemStatus(item.id, nextStatus);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getConfidenceBadge = (confidence?: string) => {
    switch (confidence) {
      case 'HIGH':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Alta certeza
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Certeza media
          </span>
        );
      case 'LOW':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            Baja certeza
          </span>
        );
      default:
        return null;
    }
  };

  const getImpactBadge = (impact?: string) => {
    switch (impact) {
      case 'HIGH':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
            Impacto alto
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Impacto medio
          </span>
        );
      case 'LOW':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            Impacto moderado
          </span>
        );
      default:
        return null;
    }
  };

  const getSourceBadge = (source?: string) => {
    if (!source) return null;
    if (source === 'INTERNAL_PROFILE') {
      return (
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
          Interno (Perfil)
        </span>
      );
    }
    if (source === 'TREND_RADAR') {
      return (
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" strokeWidth={1.5} />
          Radar de Mercado
        </span>
      );
    }
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
        {source}
      </span>
    );
  };

  return (
    <div
      data-testid={`quadrant-${type}`}
      className={`glass-panel p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${colorTheme.border} bg-white/[0.02] hover:bg-white/[0.03] shadow-lg`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorTheme.bgBadge} ${colorTheme.textBadge} border border-white/[0.08]`}>
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colorTheme.bgBadge} ${colorTheme.textBadge} border border-white/[0.08]`}>
                  {displayedItems.length}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3 my-4 min-h-[140px]">
          {displayedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/[0.06] rounded-xl">
              <p className="text-xs text-zinc-500">Sin elementos registrados en este cuadrante.</p>
            </div>
          ) : (
            displayedItems.map((item) => {
              const isDismissed = item.status === 'DISMISSED';
              const textContent = item.statement || item.text;

              return (
                <div
                  key={item.id}
                  className={`group relative flex flex-col gap-2.5 p-3.5 rounded-xl border transition-colors ${
                    isDismissed
                      ? 'bg-white/[0.01] border-white/[0.04] opacity-60'
                      : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.14]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${colorTheme.bullet}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed break-words ${isDismissed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                          {textContent}
                        </p>
                      </div>
                    </div>

                    {/* Quick Item Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {/* Convert to Opportunity */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onConvertToOpportunity) {
                            onConvertToOpportunity(item);
                          } else {
                            const titleParam = encodeURIComponent(textContent);
                            const descParam = encodeURIComponent(`Iniciativa derivada del cuadrante ${title} de FODA.`);
                            window.location.href = `/opportunities?create=true&title=${titleParam}&description=${descParam}&swotItemId=${item.id}`;
                          }
                        }}
                        className="p-1 rounded-md text-zinc-400 hover:text-amber-400 hover:bg-white/[0.06] transition-colors"
                        aria-label="Convertir en Oportunidad RICE"
                        title="Convertir en Oportunidad RICE"
                      >
                        <Target className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>

                      {/* Convert to Hypothesis */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onConvertToHypothesis) {
                            onConvertToHypothesis(item);
                          } else {
                            const stmtParam = encodeURIComponent(textContent);
                            window.location.href = `/hypotheses?create=true&statement=${stmtParam}&source=SWOT&swotItemId=${item.id}`;
                          }
                        }}
                        className="p-1 rounded-md text-zinc-400 hover:text-emerald-400 hover:bg-white/[0.06] transition-colors"
                        aria-label="Crear hipótesis de validación"
                        title="Crear hipótesis de validación"
                      >
                        <FlaskConical className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>

                      {/* Toggle Dismiss */}
                      {onUpdateItemStatus && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          disabled={updatingStatusId === item.id}
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                          aria-label={isDismissed ? 'Reactivar elemento' : 'Descartar elemento'}
                          title={isDismissed ? 'Reactivar elemento' : 'Descartar elemento'}
                        >
                          {updatingStatusId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                          ) : isDismissed ? (
                            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} />
                          )}
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-white/[0.06] transition-colors"
                        aria-label="Eliminar elemento"
                        title="Eliminar elemento"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Metadata Chips: Source, Confidence, Impact, Evidence */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/[0.03]">
                    {getSourceBadge(item.source)}
                    {getConfidenceBadge(item.confidence)}
                    {getImpactBadge(item.impact)}

                    {isDismissed && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-700/30 text-zinc-400 border border-zinc-700/50">
                        Descartado
                      </span>
                    )}

                    {/* Evidence Badges */}
                    {item.evidenceIds && item.evidenceIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onOpenEvidence?.(item.evidenceIds[0])}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors"
                        title="Ver evidencia y señales de mercado respaldatorias"
                      >
                        <Link2 className="w-2.5 h-2.5" strokeWidth={1.5} />
                        <span>{item.evidenceIds.length} evidencia{item.evidenceIds.length > 1 ? 's' : ''}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Item Section */}
      <div className="pt-3 border-t border-white/[0.05]">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder={`Añadir nuevo punto a ${title.toLowerCase()}...`}
              rows={2}
              autoFocus
              className="w-full text-xs bg-black/40 border border-white/[0.12] rounded-xl px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/30 resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewText('');
                }}
                disabled={isSubmitting}
              >
                <X className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!newText.trim() || isSubmitting}
                isLoading={isSubmitting}
              >
                <Check className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                Guardar
              </Button>
            </div>
          </form>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="w-full justify-center text-xs text-zinc-400 hover:text-white border border-dashed border-white/[0.08] hover:border-white/20 rounded-xl py-2"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
            Añadir elemento
          </Button>
        )}
      </div>
    </div>
  );
};
