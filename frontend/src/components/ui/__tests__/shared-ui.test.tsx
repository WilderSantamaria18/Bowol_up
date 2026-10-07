import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Beaker, FlaskConical } from 'lucide-react';
import {
  ChoiceGroup,
  DataState,
  EmptyState,
  FormField,
  ListToolbar,
  Modal,
  PageHeader,
  SearchField,
  SegmentedTabs,
  StatCard,
  Textarea,
} from '..';

describe('Modal', () => {
  it('no renderiza nada cerrado y expone role=dialog con título accesible al abrir', () => {
    const { rerender } = render(
      <Modal isOpen={false} onClose={() => {}} title="Nuevo">
        contenido
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(
      <Modal isOpen onClose={() => {}} title="Nuevo elemento" subtitle="Detalle">
        contenido
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Nuevo elemento' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Detalle')).toBeInTheDocument();
  });

  it('se cierra con Escape, con el botón y con el fondo, salvo que esté ocupado', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal isOpen onClose={onClose} title="T">
        x
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement!);
    expect(onClose).toHaveBeenCalledTimes(3);

    onClose.mockClear();
    rerender(
      <Modal isOpen onClose={onClose} title="T" busy>
        x
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement!);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('coloca el foco en el primer campo del formulario', () => {
    render(
      <Modal isOpen onClose={() => {}} title="T">
        <input aria-label="nombre" />
      </Modal>,
    );
    expect(screen.getByLabelText('nombre')).toHaveFocus();
  });
});

describe('DataState', () => {
  const base = { loading: <p>cargando…</p>, empty: <p>vacío</p> };

  it('prioriza cargando → error → vacío → contenido', () => {
    const { rerender } = render(
      <DataState isLoading error={null} isEmpty={false} {...base}>
        <p>datos</p>
      </DataState>,
    );
    expect(screen.getByText('cargando…')).toBeInTheDocument();

    const onRetry = vi.fn();
    rerender(
      <DataState isLoading={false} error="falló" onRetry={onRetry} isEmpty {...base}>
        <p>datos</p>
      </DataState>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('falló');
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onRetry).toHaveBeenCalled();

    rerender(
      <DataState isLoading={false} error={null} isEmpty {...base}>
        <p>datos</p>
      </DataState>,
    );
    expect(screen.getByText('vacío')).toBeInTheDocument();

    rerender(
      <DataState isLoading={false} error={null} isEmpty={false} {...base}>
        <p>datos</p>
      </DataState>,
    );
    expect(screen.getByText('datos')).toBeInTheDocument();
  });

  it('EmptyState muestra título, descripción y acción', () => {
    render(<EmptyState title="Sin datos" description="Crea el primero" action={<button>Crear</button>} />);
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();
  });
});

describe('SegmentedTabs y ChoiceGroup', () => {
  it('SegmentedTabs marca la pestaña activa y notifica el cambio', () => {
    const onChange = vi.fn();
    render(
      <SegmentedTabs
        aria-label="Vista"
        value="a"
        onChange={onChange}
        items={[
          { id: 'a', label: 'Primera', icon: FlaskConical, count: 3 },
          { id: 'b', label: 'Segunda', icon: Beaker },
        ]}
      />,
    );
    expect(screen.getByRole('tab', { name: /Primera/ })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: /Segunda/ }));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('ChoiceGroup es un radiogroup de selección única', () => {
    const Harness = () => {
      const [v, setV] = useState('x');
      return (
        <ChoiceGroup
          aria-label="Método"
          value={v}
          onChange={setV}
          options={[
            { value: 'x', label: 'Equis' },
            { value: 'y', label: 'Ye' },
          ]}
        />
      );
    };
    render(<Harness />);
    expect(screen.getByRole('radiogroup', { name: 'Método' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Ye' }));
    expect(screen.getByRole('radio', { name: 'Ye' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Equis' })).toHaveAttribute('aria-checked', 'false');
  });
});

describe('Formularios y cabeceras', () => {
  it('FormField asocia etiqueta, ayuda y error con el control', () => {
    const { rerender } = render(
      <FormField label="Notas" hint="Opcional">
        {(c) => <Textarea {...c} />}
      </FormField>,
    );
    const field = screen.getByLabelText('Notas');
    expect(field).toHaveAccessibleDescription('Opcional');

    rerender(
      <FormField label="Notas" error="Requerido" required>
        {(c) => <Textarea {...c} />}
      </FormField>,
    );
    expect(screen.getByLabelText(/Notas/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Requerido')).toBeInTheDocument();
  });

  it('SearchField emite el valor y ListToolbar compone sus zonas', () => {
    const onValueChange = vi.fn();
    render(
      <ListToolbar left={<span>izquierda</span>}>
        <SearchField value="" onValueChange={onValueChange} placeholder="Buscar cosas" />
      </ListToolbar>,
    );
    fireEvent.change(screen.getByPlaceholderText('Buscar cosas'), { target: { value: 'abc' } });
    expect(onValueChange).toHaveBeenCalledWith('abc');
    expect(screen.getByText('izquierda')).toBeInTheDocument();
  });

  it('PageHeader y StatCard renderizan título, acciones y valores', () => {
    render(
      <>
        <PageHeader title="Módulo" description="Descripción" icon={FlaskConical} actions={<button>Acción</button>} />
        <StatCard label="Total" value={7} icon={Beaker} tone="emerald" />
      </>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Módulo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
