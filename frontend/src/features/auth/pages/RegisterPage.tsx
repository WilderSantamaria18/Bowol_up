import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, ArrowRight, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
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
    <div className="min-h-[calc(100vh-12rem)] flex flex-col justify-center items-center px-4 py-8">
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Comenzar con BOWOL</h1>
          <p className="text-xs text-zinc-400">
            Crea tu cuenta de fundador y despliega tu workspace con IA en segundos
          </p>
        </div>

        <Card variant="glass" className="border-white/[0.08] shadow-glass p-6 sm:p-8 space-y-5">
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

            <div className="space-y-1">
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
              className="w-full mt-4"
              isLoading={isLoading}
              rightIcon={ArrowRight}
            >
              Crear Workspace Gratis
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-zinc-400 border-t border-white/[0.06]">
            ¿Ya tienes una cuenta creada?{' '}
            <Link to="/login" className="font-semibold text-orange-400 hover:text-orange-300 transition-colors">
              Iniciar sesión
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
