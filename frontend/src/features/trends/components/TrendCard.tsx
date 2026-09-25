import React from 'react';
import {
  ExternalLink,
  Star,
  GitFork,
  Eye,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Cpu,
  Video,
  Globe,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCopilot } from '@/features/copilot/context/CopilotContext';
import { Trend } from '../types';

interface TrendCardProps {
  trend: Trend;
  onToggleRelevance: (trend: Trend) => void;
  onOpenDetails: (trend: Trend) => void;
  onEvaluateWithAi?: (trend: Trend) => void;
  isMarking?: boolean;
  isEvaluating?: boolean;
}

export const TrendCard: React.FC<TrendCardProps> = ({
  trend,
  onToggleRelevance,
  onOpenDetails,
  onEvaluateWithAi,
  isMarking = false,
  isEvaluating = false,
}) => {
  const { openCopilot } = useCopilot();

  const getSourceIcon = (sourceCode: string) => {
    switch (sourceCode) {
      case 'GITHUB':
        return <Cpu className="w-3.5 h-3.5" strokeWidth={1.5} />;
      case 'YOUTUBE':
        return <Video className="w-3.5 h-3.5" strokeWidth={1.5} />;
      default:
        return <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />;
    }
  };

  const getScoreVariant = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (score >= 70) return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  };

  const stars = trend.metadata?.stars || trend.metadata?.stargazers_count;
  const forks = trend.metadata?.forks || trend.metadata?.forks_count;
  const views = trend.metadata?.views || trend.metadata?.view_count;

  return (
    <div className="group relative rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] hover:border-orange-500/30 p-5 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm shadow-xl">
      <div>
        {/* Header row: Source & Score Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-300">
              {getSourceIcon(trend.sourceCode)}
              {trend.sourceName || trend.sourceCode}
            </span>
            {trend.isRelevantForTenant && (
              <Badge variant="brand" className="text-[10px] py-0.5 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" strokeWidth={1.5} />
                {trend.relevanceScore ? `IA: ${trend.relevanceScore}` : 'Estratégico'}
              </Badge>
            )}
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold tracking-tight ${getScoreVariant(
              trend.score
            )}`}
            title={`TrendScore: ${trend.score}/100`}
          >
            <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{trend.score}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-zinc-100 group-hover:text-orange-400 transition-colors line-clamp-1 mb-1.5">
          {trend.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
          {trend.description || 'Sin descripción disponible.'}
        </p>

        {/* AI Insight Snippet if evaluated */}
        {trend.relevanceSummary && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-orange-500/[0.07] border border-orange-500/20 text-xs text-orange-200/90 leading-relaxed flex items-start gap-2 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="line-clamp-2 text-[11px] leading-relaxed">{trend.relevanceSummary}</p>
          </div>
        )}

        {/* Tags */}
        {trend.tags && trend.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {trend.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-zinc-400"
              >
                #{tag}
              </span>
            ))}
            {trend.tags.length > 4 && (
              <span className="text-[10px] text-zinc-500 self-center">
                +{trend.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Metrics & Actions */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
          {stars !== undefined && (
            <span className="flex items-center gap-1" title="Estrellas">
              <Star className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
              {Number(stars).toLocaleString()}
            </span>
          )}
          {forks !== undefined && (
            <span className="flex items-center gap-1" title="Forks">
              <GitFork className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
              {Number(forks).toLocaleString()}
            </span>
          )}
          {views !== undefined && (
            <span className="flex items-center gap-1" title="Vistas">
              <Eye className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
              {Number(views).toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onEvaluateWithAi && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEvaluateWithAi(trend)}
              disabled={isEvaluating}
              isLoading={isEvaluating}
              className="text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border border-orange-500/20 px-2.5"
              title="Evaluar relevancia estratégica con IA"
              aria-label="Evaluar con IA"
              leftIcon={Sparkles}
            >
              Evaluar
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenDetails(trend)}
            className="text-xs text-zinc-300 hover:text-white"
          >
            Detalles
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              openCopilot({
                contextType: 'TREND',
                contextId: trend.id,
                title: 'Estrategia: ' + trend.title,
                initialMessage: `Hola Copilot, me gustaría profundizar en la tendencia "${trend.title}" y evaluar cómo impacta en nuestro modelo de negocio.`
              })
            }
            className="text-xs text-zinc-400 hover:text-orange-400"
            title="Consultar con Copilot"
            aria-label="Consultar con Copilot"
          >
            <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
          </Button>

          <Button
            variant={trend.isRelevantForTenant ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onToggleRelevance(trend)}
            disabled={isMarking}
            className={`text-xs ${
              trend.isRelevantForTenant
                ? 'text-orange-400 border border-orange-500/30'
                : 'text-zinc-400 hover:text-orange-400'
            }`}
            title={trend.isRelevantForTenant ? 'Quitar de guardadas' : 'Guardar para mi empresa'}
            aria-label={trend.isRelevantForTenant ? 'Desmarcar relevancia' : 'Marcar como relevante'}
          >
            {trend.isRelevantForTenant ? (
              <BookmarkCheck className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
            ) : (
              <Bookmark className="w-4 h-4" strokeWidth={1.5} />
            )}
          </Button>

          <a
            href={trend.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
            title="Abrir recurso externo"
            aria-label="Abrir enlace externo"
          >
            <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </div>
  );
};
