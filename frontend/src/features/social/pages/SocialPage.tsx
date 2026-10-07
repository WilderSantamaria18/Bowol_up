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
import { Loader2, Share2, Sparkles } from 'lucide-react';
import { Button, CardSkeletonGrid, DataState, EmptyState, ListToolbar, SegmentedTabs } from '@/components/ui';

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
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Cargando identidad de marca...</p>
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
          <ListToolbar
            left={
              <SegmentedTabs
                mode="filter"
                tone="orange"
                aria-label="Filtrar por canal"
                value={channelFilter}
                onChange={setChannelFilter}
                items={channelOptions.map((o) => ({ id: o.value, label: o.label }))}
              />
            }
          >
            <SegmentedTabs
              mode="filter"
              tone="zinc"
              aria-label="Filtrar por estado"
              value={statusFilter}
              onChange={setStatusFilter}
              items={statusOptions.map((o) => ({ id: o.value, label: o.label }))}
            />
          </ListToolbar>

          <DataState
            isLoading={isLoadingPosts}
            isEmpty={posts.length === 0}
            loading={<CardSkeletonGrid count={6} className="gap-5 lg:grid-cols-3" />}
            empty={
              <EmptyState
                icon={Share2}
                title="No hay publicaciones registradas"
                description="Genera tu primer lote de contenidos multicanal con IA a partir de las oportunidades y el Brand Profile, o redacta una publicación manual."
                action={
                  <Button size="sm" variant="primary" leftIcon={Sparkles} onClick={() => setIsAIModalOpen(true)}>
                    Generar con IA (Studio)
                  </Button>
                }
              />
            }
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
          </DataState>
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
