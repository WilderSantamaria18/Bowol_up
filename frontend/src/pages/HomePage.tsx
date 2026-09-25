import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ExecutiveCockpit } from '@/features/dashboard/components/ExecutiveCockpit';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Si el usuario está autenticado, mostramos el Cockpit Ejecutivo de su espacio de trabajo
  if (isAuthenticated) {
    return <ExecutiveCockpit />;
  }

  const faqs = [
    {
      q: '¿Cómo detecta BOWOL las tendencias de mercado relevantes?',
      a: 'BOWOL se conecta de forma continua a fuentes globales como repositorios de GitHub y contenido técnico de YouTube. Su motor semántico normaliza las señales y calcula un TrendScore impulsado por IA, filtrando automáticamente el ruido para mostrar solo lo que impacta a tu modelo de negocio.',
    },
    {
      q: '¿Qué son los Créditos de IA y cómo se consumen?',
      a: 'Los créditos de IA se utilizan cuando ejecutas operaciones avanzadas asistidas por IA: evaluación estratégica de tendencias, generación de matrices FODA, descomposición de backlog en tareas o redacción de publicaciones sociales. Cada plan incluye una cuota mensual recargable automáticamente.',
    },
    {
      q: '¿Cómo garantizan el aislamiento de los datos de mi empresa?',
      a: 'Implementamos aislamiento a nivel de base de datos mediante Row Level Security (RLS) en PostgreSQL, autenticación criptográfica JWT con firma asimétrica RS256 y políticas estrictas de multi-tenancy. Tus estrategias nunca se mezclan con las de otras organizaciones.',
    },
    {
      q: '¿Puedo integrar el calendario de BOWOL con Google Calendar u Outlook?',
      a: 'Sí. BOWOL genera feeds dinámicos compatibles con el estándar RFC 5545 iCalendar (.ics), lo que te permite sincronizar hitos, lanzamientos y fechas límite de sprints en tiempo real con cualquier cliente de calendario.',
    },
  ];

  return (
    <div className="space-y-24 py-8 relative">
      {/* Background Ambient Glows */}
      <div className="glow-spot-orange top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70" />
      <div className="glow-spot-indigo top-96 right-0 opacity-40" />

      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 relative z-10 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-pill text-xs font-semibold text-orange-300">
          <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" strokeWidth={1.5} />
          <span>El Sistema Operativo de Innovación Autónoma</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 font-normal">v2.0 Enterprise</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-display">
          De Señales de Mercado a Ejecución Ágil <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
            en Cuestión de Horas.
          </span>
        </h1>

        <p className="text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
          Detecta tendencias tecnológicas antes que tu competencia, genera matrices FODA automáticas con IA y orquesta sprints de experimentación de alto impacto.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link to="/register" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              rightIcon={ArrowRight}
              className="w-full sm:w-auto shadow-xl shadow-orange-500/25 px-8"
            >
              Comenzar Prueba Gratuita
            </Button>
          </Link>
          <a href="#features" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto border-white/[0.08] hover:border-white/[0.2] bg-zinc-900/60"
            >
              Conocer el Sistema
            </Button>
          </a>
        </div>

        <div className="pt-4 flex items-center justify-center gap-6 text-xs text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" /> Sin tarjeta de crédito
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" /> 500 Créditos IA incluidos
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" /> Multi-tenant RLS
          </span>
        </div>
      </section>

      {/* Showcase Visual: Liquid Glass Cockpit Preview */}
      <section className="relative z-10 max-w-5xl mx-auto">
        <div className="rounded-2xl liquid-glass p-2 sm:p-4 border border-white/[0.1] shadow-2xl relative overflow-hidden">
          {/* Top Mockup Window Header */}
          <div className="flex items-center justify-between pb-3 px-3 border-b border-white/[0.06] mb-4 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-zinc-500">bowol.app / workspace / strategic-cockpit</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              AI Agent Active
            </div>
          </div>

          {/* Inner Mockup Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Radar de Mercado</span>
                <Badge variant="brand">Score 94</Badge>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">IA Generativa en Logística</h4>
              <p className="text-xs text-zinc-400 leading-snug">Señal detectada en 14 repositorios con crecimiento de adopción de +182% en el último mes.</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">FODA & RICE</span>
                <Badge variant="success">Oportunidad #1</Badge>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Automatización de Backlog</h4>
              <p className="text-xs text-zinc-400 leading-snug">RICE Score: 850. Alto alcance con bajo esfuerzo de implementación validado en sprint.</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Velocidad del Sprint</span>
                <Badge variant="default">Sprint 4 en curso</Badge>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">84% Completado</h4>
              <p className="text-xs text-zinc-400 leading-snug">12 tareas desplegadas. Burndown alineado con la meta de lanzamiento al mercado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Pillars Section */}
      <section id="features" className="space-y-12 max-w-6xl mx-auto scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="brand">Flujo de Innovación</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            El Ciclo Continuo de Innovación
          </h2>
          <p className="text-sm text-zinc-400">
            Un motor sincronizado que transforma la información del mercado en resultados tangibles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="liquid-glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5">
              <TrendingUp className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <span className="text-[11px] uppercase tracking-widest font-bold text-blue-400 block mb-1">
              Fase 01 — Inteligencia
            </span>
            <h3 className="text-xl font-bold text-white mb-2">Radar de Tendencias</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Monitoreo automático de señales tecnológicas, repositorios de código abierto y videos de alta tracción con evaluación de aplicabilidad personalizada.
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400" /> Algoritmo propietario de TrendScore
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400" /> Conectores GitHub & YouTube
              </li>
            </ul>
          </div>

          <div className="liquid-glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-5">
              <Target className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <span className="text-[11px] uppercase tracking-widest font-bold text-orange-400 block mb-1">
              Fase 02 — Estrategia
            </span>
            <h3 className="text-xl font-bold text-white mb-2">FODA & Scoring RICE</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Convierte las señales detectadas en matrices FODA dinámicas y prioriza iniciativas estratégicas con modelos cuantitativos transparentes.
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-orange-400" /> Evidencias verificables por cuadrante
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-orange-400" /> Formulación de hipótesis auditadas
              </li>
            </ul>
          </div>

          <div className="liquid-glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
              <Zap className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <span className="text-[11px] uppercase tracking-widest font-bold text-emerald-400 block mb-1">
              Fase 03 — Ejecución
            </span>
            <h3 className="text-xl font-bold text-white mb-2">Kanban & Sprints Ágiles</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Descompón metas complejas en tareas ejecutables con el AI Backlog Decomposer, gestiona sprints y sincroniza calendarios con tu equipo.
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Tablero Kanban de alta velocidad
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Sincronización iCalendar (.ics)
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section id="pricing" className="space-y-12 max-w-6xl mx-auto scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="brand">Monetización & Planes</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Planes Claros para Crecer Sin Fricción
          </h2>
          <p className="text-sm text-zinc-400">
            Comienza gratis con tu equipo y escala tus créditos de IA conforme tu cadencia de innovación se acelere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Starter */}
          <div className="liquid-glass rounded-2xl p-6 flex flex-col justify-between border-white/[0.08]">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xl font-bold text-white font-display">Free Starter</h4>
                <Badge variant="default">Exploración</Badge>
              </div>
              <p className="text-xs text-zinc-400 min-h-[32px]">Para profesionales y startups explorando la plataforma.</p>
              <div className="my-6 pb-6 border-b border-zinc-800">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-zinc-400 ml-1">para siempre</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-300 mb-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 500 créditos de IA al mes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 1 proyecto formal</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Tablero Kanban completo</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sincronización iCalendar</li>
              </ul>
            </div>
            <Link to="/register">
              <Button variant="outline" className="w-full justify-center border-zinc-700">
                Comenzar Gratis
              </Button>
            </Link>
          </div>

          {/* Growth Pro */}
          <div className="liquid-glass rounded-2xl p-6 flex flex-col justify-between border-orange-500/50 bg-gradient-to-b from-orange-500/10 via-zinc-900/90 to-zinc-950 shadow-xl shadow-orange-500/10 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="brand" className="bg-orange-500 text-white font-bold px-3 py-0.5 border-orange-400">
                Más Popular
              </Badge>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2 mt-1">
                <h4 className="text-xl font-bold text-white font-display">Growth Pro</h4>
                <Badge variant="brand">Escalado</Badge>
              </div>
              <p className="text-xs text-zinc-400 min-h-[32px]">Para scaleups y equipos de producto con alta cadencia.</p>
              <div className="my-6 pb-6 border-b border-zinc-800">
                <span className="text-4xl font-extrabold text-white">$49</span>
                <span className="text-xs text-zinc-400 ml-1">/ mes</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-200 mb-6">
                <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-orange-400" /> 5,000 créditos de IA al mes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400" /> Hasta 10 proyectos simultáneos</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400" /> Brand Kit & AI Content Studio</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400" /> Análisis ilimitado de competidores</li>
              </ul>
            </div>
            <Link to="/register">
              <Button variant="primary" className="w-full justify-center shadow-lg shadow-orange-500/25">
                Probar Growth Pro
              </Button>
            </Link>
          </div>

          {/* Enterprise Scale */}
          <div className="liquid-glass rounded-2xl p-6 flex flex-col justify-between border-white/[0.08]">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xl font-bold text-white font-display">Enterprise Scale</h4>
                <Badge variant="default">Corporativo</Badge>
              </div>
              <p className="text-xs text-zinc-400 min-h-[32px]">Para organizaciones consolidadas, consultoras y agencias.</p>
              <div className="my-6 pb-6 border-b border-zinc-800">
                <span className="text-4xl font-extrabold text-white">$199</span>
                <span className="text-xs text-zinc-400 ml-1">/ mes</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-300 mb-6">
                <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-indigo-400" /> 25,000 créditos de IA al mes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Proyectos y redes ilimitados</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Acceso a REST API y Webhooks</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Auditoría corporativa y soporte 24/7</li>
              </ul>
            </div>
            <Link to="/register">
              <Button variant="outline" className="w-full justify-center border-zinc-700">
                Contactar Ventas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="default">Resolución de Dudas</Badge>
          <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Preguntas Frecuentes
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="liquid-glass rounded-xl border border-white/[0.08] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold text-white hover:text-orange-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-orange-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="relative z-10 max-w-4xl mx-auto">
        <div className="rounded-3xl liquid-glass border border-orange-500/30 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden bg-gradient-to-b from-orange-500/10 via-zinc-900 to-zinc-950">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mx-auto shadow-lg shadow-orange-500/20">
            <Sparkles className="w-7 h-7" strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              Acelera la Innovación de tu Negocio Hoy
            </h3>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              Únete a las startups y empresas que toman decisiones estratégicas respaldadas por señales reales y modelos de IA cuantitativos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 shadow-xl shadow-orange-500/30">
                Crear Cuenta Gratuita
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-zinc-700">
                Ingresar a mi Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
