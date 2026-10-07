import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlanningPage } from '../pages/PlanningPage';
import { planningService } from '../services/planningService';
import { projectService } from '@/features/projects/services/projectService';

vi.mock('../services/planningService', () => ({
  planningService: {
    validatePlan: vi.fn(),
    importPlan: vi.fn(),
    exportPlan: vi.fn(),
  },
}));

vi.mock('@/features/projects/services/projectService', () => ({
  projectService: {
    getProjects: vi.fn().mockResolvedValue([
      { id: 'proj-1', name: 'Optimización de Embudo', description: 'Proyecto de prueba', status: 'ACTIVE' },
    ]),
  },
}));

const renderComponent = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <PlanningPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('PlanningPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renderiza la cabecera del planificador y sus cuatro pestañas metodológicas', () => {
    renderComponent();

    expect(screen.getByText(/Planificador Operativo BOWOL Plans 2.0/i)).toBeInTheDocument();
    expect(screen.getByText(/para equipos de 1 a 15 personas/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /1\. Ficha del Negocio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /2\. Prompts por Fases/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3\. Importar \/ Exportar JSON/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /4\. Auditor de Calidad/i })).toBeInTheDocument();
  });

  it('permite alternar entre pestañas e interactuar con la Ficha de Contexto', () => {
    renderComponent();

    // Pestaña inicial: Ficha de Contexto
    expect(screen.getByText(/Ficha de Contexto Reutilizable/i)).toBeInTheDocument();

    // Cargar ejemplo
    const loadSampleBtn = screen.getByRole('button', { name: /Cargar Ejemplo/i });
    fireEvent.click(loadSampleBtn);

    // Verificar que se autocompletó el nombre del negocio de ejemplo
    expect(screen.getByDisplayValue(/Tienda de Calzado y Accesorios Urbanos/i)).toBeInTheDocument();
  });

  it('permite navegar al Generador de Prompts y seleccionar diferentes fases', () => {
    renderComponent();

    // Cambiar a la pestaña de prompts
    const promptsTab = screen.getByRole('button', { name: /2\. Prompts por Fases/i });
    fireEvent.click(promptsTab);

    expect(screen.getByText(/Fase 1: Diagnóstico & Capacidad/i)).toBeInTheDocument();
    expect(screen.getByText(/Fase 3: Desglose de Actividades/i)).toBeInTheDocument();

    // Seleccionar Fase 3: Desglose de Actividades
    fireEvent.click(screen.getByText(/Fase 3: Desglose de Actividades/i));
    expect(screen.getByText(/3\.1 Crear Tareas Verificables \(WBS\)/i)).toBeInTheDocument();
  });

  it('permite auditar el plan con el Checklist de 8 puntos', () => {
    renderComponent();

    const auditTab = screen.getByRole('button', { name: /4\. Auditor de Calidad/i });
    fireEvent.click(auditTab);

    expect(screen.getByText(/Comprobación Rápida de 8 Puntos/i)).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 8 verificados/i)).toBeInTheDocument();

    // Hacer clic en la primera tarjeta de comprobación
    const firstQuestion = screen.getByText(/1\. ¿Usa datos de mi negocio y marca lo desconocido\?/i);
    fireEvent.click(firstQuestion);

    expect(screen.getByText(/1 \/ 8 verificados/i)).toBeInTheDocument();
  });

  it('permite validar e importar un plan JSON', async () => {
    (planningService.validatePlan as any).mockResolvedValue({
      valid: true,
      blockingIssues: [],
      warnings: [],
      totalTasks: 2,
      totalEstimatedHours: 7,
      tasksOverSixHours: 0,
      tasksWithoutAcceptanceCriteria: 0,
    });

    (planningService.importPlan as any).mockResolvedValue({
      projectId: 'proj-new-1',
      projectName: 'Proyecto Importado',
      tasksCreated: 3,
      status: 'SUCCESS',
      message: 'Plan importado exitosamente',
    });

    renderComponent();

    const jsonTab = screen.getByRole('button', { name: /3\. Importar \/ Exportar JSON/i });
    fireEvent.click(jsonTab);

    expect(screen.getByText(/Importador & Exportador JSON/i)).toBeInTheDocument();

    // Botón de validación
    const validateBtn = screen.getByRole('button', { name: /1\. Validar Reglas del Plan/i });
    fireEvent.click(validateBtn);

    await waitFor(() => {
      expect(planningService.validatePlan).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Plan Válido para Importar/i)).toBeInTheDocument();
    });
  });
});
