import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('BOWOL App Integration', () => {
  it('renderiza la marca BOWOL y los tres pilares del ciclo de innovación', () => {
    render(<App />);
    
    // Verificar logotipo/marca en cabecera
    expect(screen.getByText('BOWOL')).toBeInTheDocument();
    
    // Verificar ciclo Intelligence -> Strategy -> Execution
    expect(screen.getByText('1. Intelligence')).toBeInTheDocument();
    expect(screen.getByText('2. Strategy')).toBeInTheDocument();
    expect(screen.getByText('3. Execution')).toBeInTheDocument();
  });
});
