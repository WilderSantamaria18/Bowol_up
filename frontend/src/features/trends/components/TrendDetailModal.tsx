import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  TrendingUp,
  Cpu,
  Video,
  Globe,
  Sparkles,
  BookmarkCheck,
  Trash2,
  Zap,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useCopilot } from '@/features/copilot/context/CopilotContext';
import { Trend, MarkRelevantPayload, TrendRelevance } from '../types';

interface TrendDetailModalProps {
  trend: Trend | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveRelevance: (trendId: string, payload: MarkRelevantPayload) => Promise<void>;
  onDismissRelevance: (trendId: string) => Promise<void>;
  onEvaluateWithAi?: (trendId: string) => Promise<TrendRelevance>;
  onConvertToOpportunity?: (title: string, description: string) => void;
}

export const TrendDetailModal: React.FC<TrendDetailModalProps> = ({
  trend,
  isOpen,
  onClose,
  onSaveRelevance,
  onDismissRelevance,
  onEvaluateWithAi,
  onConvertToOpportunity,
}) => {
  if (!isOpen || !trend) return null;

  const { openCopilot } = useCopilot();

  const [score, setScore] = useState<number>(trend.relevanceScore || trend.score);
  const [aiSummary, setAiSummary] = useState<string>(trend.relevanceSummary || '');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>(trend.tags || []);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEvaluatingAi, setIsEvaluatingAi] = useState<boolean>(false);
  const [aiInsights, setAiInsights] = useState<{
    strategicAlignment?: string | null;
    recommendedActions?: string[] | null;
    tokensUsed?: number | null;
  } | null>(null);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleEvaluateAi = async () => {
    if (!onEvaluateWithAi) return;
    try {
      setIsEvaluatingAi(true);
      const res = await onEvaluateWithAi(trend.id);
      if (res) {
        setScore(res.score);
        if (res.aiSummary) setAiSummary(res.aiSummary);
        if (res.tags && res.tags.length > 0) setTags(res.tags);
        setAiInsights({
          strategicAlignment: res.strategicAlignment,
          recommendedActions: res.recommendedActions,
          tokensUsed: res.tokensUsed,
        });
      }
    } finally {
      setIsEvaluatingAi(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await onSaveRelevance(trend.id, {
        score,
        aiSummary: aiSummary.trim() || undefined,
        tags,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    try {
      setIsSubmitting(true);
      await onDismissRelevance(trend.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0D0E12] border border-white/[0.1] rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300">
                {trend.sourceCode === 'GITHUB' ? (
                  <Cpu className="w-3.5 h-3.5" strokeWidth={1.5} />
                ) : trend.sourceCode === 'YOUTUBE' ? (
                  <Video className="w-3.5 h-3.5" strokeWidth={1.5} />
                ) : (
                  <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
                )}
                {trend.sourceName || trend.sourceCode}
              </span>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Score Global: {trend.score}</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
              {trend.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Descripción
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
              {trend.description || 'Sin descripción disponible.'}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Recurso Original
            </h4>
            <a
              href={trend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-orange-400 hover:text-orange-300 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>{trend.url}</span>
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
            </a>
          </div>

          {/* Strategic Relevance Box */}
          <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-orange-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
                <h4 className="text-sm font-semibold text-orange-300">
                  Evaluación Estratégica con IA
                </h4>
                {aiInsights?.strategicAlignment && (
                  <Badge
                    variant={aiInsights.strategicAlignment === 'HIGH' ? 'success' : 'brand'}
                    className="text-[10px] uppercase font-bold tracking-wider py-0.5"
                  >
                    Alineación {aiInsights.strategicAlignment}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-orange-400 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  Score: {score}/100
                </span>
                {onEvaluateWithAi && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleEvaluateAi}
                    disabled={isEvaluatingAi || isSubmitting}
                    isLoading={isEvaluatingAi}
                    className="text-xs text-orange-300 hover:text-orange-200 border-orange-500/30 hover:bg-orange-500/10"
                    leftIcon={Sparkles}
                  >
                    Evaluar con IA
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClose();
                    openCopilot({
                      contextType: 'TREND',
                      contextId: trend.id,
                      title: 'Estrategia: ' + trend.title,
                      initialMessage: `Hola Copilot, quiero analizar la tendencia "${trend.title}" y evaluar cómo implementarla de forma prioritaria en nuestra empresa.`
                    });
                  }}
                  className="text-xs text-zinc-300 hover:text-white border border-white/[0.08] hover:bg-white/[0.05]"
                  leftIcon={MessageSquare}
                  title="Abrir diálogo estratégico con BOWOL Copilot"
                >
                  Consultar Copilot
                </Button>
              </div>
            </div>

            {/* AI Insights Bar if available */}
            {aiInsights && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                  Evaluación estratégica completada por el motor de IA
                </span>
                {aiInsights.tokensUsed ? (
                  <span className="flex items-center gap-1 text-emerald-400/90 font-mono">
                    <Zap className="w-3 h-3 text-emerald-400" strokeWidth={1.5} />
                    {aiInsights.tokensUsed.toLocaleString()} tokens
                  </span>
                ) : null}
              </div>
            )}

            {/* Recommended Actions from AI */}
            {aiInsights?.recommendedActions && aiInsights.recommendedActions.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-orange-300">
                  Acciones Tácticas Recomendadas por la IA:
                </label>
                <div className="space-y-1.5">
                  {aiInsights.recommendedActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-lg bg-black/30 border border-orange-500/15 text-xs text-zinc-200 leading-relaxed"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Alineación / Relevancia Interna (0 a 100):
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Hipótesis de Aplicabilidad o Notas de Análisis:
              </label>
              <textarea
                value={aiSummary}
                onChange={(e) => setAiSummary(e.target.value)}
                placeholder="Ej: Utilizar este modelo localmente para automatizar la extracción de datos sin incurrir en costes de API por token..."
                rows={3}
                className="w-full text-xs p-3 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Etiquetas de Priorización:
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Añadir etiqueta (ej: infraestructura, q3)..."
                  className="text-xs h-8"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddTag}
                  className="text-xs h-8"
                >
                  Añadir
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-zinc-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {trend.isRelevantForTenant && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                disabled={isSubmitting}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                leftIcon={Trash2}
              >
                Descartar
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose();
                const title = `Aprovechar: ${trend.title}`;
                const desc = aiSummary || trend.description || '';
                if (onConvertToOpportunity) {
                  onConvertToOpportunity(title, desc);
                } else {
                  window.location.href = `/opportunities?create=true&title=${encodeURIComponent(title)}&description=${encodeURIComponent(desc)}`;
                }
              }}
              leftIcon={Target}
              className="text-xs text-amber-300 hover:text-amber-200 border-amber-500/30 hover:bg-amber-500/10"
            >
              Crear Oportunidad RICE
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSubmitting}
              leftIcon={BookmarkCheck}
            >
              Guardar Relevancia
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
