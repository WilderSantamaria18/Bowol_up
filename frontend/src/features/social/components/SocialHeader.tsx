import React from 'react';
import { Share2, Sparkles, Plus, Palette, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SocialHeaderProps {
  activeTab: 'feed' | 'brand';
  onTabChange: (tab: 'feed' | 'brand') => void;
  onOpenAIModal: () => void;
  onOpenCreateModal: () => void;
  postCount?: number;
}

export const SocialHeader: React.FC<SocialHeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAIModal,
  onOpenCreateModal,
  postCount = 0,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-md">
            <Share2 className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Social & Brand Intelligence
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">
                Fase 11
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Manual de identidad corporativa, redacción multicanal con IA y estimación de impacto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCreateModal}
            className="text-xs h-8 px-3 gap-1.5 border-white/[0.08] hover:border-white/[0.15]"
          >
            <Plus className="w-4 h-4 text-current" strokeWidth={1.5} />
            Nueva Publicación
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={onOpenAIModal}
            className="text-xs h-8 px-3 gap-1.5 shadow-sm hover:shadow-orange-500/20 shadow-orange-600/30"
          >
            <Sparkles className="w-4 h-4 text-current" strokeWidth={1.5} />
            Generar con IA (Studio)
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-1">
        <button
          onClick={() => onTabChange('feed')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'feed'
              ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
          }`}
        >
          <Newspaper className="w-4 h-4" strokeWidth={1.5} />
          <span>Feed de Publicaciones</span>
          {postCount > 0 && (
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08] text-zinc-300">
              {postCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('brand')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'brand'
              ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
          }`}
        >
          <Palette className="w-4 h-4" strokeWidth={1.5} />
          <span>Kit de Marca (Brand Profile)</span>
        </button>
      </div>
    </div>
  );
};
