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
export function useAddressSearch(keyword: string, enabled = true) {
  const trimmed = keyword.trim();
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(
      () => setDebounced(trimmed),
      ADDRESS_SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [trimmed]);

  const active = enabled && debounced.length >= ADDRESS_SEARCH_MIN_LENGTH;

  return useQuery({
    queryKey: geoQueryKeys.addressSearch(debounced),
    queryFn: () => searchAddresses({ keyword: debounced }),
    enabled: active,
    retry: false,
    staleTime: 60_000,
  });
}
