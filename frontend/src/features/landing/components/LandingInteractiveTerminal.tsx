import React, { useState } from 'react';

export const LandingInteractiveTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tendencias' | 'foda' | 'oportunidades' | 'sprint'>('tendencias');

  return (
    <section id="interactive-demo" className="py-28 relative bg-zinc-950/70 border-t border-white/[0.06] scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-xs font-mono text-orange-500 uppercase tracking-wider mb-2">
              Simulador en Vivo
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight font-display">
              Explora los componentes de BOWOL
            </h2>
          </div>

          {/* Tabs Switcher */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-sm font-medium text-zinc-400 overflow-x-auto">
            <button
              onClick={() => setActiveTab('tendencias')}
              className={`pb-2 px-3 transition-colors relative font-semibold text-xs sm:text-sm ${
                activeTab === 'tendencias'
                  ? 'text-white after:content-[\'\'] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-orange-500'
                  : 'hover:text-white'
              }`}
            >
              Tendencias
            </button>
            <button
              onClick={() => setActiveTab('foda')}
              className={`pb-2 px-3 transition-colors relative font-semibold text-xs sm:text-sm ${
                activeTab === 'foda'
                  ? 'text-white after:content-[\'\'] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-orange-500'
                  : 'hover:text-white'
              }`}
            >
              Matriz FODA
            </button>
            <button
              onClick={() => setActiveTab('oportunidades')}
              className={`pb-2 px-3 transition-colors relative font-semibold text-xs sm:text-sm ${
                activeTab === 'oportunidades'
                  ? 'text-white after:content-[\'\'] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-orange-500'
                  : 'hover:text-white'
              }`}
            >
              Oportunidades RICE
            </button>
            <button
              onClick={() => setActiveTab('sprint')}
              className={`pb-2 px-3 transition-colors relative font-semibold text-xs sm:text-sm ${
                activeTab === 'sprint'
                  ? 'text-white after:content-[\'\'] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-orange-500'
                  : 'hover:text-white'
              }`}
            >
              Sprint Activo
            </button>
          </div>
        </div>

        {/* Active Tab Presentation Panel */}
        <div className="liquid-card rounded-3xl p-6 lg:p-8 min-h-[420px] transition-all">
          {activeTab === 'tendencias' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h4 className="text-sm font-semibold text-white">Tendencias Emergentes Validadas</h4>
                <span className="text-xs font-mono text-zinc-500">28 Señales Activas</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-white">Modelos SLM Perimetrales</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/20">DeepTech</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Implementación de modelos compactos con inferencia local para alta privacidad y coste predictible.
                  </p>
                  <div className="pt-2 flex justify-between text-xs font-mono text-zinc-500 border-t border-white/[0.04]">
                    <span>Señal: 82%</span>
                    <span className="text-orange-400 font-semibold">Impacto: Crítico</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-white">Arquitectura Multi-Agente</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">SaaS</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Sincronización de agentes de software en bucles de validación operativa autónoma.
                  </p>
                  <div className="pt-2 flex justify-between text-xs font-mono text-zinc-500 border-t border-white/[0.04]">
                    <span>Señal: 68%</span>
                    <span className="text-amber-300 font-semibold">Impacto: Alto</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'foda' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h4 className="text-sm font-semibold text-white">Matriz Estratégica Dinámica</h4>
                <span className="text-xs font-mono text-zinc-500">Actualizado con datos de mercado</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-mono text-orange-400 font-bold uppercase">Fortalezas</span>
                  <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                    Capacidad técnica propia y arquitectura multi-tenant lista para escala enterprise con RLS.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-mono text-amber-300 font-bold uppercase">Oportunidades</span>
                  <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                    Adopción temprana en cuentas corporativas que requieren control y soberanía de datos local.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'oportunidades' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h4 className="text-sm font-semibold text-white">Oportunidades Priorizadas (RICE)</h4>
                <span className="text-xs font-mono text-zinc-500">24 Iniciativas Totales</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">OP-001: Autenticación Zero-Knowledge</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Alcance: 12,000 usuarios corporativos</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20">
                  RICE 92.4
                </span>
              </div>
            </div>
          )}

          {activeTab === 'sprint' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h4 className="text-sm font-semibold text-white">Sprint 14: Validación IA & Ejecución</h4>
                <span className="text-xs font-mono text-emerald-400 font-semibold">94% COMPLETADO</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-[11px] font-mono text-zinc-500">POR HACER</span>
                  <p className="text-xl font-bold text-white mt-1">2</p>
                </div>
                <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-center">
                  <span className="text-[11px] font-mono text-orange-400 font-semibold">EN CURSO</span>
                  <p className="text-xl font-bold text-orange-300 mt-1">1</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">COMPLETADO</span>
                  <p className="text-xl font-bold text-white mt-1">11</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
