import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  TrendingUp, 
  Grid2X2, 
  Lightbulb, 
  FlaskConical, 
  FolderKanban,
  CheckSquare, 
  Repeat, 
  Calendar, 
  Share2, 
  BarChart3, 
  Building2, 
  CreditCard, 
  Shield, 
  Settings, 
  Sparkles, 
  Sun, 
  Moon, 
  Copy, 
  Check, 
  CornerDownLeft, 
  ArrowUp, 
  ArrowDown, 
  X,
  type LucideIcon 
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCopilot } from '@/features/copilot/context/CopilotContext';

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'Navegación' | 'Acciones Rápidas' | 'Sistema';
  icon: LucideIcon;
  keywords?: string[];
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { openCopilot } = useCopilot();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Command items definition
  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Cockpit Ejecutivo',
      description: 'Panel de control con métricas y resumen de innovación',
      category: 'Navegación',
      icon: BarChart3,
      keywords: ['dashboard', 'cockpit', 'resumen', 'métricas', 'kpi'],
      action: () => { navigate('/dashboard'); onClose(); },
      shortcut: 'G D'
    },
    {
      id: 'nav-trends',
      title: 'Radar de Tendencias',
      description: 'Explorador multi-fuente de señales de mercado',
      category: 'Navegación',
      icon: TrendingUp,
      keywords: ['tendencias', 'trends', 'radar', 'mercado', 'github', 'youtube'],
      action: () => { navigate('/trends'); onClose(); },
      shortcut: 'G T'
    },
    {
      id: 'nav-swot',
      title: 'Matriz FODA',
      description: 'Cuadrantes estratégicos con evidencias contextuales',
      category: 'Navegación',
      icon: Grid2X2,
      keywords: ['foda', 'swot', 'fortalezas', 'debilidades', 'oportunidades', 'amenazas'],
      action: () => { navigate('/swot'); onClose(); },
      shortcut: 'G F'
    },
    {
      id: 'nav-opportunities',
      title: 'Oportunidades & RICE',
      description: 'Priorización cuantitativa Reach, Impact, Confidence, Effort',
      category: 'Navegación',
      icon: Lightbulb,
      keywords: ['oportunidades', 'rice', 'priorización', 'score'],
      action: () => { navigate('/opportunities'); onClose(); },
      shortcut: 'G O'
    },
    {
      id: 'nav-hypotheses',
      title: 'Experimentación & Hipótesis',
      description: 'Validación empírica y seguimiento de métricas',
      category: 'Navegación',
      icon: FlaskConical,
      keywords: ['hipótesis', 'experimentos', 'validación', 'lean'],
      action: () => { navigate('/hypotheses'); onClose(); },
      shortcut: 'G H'
    },
    {
      id: 'nav-projects',
      title: 'Iniciativas & Proyectos',
      description: 'Cartera estratégica, épicas y descomposición ágil con IA',
      category: 'Navegación',
      icon: FolderKanban,
      keywords: ['proyectos', 'projects', 'iniciativas', 'épicas', 'portfolio'],
      action: () => { navigate('/projects'); onClose(); },
      shortcut: 'G P'
    },
    {
      id: 'nav-tasks',
      title: 'Tablero Kanban & Backlog',
      description: 'Gestión de flujo de trabajo ágil y tareas',
      category: 'Navegación',
      icon: CheckSquare,
      keywords: ['tareas', 'tasks', 'kanban', 'backlog', 'todo'],
      action: () => { navigate('/tasks'); onClose(); },
      shortcut: 'G K'
    },
    {
      id: 'nav-sprints',
      title: 'Sprints de Innovación',
      description: 'Ciclos de entrega ágiles y estimación de Story Points',
      category: 'Navegación',
      icon: Repeat,
      keywords: ['sprints', 'ágil', 'burndown', 'velocidad'],
      action: () => { navigate('/sprints'); onClose(); },
      shortcut: 'G S'
    },
    {
      id: 'nav-calendar',
      title: 'Calendario Estratégico',
      description: 'Hitos, sincronización iCal y entregables clave',
      category: 'Navegación',
      icon: Calendar,
      keywords: ['calendario', 'fechas', 'eventos', 'ics', 'hitos'],
      action: () => { navigate('/calendar'); onClose(); },
      shortcut: 'G C'
    },
    {
      id: 'nav-social',
      title: 'Brand & Social Studio',
      description: 'Identidad de marca y generación asistida de contenido',
      category: 'Navegación',
      icon: Share2,
      keywords: ['social', 'redes', 'marca', 'brand', 'linkedin', 'twitter'],
      action: () => { navigate('/social'); onClose(); },
      shortcut: 'G B'
    },
    {
      id: 'nav-profile',
      title: 'Business Profile',
      description: 'Perfil corporativo, modelo de negocio y audiencia objetivo',
      category: 'Navegación',
      icon: Building2,
      keywords: ['perfil', 'empresa', 'negocio', 'audiencia', 'modelo'],
      action: () => { navigate('/business-profile'); onClose(); },
      shortcut: 'G P'
    },
    {
      id: 'nav-billing',
      title: 'Suscripción & Facturación',
      description: 'Planes SaaS, historial de pagos y cuota de créditos IA',
      category: 'Navegación',
      icon: CreditCard,
      keywords: ['billing', 'facturación', 'suscripción', 'créditos', 'planes'],
      action: () => { navigate('/billing'); onClose(); },
      shortcut: 'G $'
    },
    {
      id: 'nav-audit',
      title: 'Auditoría Forense & Logs',
      description: 'Registro inmutable SOC 2, trazabilidad y cumplimiento',
      category: 'Navegación',
      icon: Shield,
      keywords: ['auditoría', 'audit', 'logs', 'seguridad', 'cumplimiento', 'soc2'],
      action: () => { navigate('/audit-logs'); onClose(); },
      shortcut: 'G A'
    },
    {
      id: 'nav-settings',
      title: 'Ajustes de Organización & SSO',
      description: 'Configuración general, miembros de equipo y SSO corporativo',
      category: 'Navegación',
      icon: Settings,
      keywords: ['ajustes', 'settings', 'organización', 'sso', 'miembros'],
      action: () => { navigate('/settings'); onClose(); },
      shortcut: 'G ,'
    },

    // Quick Actions
    {
      id: 'act-copilot',
      title: 'Abrir AI Copilot Estratégico',
      description: 'Consultar al asistente de IA con contexto integral del negocio',
      category: 'Acciones Rápidas',
      icon: Sparkles,
      keywords: ['copilot', 'ia', 'asistente', 'chat', 'inteligencia'],
      action: () => {
        onClose();
        openCopilot({ contextType: 'GENERAL', title: 'Asistente Estratégico' });
      },
      shortcut: '⌘J'
    },
    {
      id: 'act-copy-link',
      title: copiedLink ? '¡Enlace copiado al portapapeles!' : 'Copiar Enlace de Workspace',
      description: 'Compartir la URL de acceso directo a la organización',
      category: 'Acciones Rápidas',
      icon: copiedLink ? Check : Copy,
      keywords: ['copiar', 'enlace', 'link', 'compartir', 'workspace'],
      action: () => {
        navigator.clipboard.writeText(window.location.origin);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    },
    {
      id: 'act-theme',
      title: resolvedTheme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro',
      description: 'Alternar entre la paleta Liquid Glass diurna o nocturna',
      category: 'Sistema',
      icon: resolvedTheme === 'dark' ? Sun : Moon,
      keywords: ['tema', 'oscuro', 'claro', 'modo', 'dark', 'light'],
      action: () => {
        toggleTheme();
        onClose();
      }
    }
  ], [navigate, onClose, openCopilot, resolvedTheme, toggleTheme, copiedLink]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchKeywords = item.keywords?.some(k => k.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchCategory || matchKeywords;
    });
  }, [commands, query]);

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Paleta de comandos"
    >
      <div 
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white/95 dark:bg-[#0c0c0e]/95 border border-zinc-200/90 dark:border-white/10 shadow-2xl backdrop-blur-2xl transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-zinc-200/80 dark:border-white/10 h-14 gap-3">
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Escribe un comando o busca un módulo..."
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
            aria-autocomplete="list"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label="Borrar búsqueda"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
              <p className="font-medium">No se encontraron resultados para &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">Prueba con palabras como &ldquo;tendencias&rdquo;, &ldquo;foda&rdquo;, &ldquo;tareas&rdquo; o &ldquo;tema&rdquo;.</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = cmd.icon;

              return (
                <div
                  key={cmd.id}
                  data-selected={isSelected}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition-colors duration-100 ${
                    isSelected 
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/25' 
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-white/[0.04] border border-transparent'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                      isSelected 
                        ? 'bg-orange-500/20 text-orange-600 dark:text-orange-300' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}>
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {cmd.title}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {cmd.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80">
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-700">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-950/60 border-t border-zinc-200/80 dark:border-white/10 text-[11px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" strokeWidth={1.5} />
              <ArrowDown className="w-3 h-3" strokeWidth={1.5} />
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" strokeWidth={1.5} />
              <span>Ejecutar</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="font-mono text-[10px]">ESC</kbd>
              <span>Cerrar</span>
            </span>
          </div>
          <span className="font-mono text-[10px] text-orange-600 dark:text-orange-400 font-medium">
            BOWOL Command v1.0
          </span>
        </div>
      </div>
    </div>
  );
};
