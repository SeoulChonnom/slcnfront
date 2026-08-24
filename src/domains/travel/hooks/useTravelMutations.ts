import { useMutation, useQueryClient } from '@tanstack/react-query';
import { travelApi } from '@/domains/travel/api/travel-api';
import type { TravelCdo, TravelUdo } from '@/domains/travel/types';
import { travelQueryKeys } from '@/lib/api/query-keys';

// ── Travel CRUD mutations ─────────────────────────────────────────────────────

export function useCreateTravel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TravelCdo) => travelApi.createTravel(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: travelQueryKeys.list() });
    },
  });
}

export function useUpdateTravel(travelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TravelUdo) =>
      travelApi.updateTravel(travelId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: travelQueryKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: travelQueryKeys.detail(travelId),
      });
    },
  });
}

export function useDeleteTravel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (travelId: string) => travelApi.deleteTravel(travelId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: travelQueryKeys.list() });
    },
  });
}
