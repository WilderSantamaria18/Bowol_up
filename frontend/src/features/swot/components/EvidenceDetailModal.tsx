import React, { useEffect } from 'react';
import { X, TrendingUp, Layers, Loader2 } from 'lucide-react';
import { useSwotEvidence } from '../hooks/useSwot';
import { Button } from '@/components/ui/Button';

interface EvidenceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  swotId: string;
  selectedEvidenceId?: string;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({
  isOpen,
  onClose,
  swotId,
  selectedEvidenceId,
}) => {
  const { data: evidences = [], isLoading } = useSwotEvidence(isOpen ? swotId : undefined);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0F0F12] border border-zinc-200 dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Layers className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 id="evidence-modal-title" className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">
                Evidencias de Mercado (Tendencias)
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Señales externas que fundamentan las oportunidades y riesgos del FODA
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar modal">
            <X className="w-4 h-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-600 dark:text-zinc-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-orange-400" strokeWidth={1.5} />
              <span className="text-xs">Cargando evidencias estratégicas...</span>
            </div>
          ) : evidences.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-500 text-xs">
              No hay evidencias de tendencias asociadas directamente a este FODA.
            </div>
          ) : (
            evidences.map((ev) => {
              const isSelected = !!selectedEvidenceId && (String(ev.id) === selectedEvidenceId || ev.trendId === selectedEvidenceId);
              return (
              <div
                key={ev.id}
                className={`p-4 rounded-xl border transition-colors space-y-2 ${
                  isSelected 
                    ? 'bg-sky-500/10 border-sky-500/30 ring-1 ring-sky-500/20' 
                    : 'bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.08]">
                      {ev.trendSource || 'Tendencia'}
                    </span>
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-white">{ev.trendTitle || 'Tendencia identificada'}</h4>
                    {isSelected && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-500/30">
                        Vinculada a este elemento
                      </span>
                    )}
                  </div>
                  {ev.trendScore !== undefined && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      <TrendingUp className="w-3 h-3" strokeWidth={1.5} />
                      {ev.trendScore}/100
                    </span>
                  )}
                </div>
                {ev.note && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{ev.note}</p>
                )}
              </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.01] flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
