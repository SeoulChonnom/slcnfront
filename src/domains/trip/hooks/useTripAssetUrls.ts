import { useTripAssetObjectUrls } from '@/domains/trip/hooks/internal/useTripAssetObjectUrls';
import type { FileAsset } from '@/domains/trip/types';

export function useTripAssetUrls(refs: Array<FileAsset | null | undefined>) {
  return useTripAssetObjectUrls(refs).objectUrls;
}
