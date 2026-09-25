import { useState, useCallback, useEffect } from 'react';
import { Task, TaskBoardData, TaskStatus, CreateTaskPayload, DecomposeProjectResponse } from '../types';
import { taskService } from '../services/taskService';

const initialBoardData: TaskBoardData = {
  BACKLOG: [],
  TODO: [],
  IN_PROGRESS: [],
  REVIEW: [],
  DONE: [],
  CANCELED: [],
};

export function useTaskBoard(projectId?: string, sprintId?: string) {
  const [board, setBoard] = useState<TaskBoardData>(initialBoardData);
  const [loading, setLoading] = useState<boolean>(false);
  const [decomposing, setDecomposing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getBoard(projectId, sprintId);
      // Ensure all statuses are present
      setBoard({
        BACKLOG: data.BACKLOG || [],
        TODO: data.TODO || [],
        IN_PROGRESS: data.IN_PROGRESS || [],
        REVIEW: data.REVIEW || [],
        DONE: data.DONE || [],
        CANCELED: data.CANCELED || [],
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }, [projectId, sprintId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
    const created = await taskService.createTask(payload);
    await fetchBoard();
    return created;
  };

  const moveTask = async (taskId: string, targetStatus: TaskStatus): Promise<void> => {
    // Optimistic UI update
    setBoard((prev) => {
      let movedTask: Task | null = null;
      const next: TaskBoardData = { ...prev };

      // Find and remove task
      (Object.keys(next) as TaskStatus[]).forEach((statusKey) => {
        const found = next[statusKey].find((t) => t.id === taskId);
        if (found) {
          movedTask = { ...found, status: targetStatus };
          next[statusKey] = next[statusKey].filter((t) => t.id !== taskId);
        }
      });

      if (movedTask) {
        next[targetStatus] = [...next[targetStatus], movedTask];
      }

      return next;
    });

    try {
      await taskService.updateTaskStatus(taskId, targetStatus);
    } catch (err) {
      // Revert on failure
      fetchBoard();
      throw err;
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    await taskService.deleteTask(taskId);
    await fetchBoard();
  };

  const runAIDecomposer = async (): Promise<DecomposeProjectResponse> => {
    if (!projectId) {
      throw new Error('No project selected');
    }
    setDecomposing(true);
    setError(null);
    try {
      const response = await taskService.decomposeProject(projectId);
      await fetchBoard();
      return response;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Error en el descompositor con IA';
      setError(msg);
      throw err;
    } finally {
      setDecomposing(false);
    }
  };

  return {
    board,
    loading,
    decomposing,
    error,
    refresh: fetchBoard,
    createTask,
    moveTask,
    deleteTask,
    runAIDecomposer,
  };
}
