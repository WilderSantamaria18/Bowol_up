import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ExecutiveCockpit } from '@/features/dashboard/components/ExecutiveCockpit';
import { InteractiveInnovationSimulator } from '@/features/landing/components/InteractiveInnovationSimulator';
import { InteractiveModuleExplorer } from '@/features/landing/components/InteractiveModuleExplorer';
import { InteractiveRoiCalculator } from '@/features/landing/components/InteractiveRoiCalculator';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

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
    <div className="space-y-28 py-8 relative">
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
          <a href="#simulator" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto border-white/[0.08] hover:border-white/[0.2] bg-zinc-900/60"
            >
              Probar Simulador en Vivo
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

      {/* 1. Live Interactive Innovation Simulator */}
      <section id="simulator" className="relative z-10 scroll-mt-24">
        <InteractiveInnovationSimulator />
      </section>

      {/* 2. Interactive Modular Workbench */}
      <section id="features" className="relative z-10 scroll-mt-24">
        <InteractiveModuleExplorer />
      </section>

      {/* 3. Interactive ROI & Savings Calculator */}
      <section className="relative z-10">
        <InteractiveRoiCalculator />
      </section>

      {/* 4. Transparent Pricing Section with Interactive Billing Cycle Switcher */}
      <section id="pricing" className="space-y-12 max-w-6xl mx-auto scroll-mt-24 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="brand">Monetización & Planes</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Planes Transparentes para Crecer Sin Fricción
          </h2>
          <p className="text-sm text-zinc-400">
            Comienza gratis con tu equipo y escala tus créditos de IA conforme tu cadencia de innovación se acelere.
          </p>

          {/* Interactive Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Facturación Mensual
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                billingCycle === 'ANNUAL'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Facturación Anual</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                -15% Descuento
              </span>
            </button>
          </div>
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
                <span className="text-4xl font-extrabold text-white">
                  ${billingCycle === 'ANNUAL' ? '490' : '49'}
                </span>
                <span className="text-xs text-zinc-400 ml-1">
                  {billingCycle === 'ANNUAL' ? '/ año' : '/ mes'}
                </span>
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
                <span className="text-4xl font-extrabold text-white">
                  ${billingCycle === 'ANNUAL' ? '1,990' : '199'}
                </span>
                <span className="text-xs text-zinc-400 ml-1">
                  {billingCycle === 'ANNUAL' ? '/ año' : '/ mes'}
                </span>
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

      {/* 5. FAQ Accordion */}
      <section className="max-w-3xl mx-auto space-y-6 relative z-10">
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

      {/* 6. Final CTA Banner */}
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
