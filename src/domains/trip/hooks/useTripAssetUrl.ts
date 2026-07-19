import { type FileAsset, fileAssetKey } from '../types';
import { useTripAssetObjectUrls } from './internal/useTripAssetObjectUrls';

export function useTripAssetUrl(ref: FileAsset | null | undefined) {
  const { objectUrls, isLoading } = useTripAssetObjectUrls([ref]);

  return {
    objectUrl: ref ? (objectUrls[fileAssetKey(ref)] ?? null) : null,
    isPending: isLoading,
  };
}
