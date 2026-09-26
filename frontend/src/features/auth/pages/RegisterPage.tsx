import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator';
import { ProblemDetail } from '@/services/http';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorProblem, setErrorProblem] = useState<ProblemDetail | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorProblem(null);

    if (!name.trim() || !email.trim() || !password) {
      setErrorProblem({
        status: 400,
        detail: 'Por favor complete todos los campos obligatorios.',
      });
      return;
    }

    if (password.length < 8) {
      setErrorProblem({
        status: 400,
        detail: 'La contraseña debe tener un mínimo de 8 caracteres.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name,
        email,
        password,
        organizationName: organizationName.trim() || undefined,
      });
      navigate('/', { replace: true });
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
        <div className="w-[520px] h-[520px] bg-orange-500/[0.07] dark:bg-orange-500/15 rounded-full blur-[90px]" />
      </div>

      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3 flex flex-col items-center">
          <BrandLogo size="lg" asLink to="/" showTagline />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-display pt-2">
            Comenzar con BOWOL
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xs leading-relaxed font-medium">
            Crea tu cuenta de fundador y despliega tu workspace estratégico en segundos
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 shadow-2xl shadow-zinc-300/40 dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] rounded-2xl p-7 sm:p-9 space-y-6 backdrop-blur-xl">
          {errorProblem && (
            <Alert
              variant="error"
              title={errorProblem.title || 'Error en registro'}
              detail={errorProblem.detail}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="register-name"
              label="Nombre completo"
              placeholder="Elena Torres"
              leftIcon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />

            <Input
              id="register-email"
              label="Correo electrónico de trabajo"
              type="email"
              placeholder="elena@empresa.com"
              leftIcon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              id="register-org"
              label="Nombre de tu organización / startup"
              placeholder="Acme Innovations"
              leftIcon={Building}
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              helperText="Podrás invitar a tu equipo y miembros después"
            />

            <div className="space-y-1.5">
              <Input
                id="register-password"
                label="Contraseña"
                type="password"
                placeholder="Mínimo 8 caracteres"
                leftIcon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <PasswordStrengthIndicator password={password} />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 font-bold"
              isLoading={isLoading}
              rightIcon={ArrowRight}
            >
              Crear Workspace Gratis
            </Button>
          </form>

          <div className="pt-4 text-center text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-200/90 dark:border-zinc-800">
            ¿Ya tienes una cuenta creada?{' '}
            <Link to="/login" className="font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 hover:underline transition-colors">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
