import { useMemo } from 'react';
import {
  type TravelAssetRef,
  useTravelAssetObjectUrls,
} from '@/domains/travel/hooks/internal/useTravelAssetObjectUrls';
import type { ImageVariant } from '@/lib/api/image-variant';

export function useTravelAssetUrl(
  fileId: string | null | undefined,
  variant: ImageVariant = 'original'
) {
  const refs = useMemo<Array<TravelAssetRef | null>>(
    () => [fileId ? { fileId, variant } : null],
    [fileId, variant]
  );
  const { objectUrls, isLoading } = useTravelAssetObjectUrls(refs);

  return {
    objectUrl: fileId ? (objectUrls[fileId] ?? null) : null,
    isPending: isLoading,
  };
}
