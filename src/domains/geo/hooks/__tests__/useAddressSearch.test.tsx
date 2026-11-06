import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import type { PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import { QueryProvider } from '@/app/providers/QueryProvider';
import {
  ADDRESS_SEARCH_DEBOUNCE_MS,
  useAddressSearch,
} from '@/domains/geo/hooks/useAddressSearch';
import { createTestQueryClient } from '@/test/helpers/query-client';
import { server } from '@/test/helpers/server';

const API = '*';
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function wrapper({ children }: PropsWithChildren) {
  return <QueryProvider client={client}>{children}</QueryProvider>;
}
const client = createTestQueryClient();

function captureKeywords() {
  const keywords: string[] = [];
  server.use(
    http.get(`${API}/geo/addresses`, ({ request }) => {
      keywords.push(new URL(request.url).searchParams.get('keyword') ?? '');
      return HttpResponse.json({ totalCount: 0, items: [] });
    })
  );
  return keywords;
}

describe('useAddressSearch', () => {
  it('does not request for a trimmed keyword under 2 characters', async () => {
    const keywords = captureKeywords();
    renderHook(() => useAddressSearch(' 성 '), { wrapper });

    await wait(ADDRESS_SEARCH_DEBOUNCE_MS + 150);
    expect(keywords).toEqual([]);
  });

  it('debounces: only the settled keyword is requested', async () => {
    const keywords = captureKeywords();
    const { rerender, result } = renderHook(
      ({ keyword }) => useAddressSearch(keyword),
      { wrapper, initialProps: { keyword: '성수' } }
    );

    rerender({ keyword: '성수 트' });
    rerender({ keyword: '성수 트리마제' });
    expect(keywords).toEqual([]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(keywords).toEqual(['성수 트리마제']);
  });

  it('stays idle when disabled', async () => {
    const keywords = captureKeywords();
    renderHook(() => useAddressSearch('성수동', false), { wrapper });

    await wait(ADDRESS_SEARCH_DEBOUNCE_MS + 150);
    expect(keywords).toEqual([]);
  });
});
