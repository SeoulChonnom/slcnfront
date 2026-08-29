import { travelFilesApi } from '@/domains/travel/api/travel-files-api';
import type { ImageVariant } from '@/lib/api/image-variant';
import {
  type AssetObjectUrlsOptions,
  useAssetObjectUrls,
} from '@/lib/hooks/useAssetObjectUrls';

export type TravelAssetRef = {
  fileId: string;
  variant: ImageVariant;
};

const travelAssetOptions: AssetObjectUrlsOptions<TravelAssetRef> = {
  getKey: (ref) => ref.fileId,
  download: (ref) => travelFilesApi.downloadTravelFile(ref.fileId, ref.variant),
};

export function useTravelAssetObjectUrls(
  refs: Array<TravelAssetRef | null | undefined>
) {
  return useAssetObjectUrls(refs, travelAssetOptions);
}
