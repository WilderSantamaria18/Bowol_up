import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BlockTaskModal } from '../components/BlockTaskModal';
import { CompleteTaskGatekeeperModal } from '../components/CompleteTaskGatekeeperModal';
import { DailyCheckinModal } from '../components/DailyCheckinModal';
import { Task } from '../types';

const mockTask: Task = {
  id: 'task-test-1',
  projectId: 'proj-1',
  title: 'Implementar pasarela de pagos',
  description: 'Conectar con Stripe y MercadoPago',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  position: 1000,
  createdAt: new Date().toISOString(),
};

describe('BlockTaskModal (Protocolo de Bloqueos Fase 5.3 & 6.1)', () => {
  it('no se renderiza si isOpen es false', () => {
    const { container } = render(
      <BlockTaskModal isOpen={false} task={mockTask} onClose={vi.fn()} onConfirm={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('exige causa, responsable y fecha de próxima revisión antes de confirmar', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(<BlockTaskModal isOpen={true} task={mockTask} onClose={onClose} onConfirm={onConfirm} />);

    expect(screen.getByText(/Protocolo de Bloqueo Operativo/i)).toBeInTheDocument();
    expect(screen.getByText(/Implementar pasarela de pagos/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Confirmar Bloqueo/i });

    // Completar campos
    fireEvent.change(screen.getByPlaceholderText(/Falta aprobación de presupuesto/i), {
      target: { value: 'Esperando llaves secretas de producción' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Carlos \(Líder técnico\)/i), {
      target: { value: 'Gerente General' },
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        'task-test-1',
        expect.objectContaining({
          status: 'BLOCKED',
          blockedReason: 'Esperando llaves secretas de producción',
          blockedResolver: 'Gerente General',
        })
      );
    });
  });
});

describe('CompleteTaskGatekeeperModal (Puerta de Cierre Fase 6.2)', () => {
  it('obliga a certificar criterios de aceptación y proveer evidencia del entregable', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <CompleteTaskGatekeeperModal
        isOpen={true}
        task={mockTask}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/Puerta de Cierre con Criterios/i)).toBeInTheDocument();

    // Checkbox de verificación
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Evidencia
    fireEvent.change(screen.getByPlaceholderText(/https:\/\/docs\.google\.com/i), {
      target: { value: 'https://github.com/bowol/pull/42 con pruebas al 100%' },
    });

    // Revisor
    fireEvent.change(screen.getByPlaceholderText(/Maria \(Líder Operaciones\)/i), {
      target: { value: 'Andrés (Tech Lead)' },
    });

    const submitBtn = screen.getByRole('button', { name: /Aceptar y Marcar LISTO/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        'task-test-1',
        expect.objectContaining({
          status: 'DONE',
          acceptanceEvidence: 'https://github.com/bowol/pull/42 con pruebas al 100%',
          acceptanceReviewedBy: 'Andrés (Tech Lead)',
        })
      );
    });
  });
});

describe('DailyCheckinModal (Fase 6.1)', () => {
  it('permite registrar las 3 preguntas clave y ver el historial', async () => {
    render(
      <DailyCheckinModal
        isOpen={true}
        projectId="proj-1"
        projectName="Proyecto Alpha"
        tasks={[mockTask]}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Check-in Diario Express/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. ¿Qué entregable avancé o terminé desde el último reporte y dónde se revisa\?/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. ¿Qué tarea voy a avanzar hoy y qué resultado concreto espero dejar\?/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. ¿Qué me bloquea y qué ayuda concreta necesito\?/i)).toBeInTheDocument();

    // Cambiar a la pestaña de historial
    const historyTab = screen.getByRole('button', { name: /Historial/i });
    fireEvent.click(historyTab);

    expect(screen.getByText(/No hay check-ins registrados aún/i)).toBeInTheDocument();
  });
});
