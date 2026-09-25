import React from 'react';
import { 
  Calendar, 
  Target, 
  CheckCircle2, 
  Play, 
  Trash2, 
  XCircle,
  BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Sprint, SprintStatus } from '../types';

interface SprintCardProps {
  sprint: Sprint;
  onStart?: (sprintId: string) => void;
  onComplete?: (sprint: Sprint) => void;
  onCancel?: (sprintId: string) => void;
  onDelete?: (sprintId: string) => void;
  onViewBurndown?: (sprint: Sprint) => void;
  isStarting?: boolean;
}

const statusBadgeStyles: Record<SprintStatus, string> = {
  PLANNED: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  COMPLETED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  CANCELED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

const statusLabels: Record<SprintStatus, string> = {
  PLANNED: 'Planificado',
  ACTIVE: 'En Curso',
  COMPLETED: 'Completado',
  CANCELED: 'Cancelado',
};

export const SprintCard: React.FC<SprintCardProps> = ({
  sprint,
  onStart,
  onComplete,
  onCancel,
  onDelete,
  onViewBurndown,
  isStarting = false,
}) => {
  const totalTasks = sprint.totalTasks ?? 0;
  const completedTasks = sprint.completedTasks ?? 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="group relative rounded-xl bg-[#0F0F12] border border-white/[0.08] hover:border-white/[0.15] p-5 transition-all duration-200 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  statusBadgeStyles[sprint.status]
                }`}
              >
                {statusLabels[sprint.status]}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                <Calendar className="w-3 h-3" strokeWidth={1.5} />
                <span>
                  {sprint.startDate} - {sprint.endDate}
                </span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
              {sprint.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onDelete && sprint.status !== 'ACTIVE' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(sprint.id)}
                className="w-7 h-7 text-zinc-500 hover:text-rose-400"
                title="Eliminar sprint"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Button>
            )}
          </div>
        </div>

        {sprint.goal && (
          <div className="flex items-start gap-1.5 text-xs text-zinc-400 bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 mb-4">
            <Target className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="line-clamp-2">{sprint.goal}</p>
          </div>
        )}

        {/* Progress Bar & KPIs */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Progreso de Tareas</span>
            <span className="font-mono text-zinc-200">
              {completedTasks}/{totalTasks} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                sprint.status === 'COMPLETED'
                  ? 'bg-cyan-500'
                  : sprint.status === 'ACTIVE'
                  ? 'bg-emerald-500'
                  : 'bg-zinc-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {sprint.totalEstimateHours !== undefined && sprint.totalEstimateHours > 0 && (
            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1">
              <span>Horas Estimadas:</span>
              <span>
                {sprint.completedEstimateHours ?? 0}h / {sprint.totalEstimateHours}h
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
        <div>
          {onViewBurndown && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewBurndown(sprint)}
              className="text-xs gap-1.5 text-zinc-400 hover:text-cyan-400 px-2 h-7"
            >
              <BarChart2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              Burndown
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {sprint.status === 'PLANNED' && onStart && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onStart(sprint.id)}
              disabled={isStarting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs h-7 px-2.5"
            >
              <Play className="w-3 h-3" strokeWidth={1.5} />
              Iniciar Sprint
            </Button>
          )}

          {sprint.status === 'ACTIVE' && onComplete && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onComplete(sprint)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white gap-1.5 text-xs h-7 px-2.5"
            >
              <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
              Completar Sprint
            </Button>
          )}

          {sprint.status === 'ACTIVE' && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(sprint.id)}
              className="text-zinc-500 hover:text-rose-400 text-xs h-7 px-2"
              title="Cancelar sprint y devolver tareas al backlog"
            >
              <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
