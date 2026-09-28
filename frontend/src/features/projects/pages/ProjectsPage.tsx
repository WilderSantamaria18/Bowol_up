import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Repeat, 
  CheckSquare, 
  Activity, 
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { projectService } from '../services/projectService';
import { opportunityService } from '@/features/opportunities/services/opportunityService';
import { Project, CreateProjectPayload, UpdateProjectPayload } from '../types';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { AIDecomposeProjectModal } from '../components/AIDecomposeProjectModal';

export const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlOpportunityId = searchParams.get('opportunityId') || undefined;
  const shouldOpenCreate = searchParams.get('create') === 'true';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(shouldOpenCreate);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [decomposingProject, setDecomposingProject] = useState<Project | null>(null);

  // Queries
  const { data: projectsData, isLoading: loadingProjects, error: projectsError } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects(),
  });

  const { data: opportunitiesBoard } = useQuery({
    queryKey: ['opportunities-board'],
    queryFn: () => opportunityService.getBoard(),
  });

  const allOpportunities = useMemo(() => {
    if (!opportunitiesBoard) return [];
    return [
      ...(opportunitiesBoard.IDENTIFIED || []),
      ...(opportunitiesBoard.EVALUATING || []),
      ...(opportunitiesBoard.APPROVED || []),
      ...(opportunitiesBoard.REJECTED || []),
      ...(opportunitiesBoard.CONVERTED || []),
    ];
  }, [opportunitiesBoard]);

  const projects = projectsData?.items || [];

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectService.createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateModalOpen(false);
      if (searchParams.get('create')) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('create');
        setSearchParams(nextParams);
      }
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) => 
      projectService.updateProject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditingProject(null);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, selectedStatus]);

  // Metrics
  const metrics = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === 'ACTIVE').length;
    const planning = projects.filter((p) => p.status === 'PLANNING').length;
    const completed = projects.filter((p) => p.status === 'COMPLETED').length;
    return { total, active, planning, completed };
  }, [projects]);

  const handleSaveProject = async (payload: CreateProjectPayload | UpdateProjectPayload) => {
    if (editingProject) {
      await updateProjectMutation.mutateAsync({ id: editingProject.id, payload });
    } else {
      await createProjectMutation.mutateAsync(payload as CreateProjectPayload);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header & Quick Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono tracking-widest uppercase font-semibold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
              Fase 7 — Ejecución Ágil
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            Iniciativas & Proyectos
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Transforma oportunidades validadas e hipótesis empíricas en iniciativas trazables, sprints ágiles y tareas de alta velocidad.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/tasks')}
            className="gap-2"
          >
            <CheckSquare className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
            <span>Tablero Kanban</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/sprints')}
            className="gap-2"
          >
            <Repeat className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
            <span>Sprints</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>Nueva Iniciativa</span>
          </Button>
        </div>
      </div>

      {/* KPI Metrics row with Liquid Glass */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Iniciativas
            </span>
            <FolderKanban className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2 font-mono">
            {metrics.total}
          </p>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Cartera de innovación
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              En Ejecución
            </span>
            <Activity className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            {metrics.active}
          </p>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Sprints activos en curso
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              En Planificación
            </span>
            <Clock className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2 font-mono">
            {metrics.planning}
          </p>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Listos para descomponer con IA
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Completadas
            </span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2 font-mono">
            {metrics.completed}
          </p>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Valor entregado a producción
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 rounded-2xl bg-white/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-white/[0.06] backdrop-blur-md">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 text-xs">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'ACTIVE', label: 'En Ejecución' },
            { id: 'PLANNING', label: 'Planificación' },
            { id: 'PAUSED', label: 'Pausados' },
            { id: 'COMPLETED', label: 'Completados' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                selectedStatus === tab.id
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72 p-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" strokeWidth={1.5} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar proyectos..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loadingProjects ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin mx-auto mb-3" />
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Cargando iniciativas ágiles...
          </span>
        </div>
      ) : projectsError ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
            Error al consultar los proyectos
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            No se pudo conectar con el servicio de proyectos. Intenta recargar la página.
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 px-6 rounded-3xl bg-white/40 dark:bg-zinc-900/30 border border-dashed border-zinc-300 dark:border-white/10 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {searchTerm ? 'No se encontraron iniciativas para tu búsqueda' : 'No hay proyectos registrados aún'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Crea una nueva iniciativa directamente o convierte una oportunidad aprobada desde el embudo estratégico RICE.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/opportunities')}
              className="gap-2"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
              <span>Ver Oportunidades RICE</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              <span>Crear Primera Iniciativa</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(p) => setEditingProject(p)}
              onDelete={(id) => {
                if (window.confirm('¿Seguro que deseas eliminar este proyecto y desvincular sus sprints asociados?')) {
                  deleteProjectMutation.mutate(id);
                }
              }}
              onDecomposeAI={(p) => setDecomposingProject(p)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateModalOpen || Boolean(editingProject)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSaveProject}
        projectToEdit={editingProject}
        opportunities={allOpportunities}
        initialOpportunityId={urlOpportunityId}
        isLoading={createProjectMutation.isPending || updateProjectMutation.isPending}
      />

      <AIDecomposeProjectModal
        isOpen={Boolean(decomposingProject)}
        onClose={() => setDecomposingProject(null)}
        project={decomposingProject}
        onDecompositionCompleted={() => {
          queryClient.invalidateQueries({ queryKey: ['projects'] });
        }}
      />
    </div>
  );
};
