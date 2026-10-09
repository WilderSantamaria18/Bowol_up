import React from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import {
  Clock,
  Trash2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  User,
  Calendar,
  Lock,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isWipExceeded?: boolean;
  onMove?: (taskId: string, targetStatus: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  onRequestBlock?: (task: Task) => void;
  onRequestDone?: (task: Task) => void;
}

const priorityStyles: Record<TaskPriority, { text: string; bg: string; border: string }> = {
  URGENT: { text: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/25' },
  HIGH: { text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/25' },
  MEDIUM: { text: 'text-cyan-700 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10', border: 'border-cyan-200 dark:border-cyan-500/25' },
  LOW: { text: 'text-slate-700 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/25' },
};

const statusOrder: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isWipExceeded,
  onMove,
  onDelete,
  onRequestBlock,
  onRequestDone,
}) => {
  const priorityStyle = priorityStyles[task.priority] || priorityStyles.MEDIUM;
  const isBlocked = task.status === 'BLOCKED';
  const isDone = task.status === 'DONE';
  const isInProgress = task.status === 'IN_PROGRESS';

  const currentIndex = statusOrder.indexOf(task.status);
  const prevStatus: TaskStatus | null = isBlocked
    ? 'IN_PROGRESS'
    : currentIndex > 0
    ? statusOrder[currentIndex - 1]
    : null;
  const nextStatus: TaskStatus | null = isBlocked
    ? 'IN_PROGRESS'
    : currentIndex >= 0 && currentIndex < statusOrder.length - 1
    ? statusOrder[currentIndex + 1]
    : null;

  const handleNextClick = () => {
    if (!onMove) return;
    if (nextStatus === 'BLOCKED' && onRequestBlock) {
      onRequestBlock(task);
    } else if (nextStatus === 'DONE' && onRequestDone) {
      onRequestDone(task);
    } else if (nextStatus) {
      onMove(task.id, nextStatus);
    }
  };

  const handlePrevClick = () => {
    if (!onMove || !prevStatus) return;
    onMove(task.id, prevStatus);
  };

  return (
    <div
      data-testid={`task-card-${task.id}`}
      className={`group relative rounded-xl border p-4 backdrop-blur-md transition-all duration-200 hover:shadow-md dark:hover:shadow-lg ${
        isBlocked
          ? 'border-red-300 dark:border-red-500/40 bg-red-50/80 dark:bg-red-950/20 hover:border-red-400 dark:hover:border-red-500/60 shadow-sm'
          : isDone
          ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/15 hover:border-emerald-400 dark:hover:border-emerald-500/50 shadow-sm'
          : isInProgress && isWipExceeded
          ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/15 hover:border-amber-400 dark:hover:border-amber-500/60 shadow-sm'
          : 'border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-slate-900/60 hover:border-zinc-300 dark:hover:border-white/[0.18] shadow-sm dark:shadow-none'
      }`}
    >
      {/* Top Header: Priority, WIP warning, Actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide ${priorityStyle.text} ${priorityStyle.bg} ${priorityStyle.border}`}
          >
            {task.priority}
          </span>

          {isBlocked && (
            <span className="inline-flex items-center gap-1 rounded-md bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/30 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:text-red-300">
              <ShieldAlert className="h-3 w-3" />
              <span>BLOQUEADA</span>
            </span>
          )}

          {isInProgress && isWipExceeded && (
            <span
              title="Límite WIP superado: más de 1 tarea activa asignada (Fase 5.3)"
              className="inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 px-1.5 py-0.5 text-[9px] font-semibold text-amber-800 dark:text-amber-300"
            >
              <AlertTriangle className="h-2.5 w-2.5" />
              <span>WIP &gt; 1</span>
            </span>
          )}

          {isDone && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-2.5 w-2.5" />
              <span>LISTO</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Quick block button if not yet blocked or done */}
          {!isBlocked && !isDone && onRequestBlock && (
            <button
              onClick={() => onRequestBlock(task)}
              title="Activar Protocolo de Bloqueo"
              className="text-slate-400 dark:text-slate-500 opacity-0 transition-opacity hover:text-red-600 dark:hover:text-red-400 group-hover:opacity-100 p-0.5"
            >
              <Lock className="h-3 w-3" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              title="Eliminar tarea"
              className="text-slate-400 dark:text-slate-500 opacity-0 transition-opacity hover:text-rose-600 dark:hover:text-rose-400 group-hover:opacity-100 p-0.5"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4 className="mt-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* BLOCKED Protocol Banner */}
      {isBlocked && (
        <div className="mt-3 p-2.5 rounded-xl bg-red-100/70 dark:bg-red-950/50 border border-red-300 dark:border-red-500/30 text-xs space-y-1.5">
          {task.blockedReason && (
            <p className="text-red-900 dark:text-red-200 text-[11px] leading-tight">
              <span className="font-semibold text-red-700 dark:text-red-400">Causa:</span> {task.blockedReason}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-red-700/80 dark:text-red-300/80 pt-1 border-t border-red-200 dark:border-red-900/50">
            {task.blockedResolver && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3 text-red-600 dark:text-red-400" />
                <span>{task.blockedResolver}</span>
              </span>
            )}
            {task.blockedReviewDate && (
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="h-3 w-3 text-red-600 dark:text-red-400" />
                <span>Revisión: {task.blockedReviewDate}</span>
              </span>
            )}
          </div>
          {onMove && (
            <button
              type="button"
              onClick={() => onMove(task.id, 'IN_PROGRESS')}
              className="w-full mt-1 py-1 rounded-lg bg-red-200/80 hover:bg-red-300 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-900 dark:text-red-200 text-[11px] font-semibold border border-red-300 dark:border-red-500/30 transition-colors"
            >
              Desbloquear Tarea
            </button>
          )}
        </div>
      )}

      {/* DONE Acceptance Criteria Badge */}
      {isDone && task.acceptanceEvidence && (
        <div className="mt-3 p-2 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/20 text-[11px] text-emerald-900 dark:text-emerald-300 space-y-1">
          <p className="line-clamp-1">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Evidencia:</span> {task.acceptanceEvidence}
          </p>
          {task.acceptanceReviewedBy && (
            <p className="text-[10px] text-emerald-800/80 dark:text-emerald-400/80">
              Revisado por: <span className="font-medium text-emerald-950 dark:text-emerald-200">{task.acceptanceReviewedBy}</span>
            </p>
          )}
        </div>
      )}

      {/* Card Footer: Hours & Next/Prev Controls */}
      <div className="mt-3.5 flex items-center justify-between border-t border-zinc-200/80 dark:border-white/[0.06] pt-3 text-[11px] text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
          <span>{task.estimateHours ? `${task.estimateHours}h` : 'Sin estimar'}</span>
        </div>

        {onMove && (
          <div className="flex items-center gap-1">
            {prevStatus && !isBlocked && (
              <button
                onClick={handlePrevClick}
                title={`Mover a ${prevStatus}`}
                className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
              </button>
            )}

            {nextStatus && (
              <button
                onClick={handleNextClick}
                title={`Mover a ${nextStatus}`}
                className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition-colors font-medium"
              >
                <span className="capitalize">{nextStatus.toLowerCase().replace('_', ' ')}</span>
                <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
