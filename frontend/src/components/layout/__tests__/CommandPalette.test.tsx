import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CommandPalette } from '../CommandPalette';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CopilotProvider } from '@/features/copilot/context/CopilotContext';

const renderCommandPalette = (isOpen = true, onClose = vi.fn()) => {
  return render(
    <ThemeProvider>
      <CopilotProvider>
        <BrowserRouter>
          <CommandPalette isOpen={isOpen} onClose={onClose} />
        </BrowserRouter>
      </CopilotProvider>
    </ThemeProvider>
  );
};

describe('CommandPalette Component', () => {
  it('no renderiza nada cuando isOpen es false', () => {
    const onClose = vi.fn();
    renderCommandPalette(false, onClose);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza la barra de búsqueda y los comandos principales cuando isOpen es true', () => {
    renderCommandPalette(true);
    expect(screen.getByRole('dialog', { name: /paleta de comandos/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/escribe un comando/i)).toBeInTheDocument();
    expect(screen.getByText(/radar de tendencias/i)).toBeInTheDocument();
    expect(screen.getByText(/cockpit ejecutivo/i)).toBeInTheDocument();
    expect(screen.getByText(/matriz foda/i)).toBeInTheDocument();
  });

  it('filtra los comandos al escribir en el buscador', () => {
    renderCommandPalette(true);
    const input = screen.getByPlaceholderText(/escribe un comando/i);
    
    fireEvent.change(input, { target: { value: 'foda' } });
    
    expect(screen.getByText(/matriz foda/i)).toBeInTheDocument();
    expect(screen.queryByText(/sprints de innovación/i)).not.toBeInTheDocument();
  });

  it('muestra estado vacío cuando no hay resultados coincidentes', () => {
    renderCommandPalette(true);
    const input = screen.getByPlaceholderText(/escribe un comando/i);
    
    fireEvent.change(input, { target: { value: 'xyzpalabranoexistente' } });
    
    expect(screen.getByText(/no se encontraron resultados para/i)).toBeInTheDocument();
  });

  it('llama a onClose cuando se presiona la tecla Escape', () => {
    const onClose = vi.fn();
    renderCommandPalette(true, onClose);
    
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
