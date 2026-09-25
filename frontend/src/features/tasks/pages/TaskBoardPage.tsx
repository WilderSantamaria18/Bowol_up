import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Project, Sprint } from '@/features/projects/types';
import { projectService } from '@/features/projects/services/projectService';
import { useTaskBoard } from '../hooks/useTaskBoard';
import { TaskBoardHeader } from '../components/TaskBoardHeader';
import { TaskColumn } from '../components/TaskColumn';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { AIBacklogGeneratorModal } from '../components/AIBacklogGeneratorModal';
import { TaskStatus } from '../types';
import { Sparkles, Plus, AlertCircle, Loader2 } from 'lucide-react';

export const TaskBoardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');
  const autoDecompose = searchParams.get('autoDecompose') === 'true';

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>('BACKLOG');
  const [isAIDecomposerOpen, setIsAIDecomposerOpen] = useState(false);

  // Hook for board
  const {
    board,
    loading: boardLoading,
    error: boardError,
    createTask,
    moveTask,
    deleteTask,
    runAIDecomposer,
  } = useTaskBoard(currentProject?.id, selectedSprintId || undefined);

  // Load projects
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingProjects(true);
      setProjectsError(null);
      try {
        const res = await projectService.getProjects();
        const list = res.items || [];
        setProjects(list);

        if (urlProjectId) {
          const matched = list.find((p) => p.id === urlProjectId);
          if (matched) {
            setCurrentProject(matched);
            if (autoDecompose) {
              setIsAIDecomposerOpen(true);
            }
          } else if (list.length > 0) {
            setCurrentProject(list[0]);
          }
        } else if (list.length > 0) {
          setCurrentProject(list[0]);
        }
      } catch (err: any) {
        setProjectsError(err?.response?.data?.message || err.message || 'Error al cargar proyectos');
      } finally {
        setLoadingProjects(false);
      }
    };
    loadInitialData();
  }, [urlProjectId, autoDecompose]);

  // Load sprints when project changes
  useEffect(() => {
    if (!currentProject) {
      setSprints([]);
      return;
    }
    const loadSprints = async () => {
      try {
        const data = await projectService.getProjectSprints(currentProject.id);
        setSprints(data || []);
      } catch (err) {
        setSprints([]);
      }
    };
    loadSprints();
  }, [currentProject]);

  const handleCreateDefaultProject = async () => {
    try {
      const newP = await projectService.createProject({
        name: 'Iniciativa de Innovación Principal',
        description: 'Proyecto estratégico generado para coordinar el backlog de desarrollo',
      });
      setProjects([newP]);
      setCurrentProject(newP);
    } catch (err: any) {
      setProjectsError(err?.response?.data?.message || err.message || 'Error al crear proyecto base');
    }
  };

  const handleQuickAdd = (status: TaskStatus) => {
    setCreateDefaultStatus(status);
    setIsCreateModalOpen(true);
  };

  if (loadingProjects) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          <span>Cargando proyectos y tablero...</span>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-4xl py-12 px-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl shadow-xl">
          <Sparkles className="h-8 w-8 text-cyan-400" strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 text-xl font-bold text-slate-100 sm:text-2xl">
          Comienza tu Ciclo de Ejecución
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          Crea tu primer proyecto para descomponer ideas estratégicas en un backlog interactivo de ingeniería con IA.
        </p>

        {projectsError && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
            <span>{projectsError}</span>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleCreateDefaultProject}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span>Crear Primer Proyecto</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <TaskBoardHeader
        project={currentProject}
        projects={projects}
        onSelectProject={(id) => {
          const found = projects.find((p) => p.id === id);
          if (found) setCurrentProject(found);
        }}
        sprints={sprints}
        selectedSprintId={selectedSprintId}
        onSelectSprint={setSelectedSprintId}
        boardData={board}
        onOpenCreateTask={() => {
          setCreateDefaultStatus('BACKLOG');
          setIsCreateModalOpen(true);
        }}
        onOpenAIDecomposer={() => setIsAIDecomposerOpen(true)}
      />

      {boardError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span>{boardError}</span>
        </div>
      )}

      {boardLoading && (
        <div className="flex items-center gap-2 text-xs text-cyan-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Actualizando tablero...</span>
        </div>
      )}

      {/* Horizontal Scrollable Kanban Columns */}
      <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          <TaskColumn
            status="BACKLOG"
            title="Backlog"
            tasks={board.BACKLOG || []}
            onMove={moveTask}
            onDelete={deleteTask}
            onQuickAdd={handleQuickAdd}
          />

          <TaskColumn
            status="TODO"
            title="Por Hacer"
            tasks={board.TODO || []}
            onMove={moveTask}
            onDelete={deleteTask}
            onQuickAdd={handleQuickAdd}
          />

          <TaskColumn
            status="IN_PROGRESS"
            title="En Progreso"
            tasks={board.IN_PROGRESS || []}
            onMove={moveTask}
            onDelete={deleteTask}
            onQuickAdd={handleQuickAdd}
          />

          <TaskColumn
            status="REVIEW"
            title="En Revisión"
            tasks={board.REVIEW || []}
            onMove={moveTask}
            onDelete={deleteTask}
            onQuickAdd={handleQuickAdd}
          />

          <TaskColumn
            status="DONE"
            title="Completadas"
            tasks={board.DONE || []}
            onMove={moveTask}
            onDelete={deleteTask}
            onQuickAdd={handleQuickAdd}
          />
        </div>
      </div>

      {/* Create Task Modal */}
      {currentProject && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          projectId={currentProject.id}
          sprintId={selectedSprintId}
          defaultStatus={createDefaultStatus}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={createTask}
        />
      )}

      {/* AI Backlog Generator Modal */}
      {currentProject && (
        <AIBacklogGeneratorModal
          isOpen={isAIDecomposerOpen}
          projectName={currentProject.name}
          onClose={() => setIsAIDecomposerOpen(false)}
          onGenerate={runAIDecomposer}
        />
      )}
    </div>
  );
};
