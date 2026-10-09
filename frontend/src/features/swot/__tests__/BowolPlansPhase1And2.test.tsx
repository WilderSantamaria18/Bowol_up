import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { BottleneckCard } from '../components/BottleneckCard';
import { RoutineAuditSection } from '../components/RoutineAuditSection';
import { SmartProjectCharter } from '@/features/projects/components/SmartProjectCharter';
import { BowolOperationalHealthCard } from '@/features/dashboard/components/BowolOperationalHealthCard';
import { Project } from '@/features/projects/types';

describe('BOWOL Plans Methodology Integration Tests (Fases 1, 2 y Salud Operativa)', () => {
  it('Fase 1.1: renderiza BottleneckCard con síntoma, causa raíz y alternancia de evidencia', () => {
    const handleOpportunity = vi.fn();
    const handleHypothesis = vi.fn();

    render(
      <BrowserRouter>
        <BottleneckCard
          swotId="test-swot-1"
          onConvertToOpportunity={handleOpportunity}
          onConvertToHypothesis={handleHypothesis}
        />
      </BrowserRouter>
    );

    // Validar título y regla 1.1
    expect(screen.getByText('Cuello de Botella Principal del Negocio')).toBeInTheDocument();
    expect(screen.getByText(/Fase 1.1 · Diagnóstico Operativo/i)).toBeInTheDocument();
    expect(screen.getByText('Síntoma Visible')).toBeInTheDocument();
    expect(screen.getByText('Causa Raíz Operativa')).toBeInTheDocument();

    // Toggle de evidencia vs hipótesis
    const toggleBtn = screen.getByTitle(/alternar entre hecho con evidencia e hipótesis por validar/i);
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Hipótesis por Validar')).toBeInTheDocument();

    // Botones de acción
    const oppBtn = screen.getByText('Convertir en Oportunidad RICE');
    fireEvent.click(oppBtn);
    expect(handleOpportunity).toHaveBeenCalled();
  });

  it('Fase 1.2: renderiza RoutineAuditSection con clasificación Eliminar/Simplificar/Automatizar y cálculo de ahorro', () => {
    render(<RoutineAuditSection swotId="test-swot-1" />);

    expect(screen.getByText(/Fase 1.2 · Auditoría de Rutina/i)).toBeInTheDocument();
    expect(screen.getByText('Consumo Semanal Actual')).toBeInTheDocument();
    expect(screen.getByText('Ahorro Estimado Semanal')).toBeInTheDocument();
    expect(screen.getByText('Ahorro Medido Real')).toBeInTheDocument();

    // Validar checklist operativo (Regla 1.2)
    expect(screen.getByText('Checklist Operativo de la Rutina')).toBeInTheDocument();
    expect(screen.getByText(/Regla 1.2: Entrada, Salida y Excepción/i)).toBeInTheDocument();
  });

  it('Fase 2.1: renderiza SmartProjectCharter con Regla 6 (Entregables vs Efecto Comercial) y alcance dentro/fuera', () => {
    const mockProject: Project = {
      id: 'proj-123',
      organizationId: 'org-1',
      name: 'Optimización de Embudo de Ventas',
      description: 'Problema de pérdida de prospectos calificados',
      status: 'ACTIVE',
      startDate: '2026-10-01',
      endDate: '2026-11-15',
      createdAt: '2026-10-01T00:00:00Z',
    };

    render(<SmartProjectCharter project={mockProject} />);

    expect(screen.getByText(/Fase 2.1 · Ficha SMART de Proyecto/i)).toBeInTheDocument();
    expect(screen.getByText(/Regla 6: Entregables vs Resultado Comercial/i)).toBeInTheDocument();
    expect(screen.getByText('Dentro del Alcance (In Scope)')).toBeInTheDocument();
    expect(screen.getByText(/Fuera del Alcance/i)).toBeInTheDocument();
    expect(screen.getByText('Indicador (KPI)')).toBeInTheDocument();
  });

  it('Cockpit Ejecutivo: renderiza BowolOperationalHealthCard con los 4 pilares operativos de BOWOL Plans 2.0', () => {
    render(
      <BrowserRouter>
        <BowolOperationalHealthCard />
      </BrowserRouter>
    );

    expect(screen.getByText('Salud Operativa del Negocio')).toBeInTheDocument();
    expect(screen.getByText(/Límite WIP \(Fase 5\)/i)).toBeInTheDocument();
    expect(screen.getByText('20% Reserva')).toBeInTheDocument();
    expect(screen.getByText('Causa + Responsable')).toBeInTheDocument();
    expect(screen.getByText('Aceptación + Evidencia')).toBeInTheDocument();
  });
});
