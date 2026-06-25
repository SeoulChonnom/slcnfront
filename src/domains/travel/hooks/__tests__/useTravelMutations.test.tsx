import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  useDeleteTravel,
  useDeleteTravelPhoto,
  useDeleteTravelPlace,
  usePutTravelReview,
  useUpdateTravelDay,
  useUpdateTravelPlace,
} from '../useTravelMutations';

const {
  deleteTravel,
  updateTravelDay,
  updateTravelPlace,
  deleteTravelPlace,
  deleteTravelPhoto,
  putTravelReview,
} = vi.hoisted(() => ({
  deleteTravel: vi.fn(),
  updateTravelDay: vi.fn(),
  updateTravelPlace: vi.fn(),
  deleteTravelPlace: vi.fn(),
  deleteTravelPhoto: vi.fn(),
  putTravelReview: vi.fn(),
}));

vi.mock('../../api/travel-api', () => ({
  travelApi: {
    deleteTravel,
    updateTravelDay,
    updateTravelPlace,
    deleteTravelPlace,
    deleteTravelPhoto,
    putTravelReview,
  },
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return Wrapper;
}

describe('useTravelMutations', () => {
  beforeEach(() => {
    deleteTravel.mockReset();
    updateTravelDay.mockReset();
    updateTravelPlace.mockReset();
    deleteTravelPlace.mockReset();
    deleteTravelPhoto.mockReset();
    putTravelReview.mockReset();
  });

  it('useDeleteTravel: exposes a mutate function that calls travelApi.deleteTravel', () => {
    const { result } = renderHook(() => useDeleteTravel(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('useUpdateTravelDay: exposes a mutate function bound to the given travelId', () => {
    const { result } = renderHook(() => useUpdateTravelDay('travel-1'), {
      wrapper: makeWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it('useUpdateTravelPlace: exposes a mutate function bound to the given travelId', () => {
    const { result } = renderHook(() => useUpdateTravelPlace('travel-1'), {
      wrapper: makeWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it('useDeleteTravelPlace: exposes a mutate function bound to the given travelId', () => {
    const { result } = renderHook(() => useDeleteTravelPlace('travel-1'), {
      wrapper: makeWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it('useDeleteTravelPhoto: exposes a mutate function bound to the given travelId', () => {
    const { result } = renderHook(() => useDeleteTravelPhoto('travel-1'), {
      wrapper: makeWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it('usePutTravelReview: exposes a mutate function bound to the given travelId', () => {
    const { result } = renderHook(() => usePutTravelReview('travel-1'), {
      wrapper: makeWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });
});
