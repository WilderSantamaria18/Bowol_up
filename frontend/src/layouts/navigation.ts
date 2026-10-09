import {
  BarChart3,
  Building2,
  Calendar,
  CheckSquare,
  CreditCard,
  FlaskConical,
  FolderKanban,
  Grid2X2,
  Lightbulb,
  LucideIcon,
  Palette,
  Repeat,
  Settings,
  Shield,
  Share2,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { Tone } from '@/components/ui/tones';

export interface NavItem {
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
  tone: Tone;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/**
 * Fuente única de la navegación autenticada: la consumen el sidebar de escritorio,
 * el menú móvil y (a futuro) la paleta de comandos.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'Resumen',
    items: [
      { label: 'Cockpit Ejecutivo', description: 'Salud del negocio y resumen del día', path: '/dashboard', icon: BarChart3, tone: 'blue' },
    ],
  },
  {
    id: 'intelligence',
    label: 'Inteligencia & Estrategia',
    items: [
      { label: 'Radar de Tendencias', description: 'Detección continua de señales multi-fuente', path: '/trends', icon: TrendingUp, tone: 'sky' },
      { label: 'FODA & Diagnóstico', description: 'Fase 1 · FODA con evidencias y auditoría de rutinas', path: '/swot', icon: Grid2X2, tone: 'violet' },
      { label: 'Oportunidades & RICE', description: 'Fase 4 · Priorización RICE ordinal y habilitadoras', path: '/opportunities', icon: Lightbulb, tone: 'amber' },
      { label: 'Experimentación', description: 'Hipótesis, validación empírica y aprendizaje', path: '/hypotheses', icon: FlaskConical, tone: 'emerald' },
    ],
  },
  {
    id: 'execution',
    label: 'Planificación & Ejecución',
    items: [
      { label: 'Planificador BOWOL', description: 'Fase 5 · Capacidad con reserva 20% y prompts', path: '/planning', icon: Target, tone: 'orange' },
      { label: 'Iniciativas & Proyectos', description: 'Fase 2 y 3 · Ficha SMART y desglose WBS < 6h', path: '/projects', icon: FolderKanban, tone: 'orange' },
      { label: 'Tablero Kanban', description: 'Fase 5 y 6 · Límite WIP ≤ 1, check-in diario y puerta DONE', path: '/tasks', icon: CheckSquare, tone: 'emerald' },
      { label: 'Sprints', description: 'Ciclos de entrega y burndown predictivo', path: '/sprints', icon: Repeat, tone: 'rose' },
      { label: 'Calendario', description: 'Hitos, entregables y sincronización .ics', path: '/calendar', icon: Calendar, tone: 'sky' },
    ],
  },
  {
    id: 'brand',
    label: 'Marca',
    items: [
      { label: 'Manual de Marca', description: 'Identidad, voz editorial y directrices para IA', path: '/brand', icon: Palette, tone: 'rose' },
      { label: 'Social Studio', description: 'Generación asistida de posts y análisis de impacto', path: '/social', icon: Share2, tone: 'indigo' },
    ],
  },
  {
    id: 'organization',
    label: 'Organización',
    items: [
      { label: 'Perfil del Negocio', description: 'Contexto que alimenta a BowolAI', path: '/business-profile', icon: Building2, tone: 'zinc' },
      { label: 'Facturación', description: 'Plan, créditos de IA y facturas', path: '/billing', icon: CreditCard, tone: 'emerald' },
      { label: 'Auditoría', description: 'Trazabilidad y cumplimiento', path: '/audit-logs', icon: Shield, tone: 'zinc' },
      { label: 'Ajustes', description: 'Miembros, roles y SSO', path: '/settings', icon: Settings, tone: 'zinc' },
    ],
  },
];

/** ¿La ruta actual pertenece a este elemento? (`/tasks` también activa `/tasks/…`). */
export function isNavActive(pathname: string, itemPath: string): boolean {
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}
