import { useTripAssetObjectUrls } from './internal/useTripAssetObjectUrls';

export function useTripAssetUrls(paths: Array<string | null | undefined>) {
  return useTripAssetObjectUrls(paths).objectUrls;
}
