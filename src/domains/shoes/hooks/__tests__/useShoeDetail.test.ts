import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import { createTestQueryClient } from '../../../../test/helpers/query-client';
import { useShoeDetail } from '../useShoeDetail';

function createWrapper() {
  const client = createTestQueryClient();

  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('useShoeDetail', () => {
  it('returns detail data for a valid slug pair', async () => {
    const { result } = renderHook(() => useShoeDetail('nike', 'v2k'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.brand.brandId).toBe('nike');
    expect(result.current.data?.shoe.shoesId).toBe('v2k');
  });

  it('returns null for an invalid slug pair', async () => {
    const { result } = renderHook(() => useShoeDetail('nike', 'missing'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
  });
});
