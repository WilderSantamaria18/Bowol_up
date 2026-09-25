import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    getMe: vi.fn().mockRejectedValue(new Error('No session')),
  },
}));

describe('LoginPage Component', () => {
  it('renderiza el formulario de inicio de sesión con sus campos y enlaces', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar al workspace/i })).toBeInTheDocument();
    expect(screen.getByText(/¿no tienes una cuenta aún?/i)).toBeInTheDocument();
  });

  it('muestra mensaje de error si se envía el formulario vacío', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    );

    const submitBtn = screen.getByRole('button', { name: /entrar al workspace/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/por favor ingrese su correo electrónico y contraseña/i)).toBeInTheDocument();
  });

  it('llama a authService.login con credenciales y maneja error RFC 7807', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce({
      status: 401,
      code: 'AUTH_INVALID_CREDENTIALS',
      title: 'Credenciales inválidas',
      detail: 'Correo o contraseña incorrectos.',
    });

    render(
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'user@startup.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'WrongPassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar al workspace/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/correo o contraseña incorrectos/i)).toBeInTheDocument();
    });
  });
});
