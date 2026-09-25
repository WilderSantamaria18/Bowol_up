import React, { useState, useEffect, useCallback } from 'react';
import {
  Repeat,
  Plus,
  Play,
  CheckCircle2,
  FolderKanban,
  Activity,
  Zap,
  TrendingDown,
  AlertCircle,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { projectService } from '@/features/projects/services/projectService';
import { Project } from '@/features/projects/types';
import { sprintService } from '../services/sprintService';
import {
  Sprint,
  SprintBurndownResponse,
  SprintMetricsResponse,
  ProjectVelocityResponse,
} from '../types';
import { SprintCard } from '../components/SprintCard';
import { CreateSprintModal } from '../components/CreateSprintModal';
import { CompleteSprintModal } from '../components/CompleteSprintModal';
import { SprintBurndownChart } from '../components/SprintBurndownChart';
import { VelocityChart } from '../components/VelocityChart';
import { SprintMetricsSummary } from '../components/SprintMetricsSummary';

type ActiveTab = 'ACTIVE_SPRINT' | 'PLANNING' | 'METRICS_VELOCITY';

export const SprintsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('ACTIVE_SPRINT');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [completingSprint, setCompletingSprint] = useState<Sprint | null>(null);

  // Metrics state
  const [activeSprintMetrics, setActiveSprintMetrics] = useState<SprintMetricsResponse | null>(null);
  const [activeSprintBurndown, setActiveSprintBurndown] = useState<SprintBurndownResponse | null>(null);
  const [projectVelocity, setProjectVelocity] = useState<ProjectVelocityResponse | null>(null);
  const [selectedBurndownSprintId, setSelectedBurndownSprintId] = useState<string>('');
  const [customBurndown, setCustomBurndown] = useState<SprintBurndownResponse | null>(null);

  // Load projects initially
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await projectService.getProjects();
        const items = res.items || [];
        setProjects(items);
        if (items.length > 0) {
          setSelectedProjectId(items[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError('Error al cargar la lista de proyectos.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch sprints whenever selected project changes
  const fetchSprints = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      setError(null);
      const data = await sprintService.getSprintsByProject(selectedProjectId);
      setSprints(data);

      // Check if there is an active sprint
      const active = data.find((s) => s.status === 'ACTIVE');
      if (active) {
        try {
          const [metricsData, burndownData] = await Promise.all([
            sprintService.getSprintMetrics(active.id),
            sprintService.getSprintBurndown(active.id),
          ]);
          setActiveSprintMetrics(metricsData);
          setActiveSprintBurndown(burndownData);
        } catch (mErr) {
          console.error('Error fetching active sprint metrics:', mErr);
        }
      } else {
        setActiveSprintMetrics(null);
        setActiveSprintBurndown(null);
      }

      // Fetch velocity
      try {
        const velData = await sprintService.getProjectVelocity(selectedProjectId);
        setProjectVelocity(velData);
      } catch (vErr) {
        console.error('Error fetching project velocity:', vErr);
      }
    } catch (err: any) {
      console.error('Error fetching sprints:', err);
      setError('Error al cargar los sprints del proyecto.');
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchSprints();
    }
  }, [selectedProjectId, fetchSprints]);

  // Load custom burndown if selected in metrics tab
  useEffect(() => {
    if (selectedBurndownSprintId) {
      sprintService
        .getSprintBurndown(selectedBurndownSprintId)
        .then(setCustomBurndown)
        .catch((err) => {
          console.error('Error fetching custom burndown:', err);
          setCustomBurndown(null);
        });
    }
  }, [selectedBurndownSprintId]);

  // Actions
  const handleStartSprint = async (sprintId: string) => {
    try {
      setError(null);
      await sprintService.startSprint(sprintId);
      await fetchSprints();
    } catch (err: any) {
      console.error('Error starting sprint:', err);
      setError(
        err.response?.data?.message ||
          'No se pudo iniciar el sprint. Asegúrate de que no haya otro sprint activo en este proyecto.'
      );
    }
  };

  const handleCancelSprint = async (sprintId: string) => {
    if (!window.confirm('¿Estás seguro de cancelar este sprint? Las tareas incompletas volverán al backlog.')) {
      return;
    }
    try {
      setError(null);
      await sprintService.cancelSprint(sprintId);
      await fetchSprints();
    } catch (err: any) {
      console.error('Error canceling sprint:', err);
      setError(err.response?.data?.message || 'Error al cancelar el sprint.');
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este sprint? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      setError(null);
      await sprintService.deleteSprint(sprintId);
      await fetchSprints();
    } catch (err: any) {
      console.error('Error deleting sprint:', err);
      setError(err.response?.data?.message || 'Error al eliminar el sprint.');
    }
  };

  const activeSprint = sprints.find((s) => s.status === 'ACTIVE');
  const plannedSprints = sprints.filter((s) => s.status === 'PLANNED');
  const completedSprints = sprints.filter((s) => s.status === 'COMPLETED');
  const otherPlannedSprints = sprints.filter(
    (s) => s.status === 'PLANNED' && s.id !== completingSprint?.id
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-orange-400">
              Scrum & Agile Cycles
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Repeat className="w-6 h-6 text-orange-400" strokeWidth={1.5} />
            Gestión de Sprints & Velocidad
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Planifica ciclos ágiles, monitorea el burndown diario y optimiza el rendimiento del equipo.
          </p>
        </div>

        {/* Controls: Project selector & New Sprint CTA */}
        <div className="flex flex-wrap items-center gap-3">
          {projects.length > 0 && (
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5">
              <FolderKanban className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-2"
                aria-label="Seleccionar Proyecto"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="primary"
            size="sm"
            leftIcon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!selectedProjectId}
          >
            Nuevo Sprint
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" strokeWidth={1.5} />
          <span>{error}</span>
        </div>
      )}

      {/* No projects state */}
      {!loading && projects.length === 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0F0F12] p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mx-auto">
            <Layers className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold text-white">No hay proyectos activos</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Para gestionar sprints e iteraciones ágiles, primero crea un proyecto en el módulo de Ejecución o Tareas.
          </p>
        </div>
      )}

      {/* Main Content with Tabs */}
      {projects.length > 0 && (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-white/[0.08] gap-6">
            <button
              onClick={() => setActiveTab('ACTIVE_SPRINT')}
              className={`pb-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'ACTIVE_SPRINT'
                  ? 'border-orange-500 text-orange-400 font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" strokeWidth={1.5} />
              Sprint Activo
              {activeSprint && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('PLANNING')}
              className={`pb-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'PLANNING'
                  ? 'border-orange-500 text-orange-400 font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
              Planificación & Backlog ({plannedSprints.length})
            </button>

            <button
              onClick={() => setActiveTab('METRICS_VELOCITY')}
              className={`pb-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'METRICS_VELOCITY'
                  ? 'border-orange-500 text-orange-400 font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />
              Velocidad & Burndown
            </button>
          </div>

          {/* TAB 1: Sprint Activo */}
          {activeTab === 'ACTIVE_SPRINT' && (
            <div className="space-y-6">
              {activeSprint ? (
                <>
                  <SprintCard
                    sprint={activeSprint}
                    onComplete={() => setCompletingSprint(activeSprint)}
                    onCancel={() => handleCancelSprint(activeSprint.id)}
                  />

                  {activeSprintMetrics && <SprintMetricsSummary metrics={activeSprintMetrics} />}

                  {activeSprintBurndown && <SprintBurndownChart burndown={activeSprintBurndown} />}
                </>
              ) : (
                <div className="rounded-xl border border-white/[0.08] bg-[#0F0F12] p-10 text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-white/[0.06] flex items-center justify-center text-zinc-400 mx-auto">
                    <Activity className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">No hay sprint activo actualmente</h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                      Inicia un sprint planificado desde la pestaña de Planificación para activar el seguimiento de burndown y métricas en tiempo real.
                    </p>
                  </div>
                  {plannedSprints.length > 0 ? (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={Play}
                      onClick={() => handleStartSprint(plannedSprints[0].id)}
                    >
                      Iniciar "{plannedSprints[0].name}"
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={Plus}
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      Planificar Primer Sprint
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Planificación */}
          {activeTab === 'PLANNING' && (
            <div className="space-y-8">
              {/* Planned Sprints */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
                    Sprints Planificados ({plannedSprints.length})
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={Plus}
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Nuevo Sprint
                  </Button>
                </div>

                {plannedSprints.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500 rounded-xl bg-surface-subtle border border-white/[0.06]">
                    No hay sprints planificados en cola. Crea uno para comenzar a organizar tu backlog.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plannedSprints.map((s) => (
                      <SprintCard
                        key={s.id}
                        sprint={s}
                        onStart={() => handleStartSprint(s.id)}
                        onDelete={() => handleDeleteSprint(s.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Sprints History */}
              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  Historial de Sprints Completados ({completedSprints.length})
                </h2>

                {completedSprints.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500 rounded-xl bg-surface-subtle border border-white/[0.06]">
                    Aún no se han completado ciclos de sprint en este proyecto.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedSprints.map((s) => (
                      <SprintCard key={s.id} sprint={s} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Velocidad & Métricas */}
          {activeTab === 'METRICS_VELOCITY' && (
            <div className="space-y-6">
              {/* Velocity Chart */}
              {projectVelocity && <VelocityChart velocity={projectVelocity} />}

              {/* Sprint Burndown Explorer */}
              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
                      Explorador de Burndown por Sprint
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Inspecciona el gráfico de horas ideales vs reales de cualquier sprint del proyecto.
                    </p>
                  </div>

                  {sprints.length > 0 && (
                    <select
                      value={selectedBurndownSprintId || activeSprint?.id || sprints[0]?.id || ''}
                      onChange={(e) => setSelectedBurndownSprintId(e.target.value)}
                      className="bg-[#0F0F12] border border-white/[0.08] text-xs text-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none"
                    >
                      {sprints.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.status})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {customBurndown ? (
                  <SprintBurndownChart burndown={customBurndown} />
                ) : activeSprintBurndown ? (
                  <SprintBurndownChart burndown={activeSprintBurndown} />
                ) : (
                  <div className="p-8 text-center text-xs text-zinc-500 rounded-xl bg-surface-subtle border border-white/[0.06]">
                    Selecciona un sprint para visualizar su burndown.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Sprint */}
      <CreateSprintModal
        isOpen={isCreateModalOpen}
        projectId={selectedProjectId || undefined}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (payload) => {
          if (!selectedProjectId) return;
          await sprintService.createSprint(selectedProjectId, payload);
          setIsCreateModalOpen(false);
          await fetchSprints();
        }}
      />

      {/* Modal: Complete Sprint */}
      {completingSprint && (
        <CompleteSprintModal
          isOpen={!!completingSprint}
          sprint={completingSprint}
          plannedSprints={otherPlannedSprints}
          onClose={() => setCompletingSprint(null)}
          onSubmit={async (payload) => {
            await sprintService.completeSprint(completingSprint.id, payload);
            setCompletingSprint(null);
            await fetchSprints();
          }}
        />
      )}
    </div>
  );
};
