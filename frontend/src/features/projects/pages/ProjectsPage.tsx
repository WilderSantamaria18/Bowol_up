import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FolderKanban, Plus, Repeat, CheckSquare, Activity, Lightbulb, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import {
  Button,
  CardSkeletonGrid,
  DataState,
  EmptyState,
  ListToolbar,
  SearchField,
  SegmentedTabs,
  StatCard,
  StatGrid,
} from '@/components/ui';
import { projectService } from '../services/projectService';
import { opportunityService } from '@/features/opportunities/services/opportunityService';
import { Project, CreateProjectPayload, UpdateProjectPayload } from '../types';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { AIDecomposeProjectModal } from '../components/AIDecomposeProjectModal';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'Todos' },
  { id: 'ACTIVE', label: 'En Ejecución' },
  { id: 'PLANNING', label: 'Planificación' },
  { id: 'PAUSED', label: 'Pausados' },
  { id: 'COMPLETED', label: 'Completados' },
];

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
            onClick={() => navigate('/planning')}
            className="gap-2 text-orange-600 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
          >
            <Sparkles className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
            <span>Planificador BOWOL</span>
          </Button>

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

      <StatGrid columns={4} className="lg:grid-cols-4">
        <StatCard label="Total Iniciativas" value={metrics.total} icon={FolderKanban} hint="Cartera de innovación" />
        <StatCard label="En Ejecución" value={metrics.active} icon={Activity} tone="emerald" hint="Sprints activos en curso" />
        <StatCard label="En Planificación" value={metrics.planning} icon={Clock} tone="blue" hint="Listos para descomponer con IA" />
        <StatCard label="Completadas" value={metrics.completed} icon={CheckCircle2} tone="violet" hint="Valor entregado a producción" />
      </StatGrid>

      <ListToolbar
        left={
          <SegmentedTabs
            mode="filter"
            tone="zinc"
            aria-label="Filtrar por estado"
            value={selectedStatus}
            onChange={setSelectedStatus}
            items={STATUS_FILTERS}
          />
        }
      >
        <SearchField value={searchTerm} onValueChange={setSearchTerm} placeholder="Buscar proyectos..." className="sm:max-w-xs" />
      </ListToolbar>

      <DataState
        isLoading={loadingProjects}
        error={projectsError ? 'No se pudo conectar con el servicio de proyectos. Intenta recargar la página.' : null}
        isEmpty={filteredProjects.length === 0}
        loading={<CardSkeletonGrid count={6} className="gap-5 lg:grid-cols-3" />}
        empty={
          <EmptyState
            icon={FolderKanban}
            title={searchTerm ? 'No se encontraron iniciativas para tu búsqueda' : 'No hay proyectos registrados aún'}
            description="Crea una nueva iniciativa directamente o convierte una oportunidad aprobada desde el embudo estratégico RICE."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button type="button" variant="outline" size="sm" leftIcon={Lightbulb} onClick={() => navigate('/opportunities')}>
                  Ver Oportunidades RICE
                </Button>
                <Button type="button" variant="primary" size="sm" leftIcon={Plus} onClick={() => setIsCreateModalOpen(true)}>
                  Crear Primera Iniciativa
                </Button>
              </div>
            }
          />
        }
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
      </DataState>

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
