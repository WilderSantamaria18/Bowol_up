import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Sparkles, 
  ArrowUpRight, 
  CheckSquare, 
  Repeat, 
  MoreHorizontal, 
  Trash2, 
  Edit3, 
  Lightbulb, 
  FlaskConical 
} from 'lucide-react';
import { Project, ProjectStatus } from '../types';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onDecomposeAI: (project: Project) => void;
}

const statusConfig: Record<ProjectStatus, { label: string; badgeClass: string; dotClass: string }> = {
  PLANNING: {
    label: 'Planificación',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    dotClass: 'bg-blue-500',
  },
  ACTIVE: {
    label: 'En Ejecución',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    dotClass: 'bg-emerald-500',
  },
  PAUSED: {
    label: 'Pausado',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    dotClass: 'bg-amber-500',
  },
  COMPLETED: {
    label: 'Completado',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    dotClass: 'bg-purple-500',
  },
  ARCHIVED: {
    label: 'Archivado',
    badgeClass: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
    dotClass: 'bg-zinc-500',
  },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onDecomposeAI,
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const statusInfo = statusConfig[project.status] || statusConfig.PLANNING;

  return (
    <div 
      className="group relative rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] p-5 shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between"
      data-testid={`project-card-${project.id}`}
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusInfo.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
              {statusInfo.label}
            </span>

            {/* Traceability badges */}
            {project.opportunityId && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Lightbulb className="w-3 h-3" strokeWidth={1.5} />
                Oportunidad RICE
              </span>
            )}
            {project.experimentId && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <FlaskConical className="w-3 h-3" strokeWidth={1.5} />
                Hipótesis Validada
              </span>
            )}
          </div>

          {/* Context menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Opciones del proyecto"
            >
              <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-44 z-30 rounded-xl bg-white dark:bg-[#181920] border border-zinc-200 dark:border-white/10 shadow-xl py-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(project);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Editar Iniciativa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDecomposeAI(project);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Descomponer con IA
                  </button>
                  <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(project.id);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 
          onClick={() => navigate(`/projects/${project.id}`)}
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition-colors line-clamp-2 mb-2"
        >
          {project.name}
        </h3>

        {/* Description / Objective */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-4">
          {project.description || 'Sin objetivo detallado asignado. Haz clic para configurar metas de ejecución y épicas asociadas.'}
        </p>
      </div>

      <div>
        {/* Dates & Timeline */}
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-4 pt-3 border-t border-zinc-100 dark:border-white/5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
            <span>
              {project.startDate || 'Sin inicio'} &rarr; {project.endDate || 'Abierto'}
            </span>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-white/5">
          <button
            type="button"
            onClick={() => navigate(`/tasks?projectId=${project.id}`)}
            className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
            title="Abrir Tablero Kanban de Tareas"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
            <span>Kanban</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/sprints?projectId=${project.id}`)}
            className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
            title="Ver Sprints de esta Iniciativa"
          >
            <Repeat className="w-3.5 h-3.5 text-orange-500" strokeWidth={1.5} />
            <span>Sprints</span>
          </button>

          <button
            type="button"
            onClick={() => onDecomposeAI(project)}
            className="py-1.5 px-2 rounded-lg text-xs font-medium bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center transition-colors"
            title="Descomponer en historias y tareas con IA"
          >
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={() => navigate(`/projects/${project.id}`)}
            className="py-1.5 px-2 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors"
            title="Ver Detalle Estratégico"
          >
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
