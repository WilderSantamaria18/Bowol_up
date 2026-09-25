import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, LucideIcon } from 'lucide-react';

export interface NavDropdownItem {
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  iconColor?: string;
}

interface NavDropdownProps {
  label: string;
  icon: LucideIcon;
  items: NavDropdownItem[];
}

export const NavDropdown: React.FC<NavDropdownProps> = ({ label, icon: MainIcon, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCurrentActive = items.some((item) => location.pathname.startsWith(item.path));

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all select-none ${
          isCurrentActive
            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-sm'
            : isOpen
            ? 'bg-white/[0.08] text-white'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
        }`}
        aria-expanded={isOpen}
      >
        <MainIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span>{label}</span>
        <ChevronDown
          className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-orange-400' : ''
          }`}
          strokeWidth={1.5}
        />
      </button>

      {/* Liquid Glass Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl liquid-glass-dropdown p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-orange-500/15 border border-orange-500/30'
                      : 'hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      item.iconColor || 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                    } group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white group-hover:text-orange-300 transition-colors">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-tight mt-0.5 truncate">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
