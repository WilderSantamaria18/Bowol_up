import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Target, Zap, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ExecutiveCockpit } from '@/features/dashboard/components/ExecutiveCockpit';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Si el usuario está autenticado, mostramos el Cockpit Ejecutivo en vivo
  if (isAuthenticated) {
    return <ExecutiveCockpit />;
  }

  // Si no está autenticado, mostramos la Landing Page institucional de bienvenida
  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <Badge variant="brand">AI Innovation OS</Badge>
          <Badge variant="default">Java 21 + React 18</Badge>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          El Sistema Operativo de <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-600">
            Innovación y Ejecución
          </span>
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg">
          Transforma señales del mercado en oportunidades validadas y ejecútalas en sprints guiados por Inteligencia Artificial.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/register">
            <Button variant="primary" size="lg" rightIcon={ArrowRight}>
              Comenzar Ahora
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </section>

      {/* 3 Pillars: Intelligence -> Strategy -> Execution */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="interactive">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
            <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">1. Intelligence</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Detección continua de tendencias globales, clustering semántico y scoring de impacto con embeddings vectoriales en PostgreSQL.
          </p>
        </Card>

        <Card variant="interactive">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
            <Target className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">2. Strategy</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Matrices FODA dinámicas, priorización con RICE Score cuantitativo y generación de hipótesis experimentales auditadas.
          </p>
        </Card>

        <Card variant="interactive">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <Zap className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">3. Execution</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Gestor Kanban de alta velocidad (posicionamiento x1000), sprints de experimentación y publicación social integrada.
          </p>
        </Card>
      </section>

      {/* System Status Banner */}
      <section className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Arquitectura Multi-Tenant RLS & JWT RS256</h4>
            <p className="text-xs text-zinc-400">Aislamiento criptográfico y seguridad de nivel empresarial.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Cpu className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
          <span>Spring Boot 3 + React 18 + PostgreSQL</span>
        </div>
      </section>
    </div>
  );
};
