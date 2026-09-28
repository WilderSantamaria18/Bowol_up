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

  it('muestra validación cuando no se aceptan los términos y condiciones', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Elena Torres' } });
    fireEvent.change(screen.getByLabelText(/correo electrónico de trabajo/i), { target: { value: 'elena@empresa.com' } });
    fireEvent.change(screen.getByLabelText(/^contraseña/i), { target: { value: 'Password123!' } });

    // Not checking terms
    fireEvent.click(screen.getByRole('button', { name: /crear workspace gratis/i }));

    await waitFor(() => {
      expect(screen.getByText(/debes aceptar los términos de servicio/i)).toBeInTheDocument();
    });
  });

  it('permite registrar con éxito al aceptar los términos y condiciones', async () => {
    const { authService } = await import('../services/authService');
    vi.mocked(authService.register).mockResolvedValueOnce({
      user: {
        id: 'user-1',
        name: 'Elena Torres',
        email: 'elena@empresa.com',
        avatarUrl: '',
        status: 'ACTIVE',
      },
      organization: {
        id: 'org-1',
        name: 'Elena Workspace',
        slug: 'elena-workspace',
        role: 'OWNER',
        permissions: ['*'],
      },
      accessToken: 'token-123',
      refreshToken: 'refresh-123',
      tokenType: 'Bearer',
      expiresIn: 900,
    });

    render(
      <AuthProvider>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Elena Torres' } });
    fireEvent.change(screen.getByLabelText(/correo electrónico de trabajo/i), { target: { value: 'elena@empresa.com' } });
    fireEvent.change(screen.getByLabelText(/^contraseña/i), { target: { value: 'Password123!' } });
    
    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);

    fireEvent.click(screen.getByRole('button', { name: /crear workspace gratis/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: 'Elena Torres',
        email: 'elena@empresa.com',
        password: 'Password123!',
        organizationName: undefined,
      });
    });
  });
});
