import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { houseApi } from '@/domains/house/api/house-api';
import { useComplexSearch } from '@/domains/house/hooks/useComplexSearch';

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {children}
    </QueryClientProvider>
  );
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('complex search', () => {
  it('waits 300ms, ignores short trimmed keywords, and cancels superseded typing', async () => {
    vi.useFakeTimers();
    const search = vi
      .spyOn(houseApi, 'searchComplexes')
      .mockResolvedValue({ items: [] });
    const { rerender, unmount } = renderHook(
      ({ keyword }) => useComplexSearch(keyword),
      { initialProps: { keyword: ' 가 ' }, wrapper }
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(search).not.toHaveBeenCalled();
    rerender({ keyword: '래미' });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(299);
    });
    expect(search).not.toHaveBeenCalled();
    rerender({ keyword: ' 래미안 ' });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('래미안', expect.any(AbortSignal));
    unmount();
  });
});
