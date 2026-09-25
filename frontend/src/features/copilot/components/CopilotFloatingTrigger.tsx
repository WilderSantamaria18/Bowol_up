import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useCopilot } from '../context/CopilotContext';
import { useAuth } from '@/features/auth/context/AuthContext';

export const CopilotFloatingTrigger: React.FC = () => {
  const { isOpen, openCopilot } = useCopilot();
  const { isAuthenticated } = useAuth();

  // Atajo de teclado global: Cmd+K o Ctrl+K para abrir/cerrar Copilot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          // Si está abierto no hacemos nada o dejamos que el drawer maneje su cierre
        } else {
          openCopilot({ contextType: 'GENERAL' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openCopilot]);

  // Solo mostrar si el usuario está autenticado y el drawer no está abierto
  if (!isAuthenticated || isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      <button
        type="button"
        onClick={() => openCopilot({ contextType: 'GENERAL' })}
        aria-label="Abrir Copilot Estratégico"
        className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-orange-600/90 to-amber-600/90 hover:from-orange-500 hover:to-amber-500 text-white shadow-xl shadow-orange-950/60 border border-orange-400/40 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 group-hover:shadow-orange-500/25 cursor-pointer"
      >
        {/* Glow animado de fondo */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 opacity-30 blur-sm group-hover:opacity-75 transition-opacity duration-300 animate-pulse" />

        <div className="relative flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </div>
          <span className="text-xs font-bold tracking-tight">AI Copilot</span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 border border-white/20 text-zinc-200">
            ⌘K
          </span>
        </div>
      </button>
    </div>
  );
};
