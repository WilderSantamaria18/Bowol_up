import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Sparkles,
  Target,
  Zap,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Bot,
  Activity,
  Award,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCopilot } from '@/features/copilot/context/CopilotContext';
import { dashboardService } from '../services/dashboardService';
import { trendService } from '@/features/trends/services/trendService';

export const ExecutiveCockpit: React.FC = () => {
  const { user } = useAuth();
  const { openCopilot } = useCopilot();
  const queryClient = useQueryClient();
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardService.getSummary(),
  });

  const syncMutation = useMutation({
    mutationFn: () => trendService.triggerSync(10),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setSyncSuccessMsg(
        `¡Sincronización exitosa! Se procesaron ${data.totalFetched} señales (${data.totalCreated} nuevas, ${data.totalUpdated} actualizadas).`
      );
      setTimeout(() => setSyncSuccessMsg(null), 6000);
    },
  });

  // Saludo según hora del día
  const currentHour = new Date().getHours();
  let greeting = 'Buenos días';
  if (currentHour >= 12 && currentHour < 19) {
    greeting = 'Buenas tardes';
  } else if (currentHour >= 19 || currentHour < 6) {
    greeting = 'Buenas noches';
  }

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm animate-pulse">Cargando Cockpit Estratégico...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <Alert variant="error" title="Error al cargar el dashboard">
          No se pudieron sincronizar las métricas ejecutivas. Por favor recarga la página.
        </Alert>
      </div>
    );
  }

  const { organization, maturity, trends, strategy, execution } = summary;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Ejecutivo & Barra de Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              Cockpit de Innovación
            </span>
            <span className="text-zinc-600">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {organization.name}
            </span>
            <Badge variant="default" className="text-[10px] uppercase">
              Plan {organization.plan}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">{user?.name || 'Líder'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Resumen diario del ciclo continuo: <strong className="text-zinc-200">Intelligence $\rightarrow$ Strategy $\rightarrow$ Execution</strong>.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={RefreshCw}
            isLoading={syncMutation.isPending}
            onClick={() => syncMutation.mutate()}
            title="Buscar nuevas señales de mercado en GitHub y fuentes globales"
          >
            {syncMutation.isPending ? 'Sincronizando...' : 'Sincronizar Tendencias'}
          </Button>

          <Button
            variant="glass"
            size="sm"
            leftIcon={Sparkles}
            onClick={() => openCopilot({ contextType: 'GENERAL' })}
            className="border-orange-500/30 text-orange-300 hover:text-orange-200"
          >
            Preguntar al Copilot
          </Button>
        </div>
      </div>

      {syncSuccessMsg && (
        <Alert variant="success" title="Sincronización">
          {syncSuccessMsg}
        </Alert>
      )}

      {/* 2. Grid de 4 Indicadores Clave de Madurez & Desempeño */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Madurez Digital & IA */}
        <Card variant="glass" className="relative overflow-hidden group hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Índice de Madurez</span>
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Award className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">
                {Math.round((maturity.digitalMaturity + maturity.aiMaturity) / 2)}
                <span className="text-xs text-zinc-500 font-normal">/100</span>
              </span>
              <Badge variant="brand" className="text-[10px]">
                {maturity.stage.replace('_', ' ')}
              </Badge>
            </div>
            {/* Barras de desglose */}
            <div className="space-y-1.5 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-0.5">
                  <span>Digital</span>
                  <span>{maturity.digitalMaturity}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${maturity.digitalMaturity}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-0.5">
                  <span>Inteligencia Artificial</span>
                  <span>{maturity.aiMaturity}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${maturity.aiMaturity}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <Link
            to="/business-profile"
            className="mt-3 inline-flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 font-medium"
          >
            Ajustar perfil estratégico <ChevronRight className="w-3 h-3" />
          </Link>
        </Card>

        {/* Radar de Inteligencia */}
        <Card variant="glass" className="relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Radar de Tendencias</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{trends.totalGlobalTrends}</span>
              <span className="text-xs text-zinc-400">
                <strong className="text-emerald-400">{trends.evaluatedTrendsCount}</strong> analizadas
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tendencias globales monitorizadas con scoring algorítmico y clustering semántico.
            </p>
          </div>
          <Link
            to="/trends"
            className="mt-3 inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
          >
            Explorar radar completo <ChevronRight className="w-3 h-3" />
          </Link>
        </Card>

        {/* Embudo de Oportunidades & FODA */}
        <Card variant="glass" className="relative overflow-hidden group hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Estrategia & RICE</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Target className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{strategy.opportunitiesCount}</span>
              <Badge variant="default" className="text-[10px]">
                Score RICE Prom: {strategy.averageRiceScore}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span>{strategy.opportunitiesBacklog} en backlog</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">{strategy.opportunitiesPrioritized} priorizadas</span>
            </div>
          </div>
          <Link
            to="/opportunities"
            className="mt-3 inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
          >
            Ver tablero de oportunidades <ChevronRight className="w-3 h-3" />
          </Link>
        </Card>

        {/* Ejecución & Sprints */}
        <Card variant="glass" className="relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ejecución Ágil</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
          </div>
          {execution.activeSprint ? (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-white truncate max-w-[140px]" title={execution.activeSprint.name}>
                  {execution.activeSprint.name}
                </span>
                <span className="text-xs font-bold text-emerald-400">{execution.activeSprint.progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${execution.activeSprint.progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                {execution.activeSprint.completedTasks} de {execution.activeSprint.totalTasks} tareas completadas
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-base font-semibold text-zinc-300">Sin Sprint Activo</span>
              </div>
              <p className="text-xs text-zinc-400">
                {execution.totalTasksCount} tareas en el backlog listas para planificar.
              </p>
            </div>
          )}
          <Link
            to="/sprints"
            className="mt-3 inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Abrir tablero de Sprints <ChevronRight className="w-3 h-3" />
          </Link>
        </Card>
      </div>

      {/* 3. Pipeline Interactivo: El Ciclo Estratégico en Marcha */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Ciclo de Innovación BOWOL</h2>
            <p className="text-xs text-zinc-400">Conexión automatizada desde la señal externa hasta la entrega ágil.</p>
          </div>
          <Badge variant="default" className="hidden sm:inline-flex items-center gap-1 text-[11px]">
            <Activity className="w-3 h-3 text-emerald-400" />
            Flujo Continuo
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Paso 1: Intelligence */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="text-sm font-semibold text-white">Intelligence</h3>
              </div>
              <p className="text-xs text-zinc-400">
                {trends.totalGlobalTrends > 0
                  ? `${trends.totalGlobalTrends} tendencias detectadas. Analiza con IA su aplicabilidad para tu modelo de negocio.`
                  : 'Aún no has sincronizado tendencias. Pulsa Sincronizar para comenzar a captar señales.'}
              </p>
            </div>
            <Link to="/trends">
              <Button variant="ghost" size="sm" rightIcon={ArrowRight} className="w-full text-xs text-blue-400 hover:text-blue-300">
                Ver Tendencias
              </Button>
            </Link>
          </div>

          {/* Paso 2: Strategy */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="text-sm font-semibold text-white">Strategy (FODA & RICE)</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Cruza señales del mercado con tu matriz FODA y prioriza oportunidades cuantitativamente con RICE.
              </p>
            </div>
            <Link to="/opportunities">
              <Button variant="ghost" size="sm" rightIcon={ArrowRight} className="w-full text-xs text-amber-400 hover:text-amber-300">
                Priorizar Oportunidades
              </Button>
            </Link>
          </div>

          {/* Paso 3: Execution */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="text-sm font-semibold text-white">Execution</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Desglosa iniciativas en historias de usuario y tareas de sprint con el gestor Kanban x1000.
              </p>
            </div>
            <Link to="/tasks">
              <Button variant="ghost" size="sm" rightIcon={ArrowRight} className="w-full text-xs text-emerald-400 hover:text-emerald-300">
                Ir a Tablero Kanban
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Sección Inferior: Radar de Tendencias de Mayor Score + Copilot Strategic Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar de Tendencias (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Tendencias Clave de Alto Impacto
              </h2>
            </div>
            <Link to="/trends" className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1">
              Ver todas ({trends.totalGlobalTrends}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {trends.topTrends.length > 0 ? (
            <div className="space-y-3">
              {trends.topTrends.map((trend) => (
                <div
                  key={trend.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="brand" className="text-[10px]">
                        Score: {trend.score}
                      </Badge>
                      <Badge variant="default" className="text-[10px]">
                        {trend.source}
                      </Badge>
                      {trend.relevanceScore !== undefined && (
                        <Badge variant="success" className="text-[10px]">
                          Relevancia IA: {trend.relevanceScore}%
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate" title={trend.title}>
                      {trend.title}
                    </h3>
                    {trend.tags && trend.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {trend.tags.slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-400 border border-zinc-700/50"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {trend.url && (
                      <a
                        href={trend.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title="Ver enlace original"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <Link to="/trends">
                      <Button variant="secondary" size="sm" rightIcon={ArrowRight} className="text-xs">
                        Analizar
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Estado Vacío Elegante con 1-Click Sync */
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.1] text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-white">Radar de Mercado Despejado</h3>
                <p className="text-xs text-zinc-400">
                  La base de datos aún no cuenta con tendencias sincronizadas. Pulsa el botón inferior para extraer automáticamente señales desde GitHub y fuentes públicas de IA.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={RefreshCw}
                isLoading={syncMutation.isPending}
                onClick={() => syncMutation.mutate()}
              >
                {syncMutation.isPending ? 'Sincronizando...' : 'Cargar Señales de Mercado Ahora'}
              </Button>
            </div>
          )}
        </div>

        {/* Columna Derecha: AI Copilot Strategic Brief (1/3) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Asistente Estratégico
            </h2>
          </div>

          <Card variant="glass" className="space-y-4 border-orange-500/20 bg-gradient-to-b from-orange-500/[0.03] to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Recomendación Proactiva</h3>
                <span className="text-[10px] text-zinc-500">Basado en tu perfil de negocio</span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {maturity.digitalMaturity < 50
                ? 'Tu madurez digital está en etapa inicial. Te recomendamos evaluar tendencias de automatización operativa y completar tu perfil FODA para detectar debilidades críticas.'
                : 'Tu nivel de madurez es avanzado. Estás listo para priorizar oportunidades de alto impacto en tu embudo RICE y planificar un Sprint de experimentación.'}
            </p>

            <div className="pt-2 border-t border-white/[0.06] space-y-2">
              <Button
                variant="glass"
                size="sm"
                className="w-full text-xs justify-start text-zinc-300 hover:text-white"
                onClick={() =>
                  openCopilot({
                    contextType: 'GENERAL',
                    initialMessage: '¿Cuáles son las 3 mejores iniciativas de innovación que debería priorizar esta semana para mi empresa?',
                  })
                }
              >
                💡 "¿Qué iniciativas priorizar esta semana?"
              </Button>
              <Button
                variant="glass"
                size="sm"
                className="w-full text-xs justify-start text-zinc-300 hover:text-white"
                onClick={() =>
                  openCopilot({
                    contextType: 'GENERAL',
                    initialMessage: 'Ayúdame a redactar una hipótesis de validación para una nueva oportunidad de IA.',
                  })
                }
              >
                🔬 "Formular hipótesis de validación"
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
