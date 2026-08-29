import { useMemo } from 'react';
import {
  type TripAssetRef,
  useTripAssetObjectUrls,
} from '@/domains/trip/hooks/internal/useTripAssetObjectUrls';
import { type FileAsset, fileAssetKey } from '@/domains/trip/types';
import type { ImageVariant } from '@/lib/api/image-variant';

export function useTripAssetUrl(
  asset: FileAsset | null | undefined,
  variant: ImageVariant = 'original'
) {
  const refs = useMemo<Array<TripAssetRef | null>>(
    () => [asset ? { asset, variant } : null],
    [asset, variant]
  );
  const { objectUrls, isLoading } = useTripAssetObjectUrls(refs);

  return {
    objectUrl: asset ? (objectUrls[fileAssetKey(asset)] ?? null) : null,
    isPending: isLoading,
  };
}
