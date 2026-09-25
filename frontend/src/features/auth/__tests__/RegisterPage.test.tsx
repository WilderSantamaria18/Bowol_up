import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RegisterPage } from '../pages/RegisterPage';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../services/authService', () => ({
  authService: {
    register: vi.fn(),
    getMe: vi.fn().mockRejectedValue(new Error('No session')),
  },
}));

describe('RegisterPage Component', () => {
  it('renderiza el formulario de registro con indicador de contraseña', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /comenzar con bowol/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico de trabajo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre de tu organización/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
  });

  it('muestra validación cuando la contraseña tiene menos de 8 caracteres', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Elena' } });
    fireEvent.change(screen.getByLabelText(/correo electrónico de trabajo/i), { target: { value: 'elena@ai.com' } });
    fireEvent.change(screen.getByLabelText(/^contraseña/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /crear workspace gratis/i }));

    await waitFor(() => {
      expect(screen.getByText(/la contraseña debe tener un mínimo de 8 caracteres/i)).toBeInTheDocument();
    });
  });
});
