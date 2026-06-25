import { useMutation, useQueryClient } from '@tanstack/react-query';
import { travelQueryKeys } from '../../../lib/api/query-keys';
import { travelApi } from '../api/travel-api';
import type {
  TravelCdo,
  TravelDayUdo,
  TravelPhotoCdo,
  TravelPlaceCdo,
  TravelPlaceUdo,
  TravelReviewUdo,
  TravelTagCdo,
  TravelUdo,
} from '../types';

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

export function usePutTravel(travelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TravelUdo) => travelApi.putTravel(travelId, payload),
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

// ── Day mutation ──────────────────────────────────────────────────────────────

export function useUpdateTravelDay(travelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      travelDayId,
      payload,
    }: {
      travelDayId: string;
      payload: TravelDayUdo;
    }) => travelApi.updateTravelDay(travelId, travelDayId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelQueryKeys.detail(travelId),
      });
    },
  });
}

// ── Place mutations ───────────────────────────────────────────────────────────

export function useCreateTravelPlace(travelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      travelDayId,
      payload,
    }: {
      travelDayId: string;
      payload: TravelPlaceCdo;
    }) => travelApi.createTravelPlace(travelId, travelDayId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelQueryKeys.detail(travelId),
      });
    },
  });
}

export function useUpdateTravelPlace(travelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      travelDayId,
      placeId,
      payload,
    }: {
      travelDayId: string;
      placeId: string;
      payload: TravelPlaceUdo;
    }) => travelApi.updateTravelPlace(travelId, travelDayId, placeId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelQueryKeys.detail(travelId),
      });
    },
  });
}

export function useDeleteTravelPlace(travelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      travelDayId,
      placeId,
    }: {
      travelDayId: string;
      placeId: string;
    }) => travelApi.deleteTravelPlace(travelId, travelDayId, placeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelQueryKeys.detail(travelId),
      });
    },
  });
}

// ── Photo mutations ───────────────────────────────────────────────────────────

export function useAddTravelPhoto(travelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TravelPhotoCdo) =>
      travelApi.addTravelPhoto(travelId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelQueryKeys.detail(travelId),
      });
    },
  });
}

export function useDeleteTravelPhoto(travelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) =>
      travelApi.deleteTravelPhoto(travelId, photoId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelQueryKeys.detail(travelId),
      });
    },
  });
}

// ── Review mutation ───────────────────────────────────────────────────────────

export function usePutTravelReview(travelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TravelReviewUdo) =>
      travelApi.putTravelReview(travelId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelQueryKeys.detail(travelId),
      });
    },
  });
}

// ── Tag mutations ─────────────────────────────────────────────────────────────

export function useAddTravelTag(travelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TravelTagCdo) =>
      travelApi.addTravelTag(travelId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelQueryKeys.detail(travelId),
      });
    },
  });
}

export function useDeleteTravelTag(travelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => travelApi.deleteTravelTag(travelId, tagId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelQueryKeys.detail(travelId),
      });
    },
  });
}
