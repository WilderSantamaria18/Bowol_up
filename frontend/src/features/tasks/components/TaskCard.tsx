import React from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { Clock, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onMove?: (taskId: string, targetStatus: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
}

const priorityStyles: Record<TaskPriority, { text: string; bg: string; border: string }> = {
  URGENT: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/25' },
  HIGH: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25' },
  MEDIUM: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/25' },
  LOW: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/25' },
};

const statusOrder: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

export const TaskCard: React.FC<TaskCardProps> = ({ task, onMove, onDelete }) => {
  const priorityStyle = priorityStyles[task.priority] || priorityStyles.MEDIUM;

  const currentIndex = statusOrder.indexOf(task.status);
  const prevStatus = currentIndex > 0 ? statusOrder[currentIndex - 1] : null;
  const nextStatus = currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;

  return (
    <div
      data-testid={`task-card-${task.id}`}
      className="group relative rounded-xl border border-white/[0.08] bg-slate-900/60 p-4 backdrop-blur-md transition-all duration-200 hover:border-white/[0.18] hover:shadow-lg hover:shadow-cyan-500/[0.03]"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide ${priorityStyle.text} ${priorityStyle.bg} ${priorityStyle.border}`}
        >
          {task.priority}
        </span>

        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            title="Eliminar tarea"
            className="text-slate-500 opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <h4 className="mt-2.5 text-sm font-medium text-slate-100 leading-snug">
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="mt-3.5 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} />
          <span>{task.estimateHours ? `${task.estimateHours}h` : 'Sin estimar'}</span>
        </div>

        {onMove && (
          <div className="flex items-center gap-1">
            {prevStatus && (
              <button
                onClick={() => onMove(task.id, prevStatus)}
                title={`Mover a ${prevStatus}`}
                className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
              </button>
            )}
            {nextStatus && (
              <button
                onClick={() => onMove(task.id, nextStatus)}
                title={`Mover a ${nextStatus}`}
                className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-cyan-400 hover:bg-cyan-500/10 transition-colors"
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
