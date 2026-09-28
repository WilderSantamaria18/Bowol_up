import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  TrendingUp, 
  Lightbulb, 
  CheckSquare, 
  Repeat, 
  Shield, 
  User, 
  Search, 
  RefreshCw 
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';

export const RecentActivityStream: React.FC = () => {
  const [filter, setFilter] = useState('');

  const { data: activities = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard-recent-activity'],
    queryFn: () => dashboardService.getActivity(),
    refetchInterval: 30000, // refresh every 30s
  });

  const getActionBadge = (action: string, entityType: string) => {
    const act = action.toUpperCase();
    if (act.includes('TREND') || entityType.includes('TREND')) {
      return { icon: TrendingUp, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
    }
    if (act.includes('OPPORTUNITY') || entityType.includes('OPPORTUNITY')) {
      return { icon: Lightbulb, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    }
    if (act.includes('TASK') || entityType.includes('TASK')) {
      return { icon: CheckSquare, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    }
    if (act.includes('SPRINT') || entityType.includes('SPRINT') || act.includes('PROJECT')) {
      return { icon: Repeat, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
    }
    if (act.includes('SSO') || act.includes('SECURITY') || act.includes('AUTH')) {
      return { icon: Shield, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
    }
    return { icon: Activity, color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' };
  };

  const filteredActivities = activities.filter((item) => {
    if (!filter) return true;
    const term = filter.toLowerCase();
    return (
      item.action.toLowerCase().includes(term) ||
      item.entityType.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      (item.actorEmail && item.actorEmail.toLowerCase().includes(term))
    );
  });

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      if (diffMinutes < 1) return 'Justo ahora';
      if (diffMinutes < 60) return `Hace ${diffMinutes}m`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `Hace ${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      return `Hace ${diffDays}d`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="rounded-3xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-2xl shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Activity className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Actividad Reciente del Ciclo
            </h3>
            <span className="text-[11px] text-zinc-400">
              Eventos estratégicos, auditoría y ejecución en tiempo real
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
          title="Actualizar actividad"
          aria-label="Refrescar actividad"
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-orange-500' : ''}`} strokeWidth={1.5} />
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" strokeWidth={1.5} />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrar por acción, entidad o usuario..."
          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
        />
      </div>

      {/* Stream list */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin mx-auto mb-2" />
          <span className="text-xs text-zinc-400 font-mono">Cargando eventos...</span>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="py-8 text-center text-xs text-zinc-400 space-y-1">
          <p>No hay eventos registrados en este periodo.</p>
          <span className="text-[11px] text-zinc-500">
            Las acciones en el radar, oportunidades o tareas se registrarán aquí automáticamente.
          </span>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {filteredActivities.map((act) => {
            const badge = getActionBadge(act.action, act.entityType);
            const Icon = badge.icon;

            return (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-zinc-50/70 dark:bg-white/[0.02] border border-zinc-200/50 dark:border-white/5 flex items-start gap-3 text-xs transition-colors hover:bg-zinc-100/50 dark:hover:bg-white/[0.04]"
              >
                <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${badge.color}`}>
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {act.action}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                      {formatRelativeTime(act.createdAt)}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {act.description}
                  </p>

                  {act.actorEmail && (
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 pt-0.5 font-mono">
                      <User className="w-3 h-3" strokeWidth={1.5} />
                      <span className="truncate">{act.actorEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
