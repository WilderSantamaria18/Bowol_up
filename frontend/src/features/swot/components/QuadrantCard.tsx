import React, { useState } from 'react';
import { 
  LucideIcon, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Link2,
  Loader2,
  Target 
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
  onOpenEvidence?: (evidenceId: string) => void;
  onConvertToOpportunity?: (text: string) => void;
  isAddingItem?: boolean;
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
  onOpenEvidence,
  onConvertToOpportunity,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
                  {items.length}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-2.5 my-4 min-h-[140px]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/[0.06] rounded-xl">
              <p className="text-xs text-zinc-500">Sin elementos registrados en este cuadrante.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="group relative flex items-start justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.12] transition-colors"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${colorTheme.bullet}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 leading-relaxed break-words">{item.text}</p>
                    
                    {/* Evidence Badges */}
                    {item.evidenceIds && item.evidenceIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.evidenceIds.map((evId, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => onOpenEvidence?.(evId)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors"
                            title="Ver tendencia respaldatoria"
                          >
                            <Link2 className="w-2.5 h-2.5" strokeWidth={1.5} />
                            <span>Evidencia #{idx + 1}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Item Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {type === 'opportunities' && (
                    <button
                      type="button"
                      onClick={() => {
                        const titleParam = encodeURIComponent(item.text);
                        const descParam = encodeURIComponent('Iniciativa derivada del análisis FODA (Oportunidades).');
                        if (onConvertToOpportunity) {
                          onConvertToOpportunity(item.text);
                        } else {
                          window.location.href = `/opportunities?create=true&title=${titleParam}&description=${descParam}`;
                        }
                      }}
                      className="p-1 rounded-md text-zinc-500 hover:text-amber-400 hover:bg-white/[0.05]"
                      aria-label="Convertir en Oportunidad RICE"
                      title="Convertir en Oportunidad RICE"
                    >
                      <Target className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-white/[0.05]"
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
            ))
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
