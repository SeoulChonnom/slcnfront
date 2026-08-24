import { tripFilesApi } from '@/domains/trip/api/trip-files-api';
import { type FileAsset, fileAssetKey } from '@/domains/trip/types';
import {
  type AssetObjectUrlsOptions,
  useAssetObjectUrls,
} from '@/lib/hooks/useAssetObjectUrls';

const tripAssetOptions: AssetObjectUrlsOptions<FileAsset> = {
  getKey: fileAssetKey,
  download: (ref) => tripFilesApi.downloadTripFile(ref),
};

export function useTripAssetObjectUrls(
  refs: Array<FileAsset | null | undefined>
) {
  return useAssetObjectUrls(refs, tripAssetOptions);
}
