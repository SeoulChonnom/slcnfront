import { useMemo } from 'react';
import {
  type TripAssetRef,
  useTripAssetObjectUrls,
} from '@/domains/trip/hooks/internal/useTripAssetObjectUrls';
import type { FileAsset } from '@/domains/trip/types';
import type { ImageVariant } from '@/lib/api/image-variant';

export function useTripAssetUrls(
  assets: Array<FileAsset | null | undefined>,
  variant: ImageVariant = 'original'
) {
  const refs = useMemo<Array<TripAssetRef | null>>(
    () => assets.map((asset) => (asset ? { asset, variant } : null)),
    [assets, variant]
  );

  return useTripAssetObjectUrls(refs).objectUrls;
}
