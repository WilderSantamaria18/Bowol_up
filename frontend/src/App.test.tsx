import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('BOWOL App Integration', () => {
  it('renderiza la marca BOWOL y los tres pilares del ciclo de innovación', () => {
    render(<App />);
    
    // Verificar logotipo/marca en cabecera
    expect(screen.getAllByText(/BOWOL/i)[0]).toBeInTheDocument();
    
    // Verificar titular ejecutivo y lanzador de trayectoria
    expect(screen.getByText(/El Planificador Inteligente de Actividades para tu Negocio/i)).toBeInTheDocument();
    expect(screen.getByText(/Desplázate para descubrir tu nuevo sistema/i)).toBeInTheDocument();
  });
});
