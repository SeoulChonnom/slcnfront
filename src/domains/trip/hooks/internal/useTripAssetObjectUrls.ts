import { tripFilesApi } from '@/domains/trip/api/trip-files-api';
import { type FileAsset, fileAssetKey } from '@/domains/trip/types';
import type { ImageVariant } from '@/lib/api/image-variant';
import {
  type AssetObjectUrlsOptions,
  useAssetObjectUrls,
} from '@/lib/hooks/useAssetObjectUrls';

export type TripAssetRef = {
  asset: FileAsset;
  variant: ImageVariant;
};

const tripAssetOptions: AssetObjectUrlsOptions<TripAssetRef> = {
  getKey: (ref) => fileAssetKey(ref.asset),
  download: (ref) => tripFilesApi.downloadTripFile(ref.asset, ref.variant),
};

export function useTripAssetObjectUrls(
  refs: Array<TripAssetRef | null | undefined>
) {
  return useAssetObjectUrls(refs, tripAssetOptions);
}
