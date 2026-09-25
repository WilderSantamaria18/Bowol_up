import React, { useState } from 'react';
import { 
  TrendingUp, 
  Grid2X2, 
  CheckSquare, 
  Share2, 
  ArrowRight, 
  RotateCcw
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

type ActiveModule = 'RADAR' | 'SWOT' | 'KANBAN' | 'BRAND';

export const InteractiveModuleExplorer: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('RADAR');

  // Interactive state for Radar tab
  const [radarFilter, setRadarFilter] = useState<'ALL' | 'AI' | 'SAAS'>('ALL');

  // Interactive state for SWOT tab
  const [selectedQuadrant, setSelectedQuadrant] = useState<'F' | 'O' | 'D' | 'A'>('O');

  // Interactive state for Kanban tab
  const [kanbanTasks, setKanbanTasks] = useState([
    { id: 1, title: 'Implementar autenticación passkey', status: 'TODO', points: 3 },
    { id: 2, title: 'Optimizar prompts con streaming', status: 'IN_PROGRESS', points: 5 },
    { id: 3, title: 'Diseñar Brand Kit y paleta HSL', status: 'DONE', points: 2 },
  ]);

  // Interactive state for Brand Studio tab
  const [brandTone, setBrandTone] = useState<'INNOVATIVE' | 'TECHNICAL' | 'BOLD'>('INNOVATIVE');

  const advanceTask = (id: number) => {
    setKanbanTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'TODO' ? 'IN_PROGRESS' : t.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const getPostCopy = () => {
    switch (brandTone) {
      case 'INNOVATIVE':
        return {
          title: 'El fin de los planes estratégicos anuales estáticos',
          text: 'La velocidad del software exige que tu estrategia se adapte semanalmente a las señales reales del mercado. En BOWOL transformamos tendencias en sprints ágiles en horas.',
          virality: 88,
          reach: '4.5k - 8.2k',
        };
      case 'TECHNICAL':
        return {
          title: 'Arquitectura Multi-Tenant con RLS y embeddings en PostgreSQL',
          text: 'Descubre cómo aislamos criptográficamente el contexto de cada organización mediante políticas p_tenant y vectores de alta dimensión sin fragmentar la base de datos.',
          virality: 74,
          reach: '3.1k - 6.0k',
        };
      case 'BOLD':
        return {
          title: 'Si tu equipo no valida hipótesis cada semana, estás construyendo a ciegas',
          text: 'El 70% de las funcionalidades de producto nunca son utilizadas. Deja de adivinar y usa scoring cuantitativo RICE respaldado por IA.',
          virality: 95,
          reach: '7.8k - 14.5k',
        };
    }
  };

  const post = getPostCopy();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="brand">Capacidades del Sistema</Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Explora la Suite Modular
        </h2>
        <p className="text-sm text-zinc-400">
          Haz clic e interactúa directamente con cada uno de los cuatro módulos centrales de la plataforma.
        </p>
      </div>

      {/* Module Selector Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl liquid-glass border border-white/[0.08] max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => setActiveModule('RADAR')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeModule === 'RADAR'
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Radar de Tendencias</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModule('SWOT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeModule === 'SWOT'
              ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Grid2X2 className="w-4 h-4" />
          <span>FODA con Evidencias</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModule('KANBAN')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeModule === 'KANBAN'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Kanban & Sprints</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModule('BRAND')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeModule === 'BRAND'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Brand & Social</span>
        </button>
      </div>

      {/* Interactive Workbench Panel */}
      <div className="rounded-3xl liquid-glass border border-white/[0.1] p-6 sm:p-8 min-h-[380px] flex flex-col justify-between shadow-2xl relative">
        {/* TAB 1: RADAR */}
        {activeModule === 'RADAR' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Radar Semántico de Señales Tecnológicas
                </h4>
                <p className="text-xs text-zinc-400">Filtra tendencias y observa su cálculo dinámico de relevancia.</p>
              </div>
              <div className="flex gap-1.5">
                {(['ALL', 'AI', 'SAAS'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setRadarFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                      radarFilter === filter
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-zinc-900/60 text-zinc-500 hover:text-white'
                    }`}
                  >
                    {filter === 'ALL' ? 'Todos' : filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/[0.06] hover:border-blue-500/40 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-white">Small Language Models (SLMs) en el Edge</span>
                  <Badge variant="brand" className="font-mono text-[10px]">Score 96</Badge>
                </div>
                <p className="text-xs text-zinc-400 mb-3">Modelos de 1B a 3B parámetros ejecutándose en navegadores con WebGPU a latencia sub-50ms.</p>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                  <span>GitHub: 14k ⭐</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">+310% de aceleración</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/[0.06] hover:border-blue-500/40 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-white">Orquestación Multi-Agente con MCP</span>
                  <Badge variant="brand" className="font-mono text-[10px]">Score 92</Badge>
                </div>
                <p className="text-xs text-zinc-400 mb-3">Protocolos estandarizados de contexto para permitir colaboración entre agentes especializados.</p>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                  <span>YouTube: 65k vistas</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">+185% menciones</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SWOT */}
        {activeModule === 'SWOT' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-white/[0.06]">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Grid2X2 className="w-5 h-5 text-purple-400" />
                Matriz FODA Asistida por IA
              </h4>
              <p className="text-xs text-zinc-400">Haz clic en cada cuadrante para examinar las evidencias verificables asociadas.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'F', label: 'Fortaleza', color: 'emerald', text: 'Stack técnico moderno Java 21 y arquitectura reactiva.' },
                { key: 'O', label: 'Oportunidad', color: 'blue', text: 'Capturar el mercado B2B automatizando sprints con IA.' },
                { key: 'D', label: 'Debilidad', color: 'amber', text: 'Límite de recursos de GPU dedicadas en fase inicial.' },
                { key: 'A', label: 'Amenaza', color: 'rose', text: 'Rápida commoditización de herramientas de generación básica.' },
              ].map((quad) => (
                <button
                  key={quad.key}
                  onClick={() => setSelectedQuadrant(quad.key as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedQuadrant === quad.key
                      ? 'bg-purple-500/15 border-purple-500 text-white shadow-lg'
                      : 'bg-zinc-950/60 border-white/[0.06] text-zinc-400 hover:border-white/[0.15]'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">{quad.label}</div>
                  <div className="text-xs font-medium line-clamp-2">{quad.text}</div>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-zinc-300">
              <span className="font-bold text-purple-300 block mb-1">Evidencia Verificable Respaldo IA:</span>
              <p className="italic">
                "Basado en el análisis de 8 repositorios clave y telemetría de competidores, las empresas que integran scoring cuantitativo RICE reducen su tiempo de decisión de 14 días a 4 horas."
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: KANBAN */}
        {activeModule === 'KANBAN' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                  Tablero Kanban Interactivo
                </h4>
                <p className="text-xs text-zinc-400">Haz clic en "Avanzar Estado" en cualquier tarjeta para moverla en tiempo real.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setKanbanTasks([
                    { id: 1, title: 'Implementar autenticación passkey', status: 'TODO', points: 3 },
                    { id: 2, title: 'Optimizar prompts con streaming', status: 'IN_PROGRESS', points: 5 },
                    { id: 3, title: 'Diseñar Brand Kit y paleta HSL', status: 'DONE', points: 2 },
                  ])
                }
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((columnKey) => {
                const columnTitle = columnKey === 'TODO' ? 'Por Hacer' : columnKey === 'IN_PROGRESS' ? 'En Progreso' : 'Listo';
                const tasksInCol = kanbanTasks.filter((t) => t.status === columnKey);

                return (
                  <div key={columnKey} className="p-3 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 pb-2 border-b border-white/[0.06]">
                      <span>{columnTitle}</span>
                      <span className="text-[10px] font-mono bg-zinc-900 px-1.5 py-0.2 rounded text-zinc-400">
                        {tasksInCol.length}
                      </span>
                    </div>

                    <div className="space-y-2 min-h-[140px]">
                      {tasksInCol.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg bg-zinc-900 border border-white/[0.06] shadow-sm space-y-2 hover:border-emerald-500/40 transition-colors"
                        >
                          <div className="text-xs font-medium text-white">{task.title}</div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-mono text-zinc-500">{task.points} pts</span>
                            <button
                              type="button"
                              onClick={() => advanceTask(task.id)}
                              className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                            >
                              Avanzar →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: BRAND STUDIO */}
        {activeModule === 'BRAND' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-orange-400" />
                  AI Content Studio con Predicción de Impacto
                </h4>
                <p className="text-xs text-zinc-400">Cambia el tono de voz de marca y observa la adaptación en vivo.</p>
              </div>

              {/* Tone Switcher */}
              <div className="flex gap-2">
                {[
                  { key: 'INNOVATIVE', label: 'Visionario' },
                  { key: 'TECHNICAL', label: 'Técnico' },
                  { key: 'BOLD', label: 'Audaz' },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setBrandTone(t.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      brandTone === t.key
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-zinc-900/60 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Post Card Preview */}
            <div className="p-5 rounded-2xl bg-zinc-950/70 border border-orange-500/20 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-400 font-mono">LinkedIn / Twitter Proposal</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-zinc-400">Viralidad: <strong className="text-emerald-400">{post.virality}/100</strong></span>
                  <span className="text-zinc-400">Alcance: <strong className="text-zinc-200">{post.reach}</strong></span>
                </div>
              </div>
              <h5 className="text-sm font-bold text-white">{post.title}</h5>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">{post.text}</p>
            </div>
          </div>
        )}

        {/* Footer of the module card */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <span>Todos los módulos se comunican en tiempo real compartiendo el contexto de tu negocio.</span>
          <a href="#pricing" className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1">
            Ver planes disponibles <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
