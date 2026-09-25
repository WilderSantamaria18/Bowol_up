import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialService } from '../services/socialService';
import { brandService } from '@/features/brand/services/brandService';
import { SaveBrandProfilePayload } from '@/features/brand/types';
import {
  SocialChannel,
  SocialPostStatus,
  CreateSocialPostPayload,
  SocialPostProposal,
} from '../types';
import { SocialHeader } from '../components/SocialHeader';
import { SocialPostCard } from '../components/SocialPostCard';
import { BrandKitView } from '@/features/brand/components/BrandKitView';
import { AIGenerateSocialModal } from '../components/AIGenerateSocialModal';
import { CreateSocialPostModal } from '../components/CreateSocialPostModal';
import { Loader2, Share2, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const SocialPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'feed' | 'brand'>('feed');
  const [channelFilter, setChannelFilter] = useState<SocialChannel | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<SocialPostStatus | 'ALL'>('ALL');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch posts
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ['social-posts', channelFilter, statusFilter],
    queryFn: () =>
      socialService.getPosts({
        channel: channelFilter === 'ALL' ? undefined : channelFilter,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      }),
  });

  // Fetch brand profile
  const { data: brandProfile, isLoading: isLoadingBrand } = useQuery({
    queryKey: ['brand-profile'],
    queryFn: () => brandService.getBrandProfile(),
  });

  // Save brand mutation
  const saveBrandMutation = useMutation({
    mutationFn: (payload: SaveBrandProfilePayload) => brandService.saveBrandProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-profile'] });
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (payload: CreateSocialPostPayload) => socialService.createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
  });

  // Publish post mutation
  const publishPostMutation = useMutation({
    mutationFn: (id: string) => socialService.publishPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (id: string) => socialService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
  });

  // Handler for AI generation adoption
  const handleAdoptProposal = async (proposal: SocialPostProposal) => {
    await createPostMutation.mutateAsync({
      channel: proposal.channel,
      title: proposal.title,
      content: proposal.content,
      tags: proposal.tags,
      predictedImpact: proposal.predictedImpact,
      status: 'DRAFT',
    });
  };

  const channelOptions: { value: SocialChannel | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Todos los canales' },
    { value: 'LINKEDIN', label: 'LinkedIn' },
    { value: 'TWITTER_X', label: 'Twitter / X' },
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'BLOG', label: 'Blog' },
    { value: 'NEWSLETTER', label: 'Newsletter' },
  ];

  const statusOptions: { value: SocialPostStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Todos los estados' },
    { value: 'DRAFT', label: 'Borradores' },
    { value: 'PUBLISHED', label: 'Publicados' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <SocialHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        postCount={posts.length}
      />

      {/* Tab: Brand Identity Kit */}
      {activeTab === 'brand' && (
        <>
          {isLoadingBrand ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-xs text-zinc-400">Cargando identidad de marca...</p>
            </div>
          ) : (
            <BrandKitView
              initialProfile={brandProfile}
              onSave={async (payload) => {
                await saveBrandMutation.mutateAsync(payload);
              }}
              isSaving={saveBrandMutation.isPending}
            />
          )}
        </>
      )}

      {/* Tab: Social Feed & Studio */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-subtle border border-white/[0.06]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-400 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" />
                Filtrar:
              </span>

              {channelOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setChannelFilter(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    channelFilter === opt.value
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                    statusFilter === opt.value
                      ? 'bg-white/[0.1] text-white font-medium'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          {isLoadingPosts ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-xs text-zinc-400">Cargando publicaciones estratégicas...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-dashed border-white/[0.08] bg-surface-subtle space-y-3">
              <Share2 className="w-10 h-10 mx-auto text-zinc-600" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-zinc-200">
                No hay publicaciones registradas
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Genera tu primer lote de contenidos multicanal con IA a partir de las oportunidades y el Brand Profile, o redacta una publicación manual.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsAIModalOpen(true)}
                  className="gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Generar con IA (Studio)
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => (
                <SocialPostCard
                  key={post.id}
                  post={post}
                  onPublish={async (id) => {
                    await publishPostMutation.mutateAsync(id);
                  }}
                  onDelete={async (id) => {
                    await deletePostMutation.mutateAsync(id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Generate Modal */}
      <AIGenerateSocialModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerate={async (payload) => {
          const res = await socialService.generateContentWithAI(payload);
          return res.proposals;
        }}
        onAdoptProposal={handleAdoptProposal}
      />

      {/* Manual Create Modal */}
      <CreateSocialPostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (payload) => {
          await createPostMutation.mutateAsync(payload);
        }}
        isSubmitting={createPostMutation.isPending}
      />
    </div>
  );
};
