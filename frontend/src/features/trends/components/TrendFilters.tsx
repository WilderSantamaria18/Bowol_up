import React from 'react';
import { Search, RefreshCw, Filter, Cpu, Video, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TrendSourceCode } from '../types';

interface TrendFiltersProps {
  source?: TrendSourceCode;
  onSourceChange: (source?: TrendSourceCode) => void;
  query: string;
  onQueryChange: (query: string) => void;
  minScore?: number;
  onMinScoreChange: (minScore?: number) => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const TrendFilters: React.FC<TrendFiltersProps> = ({
  source,
  onSourceChange,
  query,
  onQueryChange,
  minScore,
  onMinScoreChange,
  onSync,
  isSyncing,
}) => {
  const sources: { code?: TrendSourceCode; label: string; icon: React.ReactNode }[] = [
    { code: undefined, label: 'Todas las fuentes', icon: <Globe className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { code: 'GITHUB', label: 'GitHub', icon: <Cpu className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { code: 'YOUTUBE', label: 'YouTube', icon: <Video className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { code: 'HACKERNEWS', label: 'Hacker News', icon: <Globe className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { code: 'REDDIT', label: 'Reddit', icon: <Globe className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { code: 'DEVTO', label: 'Dev.to', icon: <Globe className="w-3.5 h-3.5" strokeWidth={1.5} /> },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Top row: search + min score + sync */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar por tecnología, palabras clave, modelos..."
            className="pl-10 text-xs h-10 bg-white/[0.03] border-white/[0.08] focus:border-orange-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Min Score filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300">
            <Filter className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
            <select
              value={minScore || ''}
              onChange={(e) => onMinScoreChange(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-transparent border-none text-xs text-zinc-200 focus:outline-none cursor-pointer"
              aria-label="Filtro de puntuación mínima"
            >
              <option value="" className="bg-zinc-900 text-zinc-300">Cualquier Score</option>
              <option value="70" className="bg-zinc-900 text-zinc-300">Score &gt;= 70 (Alta tracción)</option>
              <option value="85" className="bg-zinc-900 text-zinc-300">Score &gt;= 85 (Viral / Crítico)</option>
            </select>
          </div>

          <Button
            variant="glass"
            size="sm"
            onClick={onSync}
            disabled={isSyncing}
            isLoading={isSyncing}
            leftIcon={RefreshCw}
            className="text-xs h-10 whitespace-nowrap"
            title="Sincronizar fuentes externas ahora"
          >
            Sincronizar Fuentes
          </Button>
        </div>
      </div>

      {/* Source pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sources.map((s) => {
          const isSelected = source === s.code;
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => onSourceChange(s.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm shadow-orange-500/10'
                  : 'bg-white/[0.02] text-zinc-400 border border-white/[0.06] hover:text-zinc-200 hover:bg-white/[0.05]'
              }`}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
