import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  TrendingUp, 
  Lightbulb, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  Building2,
  LogOut,
  User as UserIcon,
  Grid2X2,
  FlaskConical,
  Repeat,
  Calendar,
  Share2,
  CreditCard,
  Target,
  Layers,
  Menu,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { NavDropdown, NavDropdownItem } from './NavDropdown';
import { MobileNavDrawer } from './MobileNavDrawer';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCopilot } from '@/features/copilot/context/CopilotContext';
import { CopilotDrawer } from '@/features/copilot/components/CopilotDrawer';
import { CopilotFloatingTrigger } from '@/features/copilot/components/CopilotFloatingTrigger';

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const { user, organization, isAuthenticated, logout } = useAuth();
  const { openCopilot } = useCopilot();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Group 1: Estrategia & Radar
  const strategyItems: NavDropdownItem[] = [
    {
      label: 'Radar de Tendencias',
      description: 'Detección continua de señales de mercado con IA',
      path: '/trends',
      icon: TrendingUp,
      iconColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    },
    {
      label: 'Matriz FODA',
      description: 'Análisis estratégico contextual con evidencias',
      path: '/swot',
      icon: Grid2X2,
      iconColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    },
    {
      label: 'Oportunidades & RICE',
      description: 'Priorización cuantitativa de alto impacto',
      path: '/opportunities',
      icon: Lightbulb,
      iconColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    },
    {
      label: 'Experimentación & Hipótesis',
      description: 'Validación empírica y métricas de éxito',
      path: '/hypotheses',
      icon: FlaskConical,
      iconColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    },
  ];

  // Group 2: Ejecución Ágil
  const executionItems: NavDropdownItem[] = [
    {
      label: 'Tablero Kanban',
      description: 'Flujo de tareas de alta velocidad y backlog',
      path: '/tasks',
      icon: CheckSquare,
      iconColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    },
    {
      label: 'Sprints de Innovación',
      description: 'Ciclos de entrega y burndown predictivo',
      path: '/sprints',
      icon: Repeat,
      iconColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    },
    {
      label: 'Calendario Estratégico',
      description: 'Hitos, entregables y sincronización .ics',
      path: '/calendar',
      icon: Calendar,
      iconColor: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    },
  ];

  const standaloneLinks = [
    { label: 'Brand & Social', path: '/social', icon: Share2 },
    { label: 'Cockpit Ejecutivo', path: '/dashboard', icon: BarChart3 },
    { label: 'Business Profile', path: '/business-profile', icon: Building2 },
  ];

  const mobileNavGroups = [
    { label: 'Estrategia & Radar', items: strategyItems },
    { label: 'Ejecución Ágil', items: executionItems },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#08080A]">
      {/* Header with Liquid Glass styling */}
      <header className="sticky top-0 z-40 liquid-glass border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Minimalist Logo */}
            <BrandLogo size="md" asLink to="/" />

            {/* Desktop Navigation Dropdowns */}
            {isAuthenticated ? (
              <nav className="hidden md:flex items-center gap-1.5 ml-2">
                <NavDropdown
                  label="Estrategia & Radar"
                  icon={Target}
                  items={strategyItems}
                />
                <NavDropdown
                  label="Ejecución Ágil"
                  icon={Layers}
                  items={executionItems}
                />
                <Link
                  to="/social"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    location.pathname.startsWith('/social')
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Marca & Redes
                </Link>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    location.pathname.startsWith('/dashboard')
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Cockpit
                </Link>
              </nav>
            ) : (
              <nav className="hidden md:flex items-center gap-6 ml-4 text-xs font-medium text-zinc-400">
                <a href="#features" className="hover:text-white transition-colors">
                  Características
                </a>
                <a href="#workflow" className="hover:text-white transition-colors">
                  Cómo Funciona
                </a>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Planes & Precios
                </a>
              </nav>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2 mr-1">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-zinc-200 block leading-tight">{user?.name}</span>
                    <span className="text-[10px] text-zinc-500 truncate max-w-[120px] block">
                      {organization?.name || 'Workspace'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xs font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                </div>

                {/* Billing Link */}
                <Link to="/billing">
                  <Button variant="ghost" size="icon" aria-label="Suscripción y Facturación" title="Suscripción y Créditos">
                    <CreditCard className="w-4 h-4 text-zinc-400 hover:text-orange-400 transition-colors" strokeWidth={1.5} />
                  </Button>
                </Link>

                {/* Settings Link */}
                <Link to="/settings">
                  <Button variant="ghost" size="icon" aria-label="Ajustes de Organización" title="Ajustes">
                    <Settings className="w-4 h-4 text-zinc-400 hover:text-white transition-colors" strokeWidth={1.5} />
                  </Button>
                </Link>

                {/* Audit Logs Link */}
                <Link to="/audit-logs">
                  <Button variant="ghost" size="icon" aria-label="Auditoría Empresarial" title="Auditoría & Compliance">
                    <Shield className="w-4 h-4 text-zinc-400 hover:text-emerald-400 transition-colors" strokeWidth={1.5} />
                  </Button>
                </Link>

                {/* AI Copilot */}
                <Button
                  variant="glass"
                  size="sm"
                  leftIcon={Sparkles}
                  onClick={() => openCopilot({ contextType: 'GENERAL' })}
                  className="border-orange-500/30 hover:border-orange-500/60 shadow-lg shadow-orange-500/10 text-orange-300"
                  aria-label="Abrir AI Copilot"
                >
                  <span className="hidden sm:inline">AI Copilot</span>
                </Button>

                {/* Logout */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4 text-zinc-400 hover:text-rose-400 transition-colors" strokeWidth={1.5} />
                </Button>

                {/* Mobile Hamburger Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] md:hidden transition-colors"
                  aria-label="Abrir menú"
                >
                  <Menu className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="shadow-lg shadow-orange-500/20">
                    Comenzar Gratis
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Strategic Copilot Drawer & Global Floating Trigger */}
      <CopilotDrawer />
      <CopilotFloatingTrigger />

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        groups={mobileNavGroups}
        standaloneLinks={standaloneLinks}
      />

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-zinc-950/40 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" asLink to="/" />
            <span className="text-zinc-600">|</span>
            <span>Operating System for Innovation & Execution</span>
          </div>
          <p>© {new Date().getFullYear()} BOWOL Inc. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
