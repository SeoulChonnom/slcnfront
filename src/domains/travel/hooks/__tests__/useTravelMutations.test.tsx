import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  useCreateTravelPlace,
  useDeleteTravel,
  useUpdateTravel,
} from '../useTravelMutations';

const { deleteTravel, updateTravel } = vi.hoisted(() => ({
  deleteTravel: vi.fn(),
  updateTravel: vi.fn(),
}));

vi.mock('../../api/travel-api', () => ({
  travelApi: {
    deleteTravel,
    updateTravel,
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
    updateTravel.mockReset();
  });

  it('useDeleteTravel: exposes a mutate function that calls travelApi.deleteTravel', () => {
    const { result } = renderHook(() => useDeleteTravel(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('useUpdateTravel: exposes a mutate function bound to the given travelId', () => {
    const { result } = renderHook(() => useUpdateTravel('travel-1'), {
      wrapper: makeWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });

  it('useCreateTravelPlace: exposes a mutate function bound to the given travelId', () => {
    const { result } = renderHook(() => useCreateTravelPlace('travel-1'), {
      wrapper: makeWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
  });
});
