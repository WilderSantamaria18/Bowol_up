import React, { useState } from 'react';
import { SocialChannel, SocialPostProposal } from '../types';
import {
  Sparkles,
  X,
  Linkedin,
  Twitter,
  Instagram,
  FileText,
  Mail,
  Check,
  TrendingUp,
  Plus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AIGenerateSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (payload: {
    topic: string;
    channels: SocialChannel[];
    customInstructions?: string;
  }) => Promise<SocialPostProposal[]>;
  onAdoptProposal: (proposal: SocialPostProposal) => Promise<void>;
}

const AVAILABLE_CHANNELS: { value: SocialChannel; label: string; icon: React.FC<any> }[] = [
  { value: 'LINKEDIN', label: 'LinkedIn', icon: Linkedin },
  { value: 'TWITTER_X', label: 'Twitter / X', icon: Twitter },
  { value: 'INSTAGRAM', label: 'Instagram', icon: Instagram },
  { value: 'BLOG', label: 'Blog Corporativo', icon: FileText },
  { value: 'NEWSLETTER', label: 'Newsletter', icon: Mail },
];

export const AIGenerateSocialModal: React.FC<AIGenerateSocialModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  onAdoptProposal,
}) => {
  const [topic, setTopic] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<SocialChannel[]>(['LINKEDIN', 'TWITTER_X']);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposals, setProposals] = useState<SocialPostProposal[]>([]);
  const [adoptedIndices, setAdoptedIndices] = useState<number[]>([]);

  if (!isOpen) return null;

  const toggleChannel = (ch: SocialChannel) => {
    if (selectedChannels.includes(ch)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== ch));
      }
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setProposals([]);
    setAdoptedIndices([]);
    try {
      const results = await onGenerate({
        topic: topic.trim(),
        channels: selectedChannels,
        customInstructions: customInstructions.trim() || undefined,
      });
      setProposals(results || []);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdopt = async (proposal: SocialPostProposal, index: number) => {
    await onAdoptProposal(proposal);
    setAdoptedIndices([...adoptedIndices, index]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-2xl bg-[#0F0F12] border border-white/[0.1] p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Sparkles className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Content Studio</h2>
              <p className="text-xs text-zinc-400">
                Generación multicanal adaptada al Kit de Marca y estimación de impacto
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Tema, Anuncio o Iniciativa Estratégica *
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="p. ej. Lanzamiento de nueva función de IA para optimizar inventarios B2B"
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3.5 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Canales a Generar
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const isSelected = selectedChannels.includes(ch.value);
                return (
                  <button
                    key={ch.value}
                    type="button"
                    onClick={() => toggleChannel(ch.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-orange-600/20 border-orange-500/50 text-orange-300'
                        : 'bg-black/40 border-white/[0.08] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Instrucciones Específicas para la IA (Opcional)
            </label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="p. ej. Enfocar en fundadores de startups, invitar a prueba gratuita, tono enérgico..."
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3.5 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isGenerating || !topic.trim()}
              className="gap-1.5 shadow-lg shadow-orange-600/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redactando y Estimando Impacto...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generar Propuestas con IA
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Proposals List */}
        {proposals.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/[0.08]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Propuestas Generadas ({proposals.length})</span>
              <span className="text-[11px] font-normal text-zinc-500">
                Selecciona las propuestas para añadirlas a tu feed
              </span>
            </h3>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {proposals.map((prop, idx) => {
                const isAdopted = adoptedIndices.includes(idx);
                const impact = prop.predictedImpact;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-surface-subtle border border-white/[0.08] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                          {prop.channel}
                        </span>
                        <h4 className="text-xs font-semibold text-white">{prop.title}</h4>
                      </div>

                      <Button
                        size="sm"
                        variant={isAdopted ? 'outline' : 'primary'}
                        disabled={isAdopted}
                        onClick={() => handleAdopt(prop, idx)}
                        className="text-xs h-7 gap-1"
                      >
                        {isAdopted ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Añadido al Feed
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            Guardar en Borradores
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-zinc-300 bg-black/40 p-3 rounded-lg border border-white/[0.04] whitespace-pre-wrap leading-relaxed">
                      {prop.content}
                    </p>

                    {impact && (
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400 bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
                        <span className="flex items-center gap-1 text-zinc-300">
                          <TrendingUp className="w-3 h-3 text-orange-400" />
                          Alcance: {(impact.reachEstimateMin / 1000).toFixed(1)}k - {(impact.reachEstimateMax / 1000).toFixed(1)}k
                        </span>
                        <span className="text-emerald-400 font-medium">
                          Engagement: {impact.engagementRate}%
                        </span>
                        <span className="text-amber-400 font-medium">
                          Viralidad: {impact.viralityScore}/100
                        </span>
                        {impact.bestTimeToPost && (
                          <span className="text-zinc-500">
                            Mejor hora: {impact.bestTimeToPost}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
