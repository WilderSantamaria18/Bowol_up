import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  TrendingUp, 
  Lightbulb, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  Layers,
  Building2,
  LogOut,
  User as UserIcon,
  Grid2X2,
  FlaskConical,
  Repeat,
  Calendar,
  Share2,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCopilot } from '@/features/copilot/context/CopilotContext';
import { CopilotDrawer } from '@/features/copilot/components/CopilotDrawer';
import { CopilotFloatingTrigger } from '@/features/copilot/components/CopilotFloatingTrigger';

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const { user, organization, isAuthenticated, logout } = useAuth();
  const { openCopilot } = useCopilot();

  const navItems = [
    { label: 'Business Profile', path: '/business-profile', icon: Building2 },
    { label: 'Intelligence', path: '/trends', icon: TrendingUp },
    { label: 'FODA / SWOT', path: '/swot', icon: Grid2X2 },
    { label: 'Strategy', path: '/opportunities', icon: Lightbulb },
    { label: 'Experimentation', path: '/hypotheses', icon: FlaskConical },
    { label: 'Execution', path: '/tasks', icon: CheckSquare },
    { label: 'Sprints', path: '/sprints', icon: Repeat },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Brand & Social', path: '/social', icon: Share2 },
    { label: 'Analytics', path: '/dashboard', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0C]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                BOWOL<span className="text-orange-500">.</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-white/[0.08] text-orange-400'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-zinc-200">{user?.name}</span>
                  <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">
                    {organization?.name || 'Workspace'}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4 text-zinc-400 hover:text-rose-400 transition-colors" strokeWidth={1.5} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            <Link to="/billing">
              <Button variant="ghost" size="icon" aria-label="Suscripción y Facturación" title="Suscripción y Facturación">
                <CreditCard className="w-4 h-4 text-zinc-400 hover:text-orange-400 transition-colors" strokeWidth={1.5} />
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="icon" aria-label="Ajustes">
                <Settings className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
              </Button>
            </Link>
            <Button
              variant="glass"
              size="sm"
              leftIcon={Sparkles}
              onClick={() => openCopilot({ contextType: 'GENERAL' })}
              aria-label="Abrir AI Copilot"
            >
              AI Copilot
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Strategic Copilot Drawer & Global Trigger */}
      <CopilotDrawer />
      <CopilotFloatingTrigger />

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-6 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4">
          BOWOL Platform — Operating System for Innovation & Execution
        </div>
      </footer>
    </div>
  );
};
