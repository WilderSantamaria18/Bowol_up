import React from 'react';
import { Sparkles, Plus, Layers, Clock, CheckCircle2, Filter } from 'lucide-react';
import { Project, Sprint } from '@/features/projects/types';
import { TaskBoardData } from '../types';

interface TaskBoardHeaderProps {
  project?: Project | null;
  projects?: Project[];
  onSelectProject?: (projectId: string) => void;
  sprints?: Sprint[];
  selectedSprintId?: string | null;
  onSelectSprint?: (sprintId: string | null) => void;
  boardData: TaskBoardData;
  onOpenCreateTask: () => void;
  onOpenAIDecomposer: () => void;
}

export const TaskBoardHeader: React.FC<TaskBoardHeaderProps> = ({
  project,
  projects = [],
  onSelectProject,
  sprints = [],
  selectedSprintId,
  onSelectSprint,
  boardData,
  onOpenCreateTask,
  onOpenAIDecomposer,
}) => {
  const totalTasks = Object.values(boardData).reduce((sum, list) => sum + list.length, 0);
  const doneTasks = boardData.DONE?.length || 0;
  const inProgressTasks = boardData.IN_PROGRESS?.length || 0;
  const totalHours = Object.values(boardData)
    .flatMap((list) => list)
    .reduce((sum, t) => sum + (t.estimateHours || 0), 0);

  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col gap-5 border-b border-white/[0.08] pb-6">
      {/* Top Bar: Title, Project Selector & Main Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
              Backlog & Ejecución
            </h1>
            {project && (
              <span className="inline-flex items-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-400">
                {project.name}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Ciclo de ejecución de ingeniería: Planificación, Sprints y Tareas Kanban
          </p>
        </div>

        <div className="flex items-center gap-3">
          {projects.length > 1 && onSelectProject && (
            <select
              value={project?.id || ''}
              onChange={(e) => onSelectProject(e.target.value)}
              className="rounded-xl border border-white/[0.08] bg-slate-900/60 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onOpenAIDecomposer}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 px-3.5 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-lg shadow-cyan-500/5"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" strokeWidth={1.5} />
            <span>Descomponer con IA</span>
          </button>

          <button
            onClick={onOpenCreateTask}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-medium text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* KPI Bar & Sprint Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-slate-950/40 p-3 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-5 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <span className="text-slate-400">Total:</span>
            <span className="font-semibold text-slate-200">{totalTasks} tareas</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-slate-400">En progreso:</span>
            <span className="font-semibold text-amber-300">{inProgressTasks}</span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
            <span className="text-slate-400">Completadas:</span>
            <span className="font-semibold text-emerald-300">{doneTasks} ({progressPct}%)</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" strokeWidth={1.5} />
            <span className="text-slate-400">Esfuerzo:</span>
            <span className="font-semibold text-cyan-300">{totalHours}h estimadas</span>
          </div>
        </div>

        {sprints.length > 0 && onSelectSprint && (
          <div className="flex items-center gap-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} />
            <span className="text-slate-400">Sprint:</span>
            <select
              value={selectedSprintId || ''}
              onChange={(e) => onSelectSprint(e.target.value ? e.target.value : null)}
              className="rounded-lg border border-white/[0.08] bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Todos los sprints</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
