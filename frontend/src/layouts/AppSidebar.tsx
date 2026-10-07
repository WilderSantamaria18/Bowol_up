import React, { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, PanelLeftClose, PanelLeftOpen, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONES } from '@/components/ui/tones';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { BowolVectorLogo } from '@/components/ui/BowolVectorLogo';
import { NAV_GROUPS, NavItem, isNavActive } from './navigation';

export const SIDEBAR_WIDTH = { expanded: 272, collapsed: 84 } as const;
const STORAGE_KEY = 'bowol_sidebar_collapsed';

/** Estado plegado/expandido del sidebar, persistido por persona (localStorage opcional). */
export function useSidebarCollapsed(): [boolean, (value: boolean) => void] {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const update = useCallback((value: boolean) => {
    setCollapsed(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {
      /* almacenamiento no disponible: solo se pierde la preferencia */
    }
  }, []);

  return [collapsed, update];
}

interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, collapsed, active }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : item.description}
      className={cn(
        'group relative flex items-center gap-3 rounded-[14px] outline-none transition-colors duration-200',
        'focus-visible:ring-2 focus-visible:ring-orange-500/60',
        collapsed ? 'mx-auto h-11 w-11 justify-center' : 'px-2.5 py-[7px]',
        active
          ? 'bg-zinc-900/[0.075] shadow-[inset_0_0_0_0.5px_rgba(9,9,11,0.06)] dark:bg-white/[0.11] dark:shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.08)]'
          : 'hover:bg-zinc-900/[0.045] dark:hover:bg-white/[0.06]',
      )}
    >
      <span className={cn(TONES[item.tone].ios, 'h-[30px] w-[30px] shrink-0 transition-transform duration-200 group-hover:scale-105')}>
        <Icon className="h-[17px] w-[17px]" strokeWidth={1.9} />
      </span>
      {!collapsed && (
        <span
          className={cn(
            'truncate text-[13.5px] tracking-[-0.01em]',
            active ? 'font-semibold text-zinc-950 dark:text-white' : 'font-medium text-zinc-700 dark:text-zinc-300',
          )}
        >
          {item.label}
        </span>
      )}
    </Link>
  );
};

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  userName?: string;
  organizationName?: string;
  onOpenCommandPalette: () => void;
  onOpenAssistant: () => void;
  onLogout: () => void;
}

/**
 * Sidebar de escritorio: panel flotante de cristal (estilo iOS) con los módulos agrupados por fase,
 * acceso a BowolAI, buscador de comandos y tarjeta de usuario. Plegable a un riel de iconos.
 */
export const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  onToggleCollapsed,
  userName,
  organizationName,
  onOpenCommandPalette,
  onOpenAssistant,
  onLogout,
}) => {
  const { pathname } = useLocation();
  const width = collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded;
  const initial = userName?.trim().charAt(0).toUpperCase() || 'B';

  return (
    <aside
      aria-label="Navegación principal"
      data-testid="app-sidebar"
      data-collapsed={collapsed}
      style={{ width }}
      className="ios-glass fixed bottom-3 left-3 top-3 z-40 hidden flex-col overflow-hidden rounded-[28px] transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:flex"
    >
      {/* Cabecera: marca + plegar */}
      <div className={cn('flex items-center px-4 pb-2 pt-4', collapsed ? 'flex-col gap-3' : 'justify-between')}>
        {collapsed ? (
          <Link to="/dashboard" aria-label="BOWOL · inicio">
            <BowolVectorLogo variant="emblem" size="md" />
          </Link>
        ) : (
          <BrandLogo size="md" asLink to="/dashboard" />
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
          aria-expanded={!collapsed}
          className="rounded-lg p-1.5 text-zinc-500 outline-none transition-colors hover:bg-zinc-900/[0.06] hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-orange-500/60 dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
        >
          {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.6} /> : <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.6} />}
        </button>
      </div>

      {/* Buscador de comandos */}
      <div className={cn('pb-2', collapsed ? 'px-0' : 'px-3')}>
        <button
          type="button"
          onClick={onOpenCommandPalette}
          aria-label="Buscar módulos y acciones (⌘K)"
          title="Buscar módulos y acciones (⌘K)"
          className={cn(
            'flex items-center gap-2 rounded-[12px] text-[13px] text-zinc-500 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-orange-500/60 dark:text-zinc-400',
            'bg-zinc-900/[0.055] hover:bg-zinc-900/[0.08] dark:bg-white/[0.07] dark:hover:bg-white/[0.1]',
            collapsed ? 'mx-auto h-11 w-11 justify-center' : 'w-full px-3 py-2',
          )}
        >
          <Search className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Buscar</span>
              <kbd className="rounded-md bg-zinc-900/[0.07] px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:bg-white/[0.1] dark:text-zinc-400">⌘K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Módulos */}
      <nav aria-label="Módulos" className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_GROUPS.map((group, index) => (
          <div key={group.id} role="group" aria-label={group.label}>
            {collapsed ? (
              index > 0 && <div className="mx-4 mb-2 h-px bg-zinc-900/[0.08] dark:bg-white/[0.08]" />
            ) : (
              <p className="mb-1 px-3 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-zinc-500 dark:text-zinc-500">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarItem key={item.path} item={item} collapsed={collapsed} active={isNavActive(pathname, item.path)} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Pie: BowolAI + usuario */}
      <div className="space-y-2 p-2.5">
        <button
          type="button"
          onClick={onOpenAssistant}
          aria-label="Abrir BowolAI"
          title="Abrir BowolAI"
          className={cn(
            'group relative flex items-center gap-3 overflow-hidden rounded-[16px] text-left outline-none transition-transform duration-200 hover:scale-[1.015] focus-visible:ring-2 focus-visible:ring-orange-500/70',
            'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_8px_24px_-8px_rgba(234,88,12,0.7),inset_0_1px_0_rgba(255,255,255,0.35)]',
            collapsed ? 'mx-auto h-11 w-11 justify-center' : 'w-full px-3 py-2.5',
          )}
        >
          <Sparkles className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block text-[13.5px] font-semibold leading-tight">BowolAI</span>
              <span className="block truncate text-[11px] leading-tight text-white/80">Tu asistente estratégico</span>
            </span>
          )}
        </button>

        <div
          className={cn(
            'flex items-center gap-2.5 rounded-[16px] bg-zinc-900/[0.045] p-2 dark:bg-white/[0.06]',
            collapsed && 'flex-col bg-transparent p-0 dark:bg-transparent',
          )}
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-sm font-semibold text-white shadow-inner dark:from-zinc-500 dark:to-zinc-700"
          >
            {initial}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold leading-tight text-zinc-900 dark:text-zinc-100">{userName || 'Mi cuenta'}</span>
              <span className="block truncate text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">{organizationName || 'Workspace'}</span>
            </span>
          )}
          <span className={cn('flex items-center', collapsed ? 'flex-col gap-1' : 'gap-0.5')}>
            <ThemeToggle size="sm" />
            <button
              type="button"
              onClick={onLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="rounded-lg p-2 text-zinc-500 outline-none transition-colors hover:bg-rose-500/10 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-orange-500/60 dark:text-zinc-400 dark:hover:text-rose-400"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.7} />
            </button>
          </span>
        </div>
      </div>
    </aside>
  );
};
