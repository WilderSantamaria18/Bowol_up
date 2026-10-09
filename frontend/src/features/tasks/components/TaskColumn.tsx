import React from 'react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { Plus, ListTodo } from 'lucide-react';

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  wipOverloadedAssigneeIds?: Set<string>;
  onMove?: (taskId: string, targetStatus: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  onQuickAdd?: (status: TaskStatus) => void;
  onRequestBlock?: (task: Task) => void;
  onRequestDone?: (task: Task) => void;
}

const statusBadgeColors: Record<TaskStatus, string> = {
  BACKLOG: 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-500/20',
  TODO: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
  IN_PROGRESS: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  REVIEW: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
  DONE: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  CANCELED: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  BLOCKED: 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30',
};

export const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  title,
  tasks,
  wipOverloadedAssigneeIds = new Set(),
  onMove,
  onDelete,
  onQuickAdd,
  onRequestBlock,
  onRequestDone,
}) => {
  const badgeColor = statusBadgeColors[status] || statusBadgeColors.BACKLOG;
  const isInProgress = status === 'IN_PROGRESS';
  const hasWipBreach = isInProgress && wipOverloadedAssigneeIds.size > 0;

  return (
    <div
      data-testid={`task-column-${status}`}
      className={`flex min-w-[280px] max-w-[320px] flex-1 flex-col rounded-2xl border p-3.5 backdrop-blur-xl ${
        status === 'BLOCKED'
          ? 'border-red-300/80 dark:border-red-500/30 bg-red-50/50 dark:bg-slate-950/60 shadow-sm dark:shadow-red-950/20'
          : status === 'IN_PROGRESS' && hasWipBreach
          ? 'border-amber-300/80 dark:border-amber-500/30 bg-amber-50/50 dark:bg-slate-950/50 shadow-sm'
          : 'border-zinc-200/90 dark:border-white/[0.06] bg-zinc-100/70 dark:bg-slate-950/40'
      }`}
    >
      {/* Column Header */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold tracking-wider text-slate-800 dark:text-slate-300 uppercase">
            {title}
          </h3>
          <span
            className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeColor}`}
          >
            {tasks.length}
          </span>
          {isInProgress && (
            <span
              title="Fase 5.3: Máx 1 tarea activa simultánea por colaborador"
              className="text-[10px] text-slate-500 dark:text-slate-400"
            >
              (WIP 1/p)
            </span>
          )}
        </div>

        {onQuickAdd && (
          <button
            onClick={() => onQuickAdd(status)}
            title="Añadir tarea a esta columna"
            className="rounded-lg p-1 text-slate-500 dark:text-slate-400 hover:bg-zinc-200/70 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Column Cards */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto pr-0.5">
        {tasks.map((task) => {
          const assigneeKey = task.assigneeId || 'unassigned';
          const isWipExceeded = isInProgress && wipOverloadedAssigneeIds.has(assigneeKey);

          return (
            <TaskCard
              key={task.id}
              task={task}
              isWipExceeded={isWipExceeded}
              onMove={onMove}
              onDelete={onDelete}
              onRequestBlock={onRequestBlock}
              onRequestDone={onRequestDone}
            />
          );
        })}

        {tasks.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-900/[0.1] dark:border-white/[0.06] py-10 text-center">
            <ListTodo className="h-7 w-7 text-slate-600 mb-2" strokeWidth={1.5} />
            <p className="text-xs text-slate-500">Sin tareas</p>
          </div>
        )}
      </div>
    </div>
  );
};
