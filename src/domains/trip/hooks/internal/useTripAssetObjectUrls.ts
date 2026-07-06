import {
  type AssetObjectUrlsOptions,
  useAssetObjectUrls,
} from '../../../../lib/hooks/useAssetObjectUrls';
import { tripFilesApi } from '../../api/trip-files-api';
import { type FileAsset, fileAssetKey } from '../../types';

const tripAssetOptions: AssetObjectUrlsOptions<FileAsset> = {
  getKey: fileAssetKey,
  download: (ref) => tripFilesApi.downloadTripFile(ref),
};

export function useTripAssetObjectUrls(
  refs: Array<FileAsset | null | undefined>
) {
  return useAssetObjectUrls(refs, tripAssetOptions);
}
