import { travelFilesApi } from '@/domains/travel/api/travel-files-api';
import {
  type AssetObjectUrlsOptions,
  useAssetObjectUrls,
} from '@/lib/hooks/useAssetObjectUrls';

const travelAssetOptions: AssetObjectUrlsOptions<string> = {
  getKey: (id) => id,
  download: (id) => travelFilesApi.downloadTravelFile(id),
};

export function useTravelAssetObjectUrls(
  ids: Array<string | null | undefined>
) {
  return useAssetObjectUrls(ids, travelAssetOptions);
}
