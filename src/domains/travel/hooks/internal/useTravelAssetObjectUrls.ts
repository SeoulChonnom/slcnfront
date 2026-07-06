import {
  type AssetObjectUrlsOptions,
  useAssetObjectUrls,
} from '../../../../lib/hooks/useAssetObjectUrls';
import { travelFilesApi } from '../../api/travel-files-api';

const travelAssetOptions: AssetObjectUrlsOptions<string> = {
  getKey: (id) => id,
  download: (id) => travelFilesApi.downloadTravelFile(id),
};

export function useTravelAssetObjectUrls(
  ids: Array<string | null | undefined>
) {
  return useAssetObjectUrls(ids, travelAssetOptions);
}
