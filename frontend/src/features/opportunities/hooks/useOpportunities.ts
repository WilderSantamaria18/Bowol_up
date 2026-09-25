import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunityService } from '../services/opportunityService';
import {
  OpportunityStatus,
  CreateOpportunityPayload,
  UpdateOpportunityPayload,
} from '../types';

export const OPPORTUNITY_QUERY_KEYS = {
  board: ['opportunities', 'board'] as const,
  detail: (id: string) => ['opportunities', id] as const,
};

export function useOpportunityBoard() {
  return useQuery({
    queryKey: OPPORTUNITY_QUERY_KEYS.board,
    queryFn: () => opportunityService.getBoard(),
  });
}

export function useGenerateOpportunitiesFromSwot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (swotId: string) => opportunityService.generateFromSwot(swotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOpportunityPayload) => opportunityService.createOpportunity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useUpdateOpportunity(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOpportunityPayload) => opportunityService.updateOpportunity(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useUpdateOpportunityStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OpportunityStatus }) =>
      opportunityService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => opportunityService.deleteOpportunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}
