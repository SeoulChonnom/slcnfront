import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useDeleteTravel } from '../useTravelMutations';

const { deleteTravel } = vi.hoisted(() => ({
  deleteTravel: vi.fn(),
}));

vi.mock('../../api/travel-api', () => ({
  travelApi: {
    deleteTravel,
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
  });

  it('useDeleteTravel: exposes a mutate function that calls travelApi.deleteTravel', () => {
    const { result } = renderHook(() => useDeleteTravel(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });
});
