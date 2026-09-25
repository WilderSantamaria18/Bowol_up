import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { ProblemDetail } from '@/services/http';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorProblem, setErrorProblem] = useState<ProblemDetail | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorProblem(null);

    if (!email || !password) {
      setErrorProblem({
        status: 400,
        detail: 'Por favor ingrese su correo electrónico y contraseña.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      const problem = err as ProblemDetail;
      setErrorProblem(problem);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              BOWOL<span className="text-orange-500">.</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Iniciar Sesión</h1>
          <p className="text-xs text-zinc-400">
            Accede a tu plataforma de innovación y copilot de estrategia
          </p>
        </div>

        <Card variant="glass" className="border-white/[0.08] shadow-glass p-6 sm:p-8 space-y-5">
          {errorProblem && (
            <Alert
              variant="error"
              title={errorProblem.title || 'Error de autenticación'}
              detail={errorProblem.detail}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="login-email"
              label="Correo electrónico"
              type="email"
              placeholder="tu@startup.com"
              leftIcon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" role="none" className="text-xs font-medium text-zinc-300">
                  Contraseña
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Función de recuperación en fase de email transaccional.');
                  }}
                  className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                leftIcon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={ArrowRight}
            >
              Entrar al Workspace
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-zinc-400 border-t border-white/[0.06]">
            ¿No tienes una cuenta aún?{' '}
            <Link to="/register" className="font-semibold text-orange-400 hover:text-orange-300 transition-colors">
              Crear cuenta
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
