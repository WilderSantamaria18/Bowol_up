import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LogOut, Settings, CreditCard, Sparkles, Building2 } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { NavDropdownItem } from './NavDropdown';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCopilot } from '@/features/copilot/context/CopilotContext';

interface NavGroup {
  label: string;
  items: NavDropdownItem[];
}

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  groups: NavGroup[];
  standaloneLinks: { label: string; path: string; icon: React.ElementType }[];
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  groups,
  standaloneLinks,
}) => {
  const location = useLocation();
  const { user, organization, logout } = useAuth();
  const { openCopilot } = useCopilot();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs liquid-glass-dropdown border-r border-zinc-800 p-5 overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <BrandLogo size="sm" asLink to="/" />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Org & User Card */}
          {user && (
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{user.name}</div>
                  <div className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-zinc-500 shrink-0" />
                    {organization?.name || 'Workspace'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Copilot Action */}
          <button
            type="button"
            onClick={() => {
              onClose();
              openCopilot({ contextType: 'GENERAL' });
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold shadow-md shadow-orange-500/20"
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            Abrir AI Copilot
          </button>

          {/* Navigation Groups */}
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.label} className="space-y-1.5">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 px-2">
                  {group.label}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                            : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Standalone Links */}
            <div className="space-y-1 pt-2 border-t border-zinc-800/80">
              {standaloneLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                        : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-2 mt-6">
          <Link
            to="/billing"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <CreditCard className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
            <span>Suscripción y Créditos</span>
          </Link>

          <Link
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <Settings className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <span>Ajustes de Organización</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
