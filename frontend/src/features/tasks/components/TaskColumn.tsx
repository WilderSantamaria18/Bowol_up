import React from 'react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { Plus, ListTodo } from 'lucide-react';

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onMove?: (taskId: string, targetStatus: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  onQuickAdd?: (status: TaskStatus) => void;
}

const statusBadgeColors: Record<TaskStatus, string> = {
  BACKLOG: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  TODO: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  REVIEW: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  DONE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  title,
  tasks,
  onMove,
  onDelete,
  onQuickAdd,
}) => {
  const badgeColor = statusBadgeColors[status] || statusBadgeColors.BACKLOG;

  return (
    <div
      data-testid={`task-column-${status}`}
      className="flex min-w-[280px] max-w-[320px] flex-1 flex-col rounded-2xl border border-white/[0.06] bg-slate-950/40 p-3.5 backdrop-blur-xl"
    >
      {/* Column Header */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
            {title}
          </h3>
          <span
            className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeColor}`}
          >
            {tasks.length}
          </span>
        </div>

        {onQuickAdd && (
          <button
            onClick={() => onQuickAdd(status)}
            title="Añadir tarea a esta columna"
            className="rounded-lg p-1 text-slate-400 hover:bg-white/[0.08] hover:text-slate-100 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Column Cards */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto pr-0.5">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onMove={onMove}
            onDelete={onDelete}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.06] py-10 text-center">
            <ListTodo className="h-7 w-7 text-slate-600 mb-2" strokeWidth={1.5} />
            <p className="text-xs text-slate-500">Sin tareas</p>
          </div>
        )}
      </div>
    </div>
  );
};
