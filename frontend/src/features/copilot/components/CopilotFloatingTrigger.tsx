import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useCopilot } from '../context/CopilotContext';
import { useAuth } from '@/features/auth/context/AuthContext';

/**
 * Acceso flotante a BowolAI para pantallas sin sidebar (< lg). En escritorio el sidebar ya lo incluye.
 * Atajo global: ⌘J / Ctrl+J. (⌘K queda reservado para la paleta de comandos.)
 */
export const CopilotFloatingTrigger: React.FC = () => {
  const { isOpen, openCopilot } = useCopilot();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        if (!isOpen) openCopilot({ contextType: 'GENERAL' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openCopilot]);

  if (!isAuthenticated || isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 lg:hidden">
      <button
        type="button"
        onClick={() => openCopilot({ contextType: 'GENERAL' })}
        aria-label="Abrir BowolAI"
        className="flex items-center gap-2 rounded-full bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-2.5 text-white shadow-[0_10px_28px_-8px_rgba(234,88,12,0.75),inset_0_1px_0_rgba(255,255,255,0.3)] outline-none transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-orange-300 active:scale-95"
      >
        <Sparkles className="h-4 w-4" strokeWidth={2} />
        <span className="text-[13px] font-semibold tracking-tight">BowolAI</span>
      </button>
    </div>
  );
};
