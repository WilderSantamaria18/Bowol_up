import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Play, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Target, 
  Zap, 
  LayoutDashboard, 
  TrendingUp, 
  Bot, 
  Grid2X2,
  Layers,
  ChevronRight
} from 'lucide-react';

export const LandingHeroWith3DTilt: React.FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotX = -(y / rect.height) * 9;
    const rotY = (x / rect.width) * 9;

    setTiltStyle({
      transform: `perspective(1400px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`,
      transition: 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1400px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    });
  };

  return (
    <section className="relative min-h-[100vh] pt-32 pb-24 overflow-hidden flex flex-col items-center justify-center">
      {/* Dynamic Atmospheric Glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[550px] lens-flare-orange blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] lens-flare-blue blur-[140px] pointer-events-none -z-10" />
      <div className="absolute inset-0 enterprise-grid pointer-events-none -z-10" />

      {/* Eyebrow Badge */}
      <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-xs text-zinc-300 mb-8 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="font-medium tracking-tight">Enterprise Intelligence Workspace 2026</span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-400">SOC2 Type II Certificado</span>
      </div>

      {/* Hero Typography */}
      <div className="max-w-[1100px] mx-auto px-6 text-center">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] font-display">
          Del ruido del mercado a la <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
            ejecución estratégica real.
          </span>
        </h1>

        <p className="mt-7 text-base sm:text-lg lg:text-xl text-zinc-400 max-w-[720px] mx-auto font-normal leading-relaxed">
          BOWOL conecta señales de mercado, análisis competitivo FODA y formulación de hipótesis con los sprints ejecutables de tu equipo. Un solo ciclo continuo.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 px-8 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all duration-150 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_24px_rgba(249,115,22,0.35)] active:scale-[0.985]"
          >
            <span>Comenzar prueba empresarial</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#interactive-demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900/60 border border-white/10 hover:border-white/20 backdrop-blur-xl transition-all active:scale-[0.985]"
          >
            <Play className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span>Ver terminal de producto</span>
          </a>
        </div>

        {/* Security & Status Micro-Bar */}
        <div className="mt-10 flex items-center justify-center gap-8 text-xs text-zinc-500 font-mono flex-wrap">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>TLS 1.3 ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SYSTEM OPERATIONAL</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>GDPR & SOC2 COMPLIANT</span>
          </div>
        </div>
      </div>

      {/* ==================== 3D FLOATING PRODUCT MOCKUP ==================== */}
      <div
        ref={wrapRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full max-w-[1240px] px-4 sm:px-6 mt-16 relative"
        style={{ perspective: '2000px' }}
      >
        <div
          ref={panelRef}
          style={tiltStyle}
          className="liquid-card rounded-2xl overflow-hidden border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95)] will-change-transform"
        >
          {/* Mockup Window Chrome */}
          <div className="h-11 px-5 border-b border-white/[0.08] bg-[#12131a]/80 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <div className="ml-4 h-6 px-3 rounded-md bg-zinc-900/90 border border-white/[0.06] flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>app.bowol.ai/workspace/enterprise</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
                Sprint 14 • 94% Completado
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* App Interface Content Preview */}
          <div className="grid grid-cols-12 min-h-[560px] bg-[#0d0e15]">
            {/* Internal Sidebar */}
            <div className="hidden lg:col-span-3 lg:flex flex-col p-4 border-r border-white/[0.08] bg-[#12131a]/50 justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs">
                    AC
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-semibold text-white">Acme Corp</p>
                    <p className="text-[10px] font-mono text-zinc-500">ENTERPRISE TIER</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="px-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Inteligencia</p>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.08] text-white text-xs font-medium border border-white/5">
                    <LayoutDashboard className="w-3.5 h-3.5 text-orange-400" />
                    <span>Dashboard Ejecutivo</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-white text-xs font-medium transition-colors">
                    <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Radar de Tendencias</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-white text-xs font-medium transition-colors">
                    <Bot className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Asistente IA</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-white text-xs font-medium transition-colors">
                    <Grid2X2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Matriz FODA</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/5">
                  <p className="px-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Estrategia & Ejecución</p>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium">
                    <Target className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Oportunidades RICE</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium">
                    <Layers className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Sprints de Validación</span>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Conexión Segura</span>
                </div>
                <span className="font-mono text-zinc-500">v2.4 Enterprise</span>
              </div>
            </div>

            {/* Main Dashboard View Inside Mockup */}
            <div className="col-span-12 lg:col-span-9 p-6 lg:p-8 space-y-6 bg-gradient-to-b from-[#12131A] to-[#0A0A0C]">
              {/* KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                  <div className="flex justify-between items-start text-xs text-zinc-400 font-medium">
                    <span>Índice de Señal de Mercado</span>
                    <Activity className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">88.4</span>
                    <span className="text-xs text-zinc-500 font-mono">/ 100</span>
                  </div>
                  <p className="mt-2 text-xs text-orange-400 flex items-center gap-1 font-medium">
                    <span>+12.6% vs mes anterior</span>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                  <div className="flex justify-between items-start text-xs text-zinc-400 font-medium">
                    <span>Iniciativas RICE Activas</span>
                    <Target className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">24</span>
                    <span className="text-xs text-zinc-500">en roadmap</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> 4 Alta
                    <span className="w-2 h-2 rounded-full bg-amber-400 ml-2" /> 12 Media
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                  <div className="flex justify-between items-start text-xs text-zinc-400 font-medium">
                    <span>Velocidad de Sprints</span>
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">94%</span>
                    <span className="text-xs text-emerald-400 font-medium">cumplimiento</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400">Sprint 14: Validación IA</p>
                </div>
              </div>

              {/* Bento Detail Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Radar Table Snippet */}
                <div className="p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold text-white tracking-tight">Radar de Señales Tecnológicas</span>
                    <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded">TIEMPO REAL</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">Modelos SLM Perimetrales</p>
                        <p className="text-[10px] text-zinc-500">Inferencia local optimizada</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono text-zinc-300">82%</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">Crítico</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">Orquestación Multi-Agente</p>
                        <p className="text-[10px] text-zinc-500">SaaS loop execution</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono text-zinc-300">68%</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">Alto</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FODA Synthesis Snippet */}
                <div className="p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-semibold text-white tracking-tight">Síntesis FODA Automática</span>
                      <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">4 CUADRANTES</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      "Se detecta una divergencia positiva del 14% entre la adopción de modelos locales por competidores tier-1 y nuestra capacidad técnica en Sprint 14."
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                    <span>Fuente: Engine BOWOL IA</span>
                    <span className="text-orange-400 font-medium flex items-center gap-1 cursor-pointer hover:text-orange-300">
                      Ver matriz <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
