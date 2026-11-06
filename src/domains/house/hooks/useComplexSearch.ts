import { skipToken, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { houseApi } from '@/domains/house/api/house-api';
import { houseQueryKeys } from '@/lib/api/query-keys';

export function useComplexSearch(keyword: string) {
  const trimmed = keyword.trim();
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(trimmed), 300);
    return () => window.clearTimeout(timeout);
  }, [trimmed]);
  return useQuery({
    queryKey: houseQueryKeys.search(trimmed),
    queryFn:
      trimmed.length >= 2 && debounced === trimmed
        ? ({ signal }) => houseApi.searchComplexes(trimmed, signal)
        : skipToken,
    staleTime: 5 * 60 * 1000,
  });
}
