import React, { useState } from 'react';
import { CreateSocialPostPayload, SocialChannel, SocialPostStatus } from '../types';
import { X, Send, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CreateSocialPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSocialPostPayload) => Promise<void>;
  isSubmitting?: boolean;
}

export const CreateSocialPostModal: React.FC<CreateSocialPostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [channel, setChannel] = useState<SocialChannel>('LINKEDIN');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<SocialPostStatus>('DRAFT');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    await onSubmit({
      channel,
      title: title.trim(),
      content: content.trim(),
      status,
      tags,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F0F12] border border-white/[0.1] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Send className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Nueva Publicación</h2>
              <p className="text-xs text-zinc-400">Redacta una publicación manual para tus canales</p>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Canal Destino
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as SocialChannel)}
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
              >
                <option value="LINKEDIN">LinkedIn</option>
                <option value="TWITTER_X">Twitter / X</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="BLOG">Blog Corporativo</option>
                <option value="NEWSLETTER">Newsletter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Estado Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SocialPostStatus)}
                className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
              >
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Título o Asunto *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="p. ej. Reflexiones sobre la escalabilidad con IA"
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Cuerpo / Copy de la Publicación *
            </label>
            <textarea
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el texto de tu publicación aquí..."
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Hashtags / Tags (separados por coma)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Innovacion, AI, TechLead, Growth"
              className="w-full bg-surface-subtle border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="gap-1.5 shadow-lg shadow-orange-600/20"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Guardando...' : 'Crear Publicación'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
