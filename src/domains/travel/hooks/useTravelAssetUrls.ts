import { useTravelAssetObjectUrls } from '@/domains/travel/hooks/internal/useTravelAssetObjectUrls';

export function useTravelAssetUrls(ids: Array<string | null | undefined>) {
  return useTravelAssetObjectUrls(ids).objectUrls;
}
