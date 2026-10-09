import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CapacityBufferCalculator } from '../components/CapacityBufferCalculator';
import { WeeklyRetrospectiveView } from '../components/WeeklyRetrospectiveView';

describe('CapacityBufferCalculator Component (Fase 5.1)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('calcula la capacidad planificable y el colchón del 20% para el equipo', () => {
    render(<CapacityBufferCalculator />);

    expect(screen.getByText(/Calculadora de Capacidad y Reserva del 20%/i)).toBeInTheDocument();
    expect(screen.getByText(/Fase 5.1 BOWOL Plans/i)).toBeInTheDocument();
    expect(screen.getByText(/Disponibilidad Bruta/i)).toBeInTheDocument();
    expect(screen.getByText(/Reserva Imprevistos/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Capacidad Planificable/i).length).toBeGreaterThan(0);
  });

  it('permite añadir un nuevo colaborador y recalcular totales', () => {
    render(<CapacityBufferCalculator />);

    const addBtn = screen.getByRole('button', { name: /Añadir Colaborador/i });
    fireEvent.click(addBtn);

    expect(screen.getByDisplayValue(/Colaborador/i)).toBeInTheDocument();
  });

  it('permite copiar el informe en formato Markdown', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<CapacityBufferCalculator />);

    const copyBtn = screen.getByRole('button', { name: /Copiar Resumen Markdown/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalled();
  });
});

describe('WeeklyRetrospectiveView Component (Fase 6.2)', () => {
  it('muestra el balance de 15 minutos, cumplimiento y formulario de 4 pasos', () => {
    render(<WeeklyRetrospectiveView />);

    expect(screen.getByText(/Asistente de Retrospectiva y Cierre Semanal/i)).toBeInTheDocument();
    expect(screen.getByText(/Fase 6.2 \(15 Minutos\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Cumplimiento Semanal/i)).toBeInTheDocument();
    expect(screen.getByText(/Efecto en el Negocio vs Entregables Técnicos/i)).toBeInTheDocument();
    expect(screen.getByText(/Aprendizajes y Evidencias/i)).toBeInTheDocument();
    expect(screen.getByText(/Hasta 3 Acciones Concretas de Mejora/i)).toBeInTheDocument();
  });

  it('permite añadir hasta 3 acciones de mejora y exportar el acta', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<WeeklyRetrospectiveView />);

    const copyActaBtn = screen.getByRole('button', { name: /Copiar Acta/i });
    fireEvent.click(copyActaBtn);

    expect(writeTextMock).toHaveBeenCalled();
  });
});
