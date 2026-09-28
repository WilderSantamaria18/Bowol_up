import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { BrandLogo } from '@/components/ui/BrandLogo';
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
    <div className="min-h-[calc(100vh-10rem)] flex flex-col justify-center items-center px-4 py-12 relative">
      {/* Subtle ambient spotlight for executive depth */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden -z-10">
        <div className="w-[480px] h-[480px] bg-orange-500/[0.07] dark:bg-orange-500/15 rounded-full blur-[90px]" />
      </div>

      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3 flex flex-col items-center">
          <BrandLogo size="lg" asLink to="/" showTagline />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-display pt-2">
            Iniciar Sesión
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xs leading-relaxed font-medium">
            Accede a tu plataforma de inteligencia de mercado y orquestación estratégica
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 shadow-2xl shadow-zinc-300/40 dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] rounded-2xl p-7 sm:p-9 space-y-6 backdrop-blur-xl">
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-0.5">
                <label htmlFor="login-password" role="none" className="text-xs font-bold text-zinc-900 dark:text-zinc-200 tracking-tight">
                  Contraseña
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Función de recuperación enviada a soporte enterprise.');
                  }}
                  className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 hover:underline transition-colors"
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
              className="w-full mt-4 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 font-bold"
              isLoading={isLoading}
              rightIcon={ArrowRight}
            >
              Entrar al Workspace
            </Button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] text-zinc-500 uppercase tracking-wider font-mono absolute">
              o Enterprise
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full font-medium text-xs border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200"
            onClick={async () => {
              if (!email || !email.includes('@')) {
                setErrorProblem({
                  status: 400,
                  title: 'Correo corporativo requerido',
                  detail: 'Ingresa tu correo empresarial arriba para detectar tu proveedor SSO corporativo.',
                });
                return;
              }
              setIsLoading(true);
              setErrorProblem(null);
              try {
                const { ssoService } = await import('@/features/organization/services/ssoService');
                const res = await ssoService.initiate(email);
                if (res.authorizationUrl) {
                  window.location.href = res.authorizationUrl;
                }
              } catch (err: unknown) {
                const problem = err as ProblemDetail;
                setErrorProblem(problem || {
                  status: 404,
                  title: 'SSO no configurado',
                  detail: 'No se encontró un proveedor SSO activo para tu dominio corporativo.',
                });
              } finally {
                setIsLoading(false);
              }
            }}
          >
            Continuar con SSO Corporativo (Google / Azure AD)
          </Button>

          <div className="pt-4 text-center text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-200/90 dark:border-zinc-800">
            ¿No tienes una cuenta aún?{' '}
            <Link to="/register" className="font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 hover:underline transition-colors">
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
