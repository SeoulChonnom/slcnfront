import { useMutation, useQueryClient } from '@tanstack/react-query';
import { travelQueryKeys } from '../../../lib/api/query-keys';
import { travelApi } from '../api/travel-api';
import { buildTravelUdoFromDetail } from '../mappers/travel-mappers';
import type {
  PlaceCategory,
  TravelCdo,
  TravelDetail,
  TravelPhotoCdo,
  TravelPlaceCdo,
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

// ── Place mutation ────────────────────────────────────────────────────────────

export function useCreateTravelPlace(travelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      currentTravel,
      travelDayId,
      payload,
    }: {
      currentTravel: TravelDetail;
      travelDayId: string;
      payload: TravelPlaceCdo;
    }) => {
      const udo = buildTravelUdoFromDetail(currentTravel);
      const updatedDays = udo.travelDays.map((day) => {
        if (day.id !== travelDayId) return day;
        const newPlace = {
          name: payload.name,
          category: (payload.category ?? 'ETC') as PlaceCategory,
          address: payload.address,
          memo: payload.memo,
          description: payload.description,
          sortOrder: day.places.length,
          coverPhotoId: payload.coverPhotoId,
          photos: [] as TravelPhotoCdo[],
        };
        return { ...day, places: [...day.places, newPlace] };
      });
      return travelApi.updateTravel(travelId, {
        ...udo,
        travelDays: updatedDays,
      });
    },
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
    mutationFn: ({
      currentTravel,
      payloads,
    }: {
      currentTravel: TravelDetail;
      payloads: TravelPhotoCdo[];
    }) => {
      const udo = buildTravelUdoFromDetail(currentTravel);
      return travelApi.updateTravel(travelId, {
        ...udo,
        photos: [...udo.photos, ...payloads],
      });
    },
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
    mutationFn: ({
      currentTravel,
      name,
    }: {
      currentTravel: TravelDetail;
      name: string;
    }) => {
      const udo = buildTravelUdoFromDetail(currentTravel);
      return travelApi.updateTravel(travelId, {
        ...udo,
        tags: [...udo.tags, name],
      });
    },
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
    mutationFn: ({
      currentTravel,
      tagId,
    }: {
      currentTravel: TravelDetail;
      tagId: string;
    }) => {
      const udo = buildTravelUdoFromDetail(currentTravel);
      const remainingTagNames = currentTravel.tags
        .filter((t) => t.id !== tagId)
        .map((t) => t.name);
      return travelApi.updateTravel(travelId, {
        ...udo,
        tags: remainingTagNames,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: travelQueryKeys.detail(travelId),
      });
    },
  });
}
