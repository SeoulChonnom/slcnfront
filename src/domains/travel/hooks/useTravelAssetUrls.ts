import { useMemo } from 'react';
import {
  type TravelAssetRef,
  useTravelAssetObjectUrls,
} from '@/domains/travel/hooks/internal/useTravelAssetObjectUrls';
import type { ImageVariant } from '@/lib/api/image-variant';

/**
 * Object URLs for travel assets, keyed by `fileId`. A single call uses one
 * variant for every id, so `fileId` alone stays a unique key.
 */
export function useTravelAssetUrls(
  ids: Array<string | null | undefined>,
  variant: ImageVariant = 'original'
) {
  const refs = useMemo<Array<TravelAssetRef | null>>(
    () => ids.map((fileId) => (fileId ? { fileId, variant } : null)),
    [ids, variant]
  );

  return useTravelAssetObjectUrls(refs).objectUrls;
}
