import { useTravelAssetObjectUrls } from './internal/useTravelAssetObjectUrls';

export function useTravelAssetUrls(ids: Array<string | null | undefined>) {
  return useTravelAssetObjectUrls(ids).objectUrls;
}
