import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { swotService } from '../services/swotService';
import {
  GenerateSwotPayload,
  AddSwotItemPayload,
  UpdateSwotPayload,
} from '../types';

export const SWOT_QUERY_KEYS = {
  latest: ['swot', 'latest'] as const,
  detail: (id: string) => ['swot', id] as const,
  evidence: (id: string) => ['swot', id, 'evidence'] as const,
};

export function useLatestSwot() {
  return useQuery({
    queryKey: SWOT_QUERY_KEYS.latest,
    queryFn: () => swotService.getLatestSwot(),
    retry: false,
  });
}

export function useSwotEvidence(swotId?: string) {
  return useQuery({
    queryKey: swotId ? SWOT_QUERY_KEYS.evidence(swotId) : ['swot', 'evidence'],
    queryFn: () => (swotId ? swotService.getEvidence(swotId) : Promise.resolve([])),
    enabled: !!swotId,
  });
}

export function useGenerateSwot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: GenerateSwotPayload) => swotService.generateSwot(payload),
    onSuccess: (newSwot) => {
      queryClient.setQueryData(SWOT_QUERY_KEYS.latest, newSwot);
      queryClient.invalidateQueries({ queryKey: ['swot'] });
    },
  });
}

export function useAddSwotItem(swotId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddSwotItemPayload) => swotService.addItem(swotId, payload),
    onSuccess: (updatedSwot) => {
      queryClient.setQueryData(SWOT_QUERY_KEYS.latest, updatedSwot);
      queryClient.invalidateQueries({ queryKey: ['swot'] });
    },
  });
}

export function useRemoveSwotItem(swotId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => swotService.removeItem(swotId, itemId),
    onSuccess: (updatedSwot) => {
      queryClient.setQueryData(SWOT_QUERY_KEYS.latest, updatedSwot);
      queryClient.invalidateQueries({ queryKey: ['swot'] });
    },
  });
}

export function useUpdateSwot(swotId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSwotPayload) => swotService.updateSwot(swotId, payload),
    onSuccess: (updatedSwot) => {
      queryClient.setQueryData(SWOT_QUERY_KEYS.latest, updatedSwot);
      queryClient.invalidateQueries({ queryKey: ['swot'] });
    },
  });
}
