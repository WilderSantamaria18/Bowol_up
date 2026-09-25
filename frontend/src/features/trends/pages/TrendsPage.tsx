import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookmarkCheck,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { trendService } from '../services/trendService';
import { Trend, TrendSourceCode, MarkRelevantPayload } from '../types';
import { TrendFilters } from '../components/TrendFilters';
import { TrendList } from '../components/TrendList';
import { TrendDetailModal } from '../components/TrendDetailModal';

export const TrendsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'all' | 'for-me'>('all');
  const [source, setSource] = useState<TrendSourceCode | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minScore, setMinScore] = useState<number | undefined>(undefined);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Global Trends Query
  const {
    data: trendsPage,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useQuery({
    queryKey: ['trends', source, searchQuery, minScore],
    queryFn: () =>
      trendService.getTrends({
        source,
        query: searchQuery || undefined,
        minScore,
        page: 0,
        size: 50,
      }),
  });

  // For-Me Trends Query
  const {
    data: forMePage,
    isLoading: isLoadingForMe,
    error: errorForMe,
  } = useQuery({
    queryKey: ['trends-for-me'],
    queryFn: () => trendService.getTrendsForMe(0, 50),
  });

  // Mark / Dismiss Mutations
  const markMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: MarkRelevantPayload }) =>
      trendService.markRelevant(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trends'] });
      queryClient.invalidateQueries({ queryKey: ['trends-for-me'] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => trendService.dismissRelevance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trends'] });
      queryClient.invalidateQueries({ queryKey: ['trends-for-me'] });
    },
  });

  // Sync Mutation
  const syncMutation = useMutation({
    mutationFn: () => trendService.triggerSync(10),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['trends'] });
      setSyncNotice(`Sincronización completada: ${res.totalFetched} tendencias analizadas.`);
      setTimeout(() => setSyncNotice(null), 5000);
    },
  });

  // AI Evaluate Mutation
  const evaluateMutation = useMutation({
    mutationFn: (id: string) => trendService.evaluateWithAi(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['trends'] });
      queryClient.invalidateQueries({ queryKey: ['trends-for-me'] });
      setSyncNotice(`Evaluación estratégica con IA completada con éxito (Score: ${res.score}/100).`);
      setTimeout(() => setSyncNotice(null), 5000);
    },
  });

  const handleToggleRelevance = async (trend: Trend) => {
    if (trend.isRelevantForTenant) {
      await dismissMutation.mutateAsync(trend.id);
    } else {
      await markMutation.mutateAsync({ id: trend.id });
    }
  };

  const handleEvaluateWithAi = async (trend: Trend) => {
    return await evaluateMutation.mutateAsync(trend.id);
  };

  const handleOpenDetails = (trend: Trend) => {
    setSelectedTrend(trend);
    setIsModalOpen(true);
  };

  const handleSaveRelevance = async (trendId: string, payload: MarkRelevantPayload) => {
    await markMutation.mutateAsync({ id: trendId, payload });
  };

  const handleDismissRelevance = async (trendId: string) => {
    await dismissMutation.mutateAsync(trendId);
  };

  const handleResetFilters = () => {
    setSource(undefined);
    setSearchQuery('');
    setMinScore(undefined);
  };

  const allTrends = trendsPage?.items || [];
  const forMeTrends = (forMePage?.items || []).map((item) => item.trend).filter(Boolean);

  const highTractionCount = allTrends.filter((t) => t.score >= 70).length;
  const strategicCount = forMePage?.totalElements || forMeTrends.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Strategic Stat Cards */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider">
              Intelligence Engine
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Explorador de Tendencias & Señales
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Detección continua de tecnología, algoritmos y repositorios de alta tracción normalizados mediante el algoritmo <strong className="text-zinc-200">TrendScore</strong>.
          </p>
        </div>

        {/* Mini stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 text-center min-w-[100px]">
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider block">
              Detectadas
            </span>
            <span className="text-lg font-bold text-white font-mono">
              {trendsPage?.totalElements || allTrends.length}
            </span>
          </div>

          <div className="rounded-xl bg-orange-500/5 border border-orange-500/20 p-3 text-center min-w-[100px]">
            <span className="text-[10px] text-orange-400 font-medium uppercase tracking-wider block">
              Alta Señal (&gt;70)
            </span>
            <span className="text-lg font-bold text-orange-300 font-mono">
              {highTractionCount}
            </span>
          </div>

          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 text-center min-w-[100px]">
            <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider block">
              Para mi empresa
            </span>
            <span className="text-lg font-bold text-emerald-300 font-mono">
              {strategicCount}
            </span>
          </div>
        </div>
      </div>

      {/* Sync Notification Banner */}
      {syncNotice && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-semibold transition-all relative ${
            activeTab === 'all'
              ? 'text-orange-400 border-b-2 border-orange-500 bg-white/[0.02]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Globe className="w-4 h-4" strokeWidth={1.5} />
          <span>Todas las Tendencias</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/[0.05] text-[10px] font-mono text-zinc-400">
            {trendsPage?.totalElements || allTrends.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('for-me')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-semibold transition-all relative ${
            activeTab === 'for-me'
              ? 'text-orange-400 border-b-2 border-orange-500 bg-white/[0.02]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" strokeWidth={1.5} />
          <span>Estratégicas para mi Empresa</span>
          <span className="px-1.5 py-0.2 rounded-full bg-orange-500/20 text-[10px] font-mono text-orange-300">
            {strategicCount}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'all' ? (
        <div>
          <TrendFilters
            source={source}
            onSourceChange={setSource}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            minScore={minScore}
            onMinScoreChange={setMinScore}
            onSync={() => syncMutation.mutate()}
            isSyncing={syncMutation.isPending}
          />

          <TrendList
            trends={allTrends}
            isLoading={isLoadingAll}
            error={errorAll as Error}
            onToggleRelevance={handleToggleRelevance}
            onOpenDetails={handleOpenDetails}
            onEvaluateWithAi={handleEvaluateWithAi}
            onResetFilters={handleResetFilters}
            markingTrendId={markMutation.isPending ? markMutation.variables?.id : null}
            evaluatingTrendId={evaluateMutation.isPending ? evaluateMutation.variables : null}
          />
        </div>
      ) : (
        <div>
          <TrendList
            trends={forMeTrends}
            isLoading={isLoadingForMe}
            error={errorForMe as Error}
            onToggleRelevance={handleToggleRelevance}
            onOpenDetails={handleOpenDetails}
            onEvaluateWithAi={handleEvaluateWithAi}
            markingTrendId={dismissMutation.isPending ? dismissMutation.variables : null}
            evaluatingTrendId={evaluateMutation.isPending ? evaluateMutation.variables : null}
          />
        </div>
      )}

      {/* Detail & Evaluation Modal */}
      <TrendDetailModal
        trend={selectedTrend}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTrend(null);
        }}
        onSaveRelevance={handleSaveRelevance}
        onDismissRelevance={handleDismissRelevance}
        onEvaluateWithAi={async (trendId: string) => await evaluateMutation.mutateAsync(trendId)}
      />
    </div>
  );
};
