import { useTripAssetObjectUrls } from '@/domains/trip/hooks/internal/useTripAssetObjectUrls';
import { type FileAsset, fileAssetKey } from '@/domains/trip/types';

export function useTripAssetUrl(ref: FileAsset | null | undefined) {
  const { objectUrls, isLoading } = useTripAssetObjectUrls([ref]);

  return {
    objectUrl: ref ? (objectUrls[fileAssetKey(ref)] ?? null) : null,
    isPending: isLoading,
  };
}
