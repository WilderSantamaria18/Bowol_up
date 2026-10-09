import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VerifiableTaskBreakdownSection } from '../components/VerifiableTaskBreakdownSection';
import { WeeklyPriorityFocusBanner } from '@/features/tasks/components/WeeklyPriorityFocusBanner';
import { Project } from '../types';
import { Task } from '@/features/tasks/types';

describe('BOWOL Plans Methodology Integration Tests (Fase 3 Desglose & Fase 5 Foco)', () => {
  const mockProject: Project = {
    id: 'proj-bowol-1',
    organizationId: 'org-1',
    name: 'Campaña Comercial WhatsApp',
    description: 'Vender stock estancado mediante catálogo y WhatsApp',
    status: 'ACTIVE',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    createdAt: '2026-10-01T00:00:00Z',
  };

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      projectId: 'proj-bowol-1',
      title: 'Auditar pares disponibles',
      area: 'Operaciones',
      status: 'TODO',
      priority: 'HIGH',
      position: 1,
      estimateHours: 3,
      createdAt: '2026-10-01T00:00:00Z',
      deliverable: 'Planilla con 140 pares clasificados',
      acceptanceCriteria: ['Cada par tiene talla y precio de liquidación'],
      externalWaitHours: 0,
    },
    {
      id: 'task-2',
      projectId: 'proj-bowol-1',
      title: 'Diseñar catálogo completo',
      area: 'Marketing',
      status: 'TODO',
      priority: 'MEDIUM',
      position: 2,
      estimateHours: 8, // Excede 6h para probar alerta
      createdAt: '2026-10-01T00:00:00Z',
      deliverable: 'PDF de 10 páginas con fotos',
      acceptanceCriteria: ['Aprobado por el dueño'],
      externalWaitHours: 24, // Espera externa documentada
      isHighUncertainty: true,
    },
  ];

  it('Fase 3: renderiza VerifiableTaskBreakdownSection con métricas de esfuerzo activo, espera externa y alerta >6h', () => {
    const handleCreateTask = vi.fn();
    const handleAIDecompose = vi.fn();
    const handleNavigateKanban = vi.fn();

    render(
      <VerifiableTaskBreakdownSection
        project={mockProject}
        tasks={mockTasks}
        onOpenCreateTask={handleCreateTask}
        onOpenAIDecompose={handleAIDecompose}
        onNavigateToKanban={handleNavigateKanban}
      />
    );

    // Header & Phase 3 badge
    expect(screen.getByText(/Fase 3 · BOWOL Plans/i)).toBeInTheDocument();
    expect(screen.getByText(/Matriz de Actividades, Entregables y Esperas Externas/i)).toBeInTheDocument();

    // Quantitative metrics
    expect(screen.getByText('Esfuerzo Activo')).toBeInTheDocument();
    expect(screen.getByText('Espera Externa')).toBeInTheDocument();
    expect(screen.getByText('Exceden 6h')).toBeInTheDocument();

    // Table rows
    expect(screen.getByText('T-001')).toBeInTheDocument();
    expect(screen.getByText('Auditar pares disponibles')).toBeInTheDocument();
    expect(screen.getByText('Planilla con 140 pares clasificados')).toBeInTheDocument();

    expect(screen.getByText('T-002')).toBeInTheDocument();
    expect(screen.getByText('Diseñar catálogo completo')).toBeInTheDocument();
    expect(screen.getByText('>6h dividir')).toBeInTheDocument();
  });

  it('Fase 5.1: renderiza WeeklyPriorityFocusBanner con entregable prioritario y riesgo crítico', () => {
    render(
      <WeeklyPriorityFocusBanner
        projectId="proj-bowol-1"
        projectName="Campaña Comercial WhatsApp"
        sprintName="Sprint 1"
        totalTasks={5}
        totalHours={18}
      />
    );

    expect(screen.getByText(/Fase 5.1 · BOWOL Plans/i)).toBeInTheDocument();
    expect(screen.getByText(/Entregable Prioritario de la Semana & Riesgo Crítico/i)).toBeInTheDocument();
    expect(screen.getByText('Entregable Prioritario')).toBeInTheDocument();
    expect(screen.getByText('Riesgo que Amenaza la Entrega')).toBeInTheDocument();
    expect(screen.getByText('Plan de Mitigación')).toBeInTheDocument();
    expect(screen.getByText(/5 tareas/i)).toBeInTheDocument();
    expect(screen.getByText(/18h/i)).toBeInTheDocument();

    // Switch to edit mode
    fireEvent.click(screen.getByText('Ajustar Foco'));
    expect(screen.getByText(/Guardar Foco de la Semana/i)).toBeInTheDocument();
  });
});
