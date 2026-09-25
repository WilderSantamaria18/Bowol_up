import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('BOWOL App Integration', () => {
  it('renderiza la marca BOWOL y los tres pilares del ciclo de innovación', () => {
    render(<App />);
    
    // Verificar logotipo/marca en cabecera
    expect(screen.getAllByText(/BOWOL/i)[0]).toBeInTheDocument();
    
    // Verificar ciclo Inteligencia -> Estrategia -> Ejecución
    expect(screen.getByText('Radar de Tendencias')).toBeInTheDocument();
    expect(screen.getByText('FODA con Evidencias')).toBeInTheDocument();
    expect(screen.getByText('Kanban & Sprints')).toBeInTheDocument();
  });
});
