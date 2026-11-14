import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { searchAddresses } from '@/domains/geo/api/geo-api';
import { geoQueryKeys } from '@/lib/api/query-keys';

export const ADDRESS_SEARCH_DEBOUNCE_MS = 300;
export const ADDRESS_SEARCH_MIN_LENGTH = 2;

/**
 * Address candidates for `keyword`. The keyword is debounced (300ms) and
 * nothing is requested while the trimmed keyword is under 2 characters.
 */
export function useAddressSearch(keyword: string, enabled = true, page = 1) {
  const trimmed = keyword.trim();
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(
      () => setDebounced(trimmed),
      ADDRESS_SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [trimmed]);

  const isDebouncing = trimmed !== debounced;
  const active =
    enabled && !isDebouncing && trimmed.length >= ADDRESS_SEARCH_MIN_LENGTH;

  const query = useQuery({
    queryKey: geoQueryKeys.addressSearch(trimmed, page, 10),
    queryFn: ({ signal }) =>
      searchAddresses({ keyword: trimmed, page, size: 10 }, signal),
    enabled: active,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 60_000,
  });

  return { ...query, isDebouncing };
}
