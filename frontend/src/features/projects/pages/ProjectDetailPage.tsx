import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Calendar, 
  Sparkles, 
  CheckSquare, 
  Repeat, 
  Activity, 
  Plus, 
  Lightbulb, 
  AlertCircle,
  UserPlus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { projectService } from '../services/projectService';
import { taskService } from '@/features/tasks/services/taskService';
import { sprintService } from '@/features/sprints/services/sprintService';
import { opportunityService } from '@/features/opportunities/services/opportunityService';
import { ProjectMemberRole } from '../types';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { AIDecomposeProjectModal } from '../components/AIDecomposeProjectModal';
import { CreateSprintModal } from '@/features/sprints/components/CreateSprintModal';

type DetailTab = 'OVERVIEW' | 'SPRINTS' | 'TASKS' | 'MEMBERS';

export const ProjectDetailPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<DetailTab>('OVERVIEW');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIDecomposeOpen, setIsAIDecomposeOpen] = useState(false);
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<ProjectMemberRole>('CONTRIBUTOR');

  // Query Project details
  const { 
    data: project, 
    isLoading: loadingProject, 
    error: projectError 
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProjectById(projectId!),
    enabled: Boolean(projectId),
  });

  // Query Sprints for this project
  const { data: sprints = [] } = useQuery({
    queryKey: ['project-sprints', projectId],
    queryFn: () => projectService.getProjectSprints(projectId!),
    enabled: Boolean(projectId),
  });

  // Query Tasks for this project
  const { data: tasks = [] } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => taskService.getTasks(projectId!),
    enabled: Boolean(projectId),
  });

  // Query Members for this project
  const { data: members = [] } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectService.getProjectMembers(projectId!),
    enabled: Boolean(projectId),
  });

  // Query Origin Opportunity if linked
  const { data: originOpportunity } = useQuery({
    queryKey: ['opportunity', project?.opportunityId],
    queryFn: () => opportunityService.getOpportunityById(project!.opportunityId!),
    enabled: Boolean(project?.opportunityId),
  });

  // Mutations
  const updateProjectMutation = useMutation({
    mutationFn: (payload: any) => projectService.updateProject(projectId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsEditModalOpen(false);
    },
  });

  const createSprintMutation = useMutation({
    mutationFn: (payload: any) => sprintService.createSprint(projectId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-sprints', projectId] });
      setIsCreateSprintOpen(false);
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (payload: any) => projectService.addProjectMember(projectId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      setNewMemberEmail('');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectService.removeProjectMember(projectId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });

  if (loadingProject) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin mb-3" />
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Cargando detalle del proyecto...
        </span>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4">
        <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
          <AlertCircle className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Iniciativa no encontrada
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          El proyecto solicitado no existe o no tienes permisos de acceso en esta organización.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Iniciativas
        </Button>
      </div>
    );
  }

  // Task statistics
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const backlogTasks = tasks.filter((t) => t.status === 'BACKLOG' || t.status === 'TODO').length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>Volver a Iniciativas & Proyectos</span>
        </button>

        <span className="text-xs font-mono text-zinc-400">
          ID: {project.id.slice(0, 8)}...
        </span>
      </div>

      {/* Strategic Traceability Stepper Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/[0.04] via-purple-500/[0.04] to-emerald-500/[0.04] border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
              Trazabilidad Estratégica Integral:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">Radar Señales</span>
            <span>&rarr;</span>
            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">FODA Dinámico</span>
            <span>&rarr;</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">Oportunidad RICE</span>
            <span>&rarr;</span>
            <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold border border-orange-500/30">Proyecto Activo</span>
            <span>&rarr;</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Sprints & Tareas</span>
          </div>
        </div>
      </div>

      {/* Project Hero Card with Liquid Glass */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-2xl shadow-xl flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {project.status}
            </span>

            {originOpportunity && (
              <span 
                onClick={() => navigate('/opportunities')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 cursor-pointer hover:bg-amber-500/20 transition-colors"
                title="Ver oportunidad de origen"
              >
                <Lightbulb className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Origen: {originOpportunity.title}</span>
              </span>
            )}

            {(project.startDate || project.endDate) && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                {project.startDate || 'Inicio abierto'} &rarr; {project.endDate || 'Fin abierto'}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {project.name}
          </h1>

          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {project.description || 'Sin objetivo detallado asignado. Utiliza el botón de edición para definir métricas de éxito y criterios de aceptación.'}
          </p>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-zinc-500 dark:text-zinc-400">Progreso de Entrega Ágil</span>
              <span className="font-mono text-orange-600 dark:text-orange-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-white/5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsAIDecomposeOpen(true)}
            className="gap-2 shadow-lg shadow-orange-500/20"
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            <span>Descomponer con IA</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/tasks?projectId=${project.id}`)}
            className="gap-2"
          >
            <CheckSquare className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
            <span>Tablero Kanban</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/sprints?projectId=${project.id}`)}
            className="gap-2"
          >
            <Repeat className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
            <span>Planificar Sprints</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="text-zinc-500"
          >
            <span>Editar Información</span>
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-2">
        {[
          { id: 'OVERVIEW', label: 'Resumen & Métricas', count: undefined },
          { id: 'SPRINTS', label: 'Sprints de Innovación', count: sprints.length },
          { id: 'TASKS', label: 'Tareas del Backlog', count: tasks.length },
          { id: 'MEMBERS', label: 'Equipo & Roles', count: members.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as DetailTab)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950' : 'bg-zinc-100 dark:bg-white/10'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Quick stats */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Estado de Tareas
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Backlog / Pendientes</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{backlogTasks}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-500">En Curso (In Progress)</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{inProgressTasks}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-500">Finalizadas (Done)</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{doneTasks}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-3 border-t border-zinc-100 dark:border-white/5 font-semibold">
                <span>Total Tareas</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">{totalTasks}</span>
              </div>
            </div>
          </div>

          {/* Sprints status */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Ciclos de Sprint
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsCreateSprintOpen(true)}
                className="text-[11px] py-1 px-2"
              >
                + Sprint
              </Button>
            </div>
            {sprints.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">
                Aún no hay sprints configurados para esta iniciativa.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {sprints.map((s) => (
                  <div key={s.id} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{s.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{s.startDate} &rarr; {s.endDate}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Traceability origin detail */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Fundamento Estratégico
            </h3>
            {originOpportunity ? (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 space-y-1">
                  <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">
                    Oportunidad Validada
                  </span>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{originOpportunity.title}</p>
                  <p className="text-zinc-500 text-[11px] line-clamp-2">{originOpportunity.description}</p>
                </div>
                {originOpportunity.priorityScore && (
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-50 dark:bg-white/[0.02]">
                    <span className="text-zinc-500">Puntaje RICE:</span>
                    <span className="font-mono font-bold text-amber-500">{originOpportunity.priorityScore} pts</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 py-4 text-center">
                Iniciativa creada directamente sin enlace a oportunidad previa.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sprints Tab */}
      {activeTab === 'SPRINTS' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Sprints Planificados y en Curso ({sprints.length})
            </h3>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsCreateSprintOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              <span>Nuevo Sprint</span>
            </Button>
          </div>

          {sprints.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white/40 dark:bg-zinc-900/30 border border-dashed border-zinc-300 dark:border-white/10">
              <Repeat className="w-8 h-8 text-zinc-400 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-xs text-zinc-500">No hay sprints registrados para este proyecto.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateSprintOpen(true)}
                className="mt-3 text-xs"
              >
                Crear Sprint 1
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sprints.map((sprint) => (
                <div 
                  key={sprint.id}
                  className="p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        {sprint.status}
                      </span>
                    </div>
                    <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{sprint.name}</h4>
                    {sprint.goal && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{sprint.goal}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-xs font-mono text-zinc-500">
                    <span>{sprint.startDate} &rarr; {sprint.endDate}</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/tasks?projectId=${project.id}&sprintId=${sprint.id}`)}
                      className="text-orange-500 hover:underline font-sans font-medium"
                    >
                      Ver Tareas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'TASKS' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Tareas de la Iniciativa ({tasks.length})
            </h3>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => navigate(`/tasks?projectId=${project.id}`)}
              className="gap-2"
            >
              <CheckSquare className="w-4 h-4" strokeWidth={1.5} />
              <span>Abrir Tablero Kanban Completo</span>
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white/40 dark:bg-zinc-900/30 border border-dashed border-zinc-300 dark:border-white/10 space-y-3">
              <CheckSquare className="w-8 h-8 text-zinc-400 mx-auto" strokeWidth={1.5} />
              <p className="text-xs text-zinc-500">Aún no se han generado tareas para este proyecto.</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAIDecomposeOpen(true)}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Descomponer con IA</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white/80 dark:bg-zinc-900/70 border border-zinc-200/70 dark:border-white/5 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400">
                      {task.status}
                    </span>
                    {task.estimateHours && (
                      <span className="font-mono text-zinc-400 text-[11px]">
                        {task.estimateHours}h
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
              <span>Asignar Miembro a la Iniciativa</span>
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="ID de usuario o correo..."
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as ProjectMemberRole)}
                className="px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              >
                <option value="LEAD">Líder (LEAD)</option>
                <option value="CONTRIBUTOR">Colaborador (CONTRIBUTOR)</option>
                <option value="VIEWER">Visualizador (VIEWER)</option>
              </select>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (newMemberEmail.trim()) {
                    addMemberMutation.mutate({ userId: newMemberEmail.trim(), role: newMemberRole });
                  }
                }}
                isLoading={addMemberMutation.isPending}
                disabled={!newMemberEmail.trim()}
              >
                Asignar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Miembros Asignados ({members.length})
            </h4>
            {members.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">
                Aún no hay miembros asignados específicamente a este proyecto.
              </p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">
                        {member.userId.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{member.userId}</p>
                        <span className="text-[10px] font-mono text-zinc-400">Rol: {member.role}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMemberMutation.mutate(member.userId)}
                      className="p-1 rounded text-zinc-400 hover:text-red-500 transition-colors"
                      title="Remover del proyecto"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (payload) => {
          await updateProjectMutation.mutateAsync(payload);
        }}
        projectToEdit={project}
        isLoading={updateProjectMutation.isPending}
      />

      <AIDecomposeProjectModal
        isOpen={isAIDecomposeOpen}
        onClose={() => setIsAIDecomposeOpen(false)}
        project={project}
        onDecompositionCompleted={() => {
          queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
        }}
      />

      <CreateSprintModal
        isOpen={isCreateSprintOpen}
        onClose={() => setIsCreateSprintOpen(false)}
        projectId={projectId!}
        onSubmit={(payload) => createSprintMutation.mutate(payload)}
        isLoading={createSprintMutation.isPending}
      />
    </div>
  );
};
