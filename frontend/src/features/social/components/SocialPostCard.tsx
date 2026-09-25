import React, { useState } from 'react';
import { SocialPost, SocialChannel } from '../types';
import {
  Share2,
  Twitter,
  Linkedin,
  Instagram,
  FileText,
  Mail,
  TrendingUp,
  Clock,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  Flame,
  BarChart2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SocialPostCardProps {
  post: SocialPost;
  onPublish: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const SocialPostCard: React.FC<SocialPostCardProps> = ({
  post,
  onPublish,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(post.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish(post.id);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(post.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const getChannelConfig = (channel: SocialChannel) => {
    switch (channel) {
      case 'LINKEDIN':
        return {
          label: 'LinkedIn',
          icon: Linkedin,
          badgeColor: 'bg-[#0A66C2]/15 text-[#3b82f6] border-[#0A66C2]/30',
        };
      case 'TWITTER_X':
        return {
          label: 'Twitter / X',
          icon: Twitter,
          badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        };
      case 'INSTAGRAM':
        return {
          label: 'Instagram',
          icon: Instagram,
          badgeColor: 'bg-pink-600/15 text-pink-400 border-pink-500/30',
        };
      case 'BLOG':
        return {
          label: 'Blog / Web',
          icon: FileText,
          badgeColor: 'bg-emerald-600/15 text-emerald-400 border-emerald-500/30',
        };
      case 'NEWSLETTER':
        return {
          label: 'Newsletter',
          icon: Mail,
          badgeColor: 'bg-purple-600/15 text-purple-400 border-purple-500/30',
        };
      default:
        return {
          label: 'Social',
          icon: Share2,
          badgeColor: 'bg-orange-600/15 text-orange-400 border-orange-500/30',
        };
    }
  };

  const channelConfig = getChannelConfig(post.channel);
  const ChannelIcon = channelConfig.icon;
  const impact = post.predictedImpact;

  return (
    <div className="rounded-2xl bg-surface-subtle border border-white/[0.08] hover:border-white/[0.14] transition-all p-5 space-y-4 shadow-xl backdrop-blur-md flex flex-col justify-between">
      {/* Top Meta Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${channelConfig.badgeColor}`}
            >
              <ChannelIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
              {channelConfig.label}
            </span>

            {post.status === 'PUBLISHED' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Publicado
              </span>
            )}
            {post.status === 'SCHEDULED' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Clock className="w-3 h-3" />
                Programado
              </span>
            )}
            {post.status === 'DRAFT' && (
              <span className="inline-flex items-center text-[11px] font-medium text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full border border-white/[0.06]">
                Borrador
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Copiar texto"
              aria-label="Copiar texto"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" strokeWidth={1.5} />}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Eliminar publicación"
              aria-label="Eliminar publicación"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Title & Copy */}
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight line-clamp-1">
            {post.title}
          </h3>
          <p className="text-xs text-zinc-300 mt-2 whitespace-pre-wrap line-clamp-4 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/[0.04]">
            {post.content}
          </p>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.04]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Predicted Impact Section */}
      {impact && (
        <div className="pt-3 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
            <span className="flex items-center gap-1.5 text-orange-400">
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} />
              Impacto Predictivo
            </span>
            {impact.bestTimeToPost && (
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {impact.bestTimeToPost}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-black/25 border border-white/[0.04]">
              <span className="block text-[10px] text-zinc-500">Alcance Est.</span>
              <span className="text-xs font-bold text-zinc-200">
                {(impact.reachEstimateMin / 1000).toFixed(1)}k - {(impact.reachEstimateMax / 1000).toFixed(1)}k
              </span>
            </div>

            <div className="p-2 rounded-lg bg-black/25 border border-white/[0.04]">
              <span className="block text-[10px] text-zinc-500">Engagement</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-0.5">
                <BarChart2 className="w-3 h-3" />
                {impact.engagementRate}%
              </span>
            </div>

            <div className="p-2 rounded-lg bg-black/25 border border-white/[0.04]">
              <span className="block text-[10px] text-zinc-500">Viralidad</span>
              <span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-0.5">
                <Flame className="w-3 h-3" />
                {impact.viralityScore}/100
              </span>
            </div>
          </div>

          {impact.strategicReasoning && (
            <p className="text-[11px] text-zinc-400 italic bg-white/[0.02] p-2 rounded-lg border border-white/[0.04] line-clamp-2">
              &quot;{impact.strategicReasoning}&quot;
            </p>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/[0.06]">
        <span className="text-[11px] text-zinc-500">
          {new Date(post.createdAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>

        {post.status !== 'PUBLISHED' ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isPublishing}
            onClick={handlePublish}
            className="text-xs h-7 px-3 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {isPublishing ? 'Publicando...' : 'Marcar Publicado'}
          </Button>
        ) : (
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <Check className="w-3.5 h-3.5" />
            En línea
          </span>
        )}
      </div>
    </div>
  );
};
