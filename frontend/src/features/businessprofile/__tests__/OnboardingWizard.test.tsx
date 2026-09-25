import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingWizard } from '../components/OnboardingWizard';

describe('OnboardingWizard Component', () => {
  it('renderiza el paso 1 y valida que la industria no esté vacía', async () => {
    const handleComplete = vi.fn();
    render(<OnboardingWizard onComplete={handleComplete} />);

    expect(screen.getByRole('heading', { name: /cuál es el sector o industria de tu negocio/i })).toBeInTheDocument();
    
    // Intentar continuar sin escribir
    const continueBtn = screen.getByRole('button', { name: /continuar/i });
    fireEvent.click(continueBtn);

    expect(await screen.findByText(/por favor indica la industria o sector de tu negocio/i)).toBeInTheDocument();
    expect(handleComplete).not.toHaveBeenCalled();
  });

  it('permite seleccionar una sugerencia de industria y avanzar al paso 2', async () => {
    const handleComplete = vi.fn();
    render(<OnboardingWizard onComplete={handleComplete} />);

    // Click en la sugerencia SaaS B2B
    const sugBtn = screen.getByRole('button', { name: /^saas b2b$/i });
    fireEvent.click(sugBtn);

    const continueBtn = screen.getByRole('button', { name: /continuar/i });
    fireEvent.click(continueBtn);

    // Debe mostrar paso 2
    expect(await screen.findByRole('heading', { name: /cuál es el tamaño de tu equipo/i })).toBeInTheDocument();
  });
});
