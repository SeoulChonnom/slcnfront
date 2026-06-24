import { type FileRef, fileRefKey } from '../types';
import { useTripAssetObjectUrls } from './internal/useTripAssetObjectUrls';

export function useTripAssetUrl(ref: FileRef | null | undefined) {
  const { objectUrls, isLoading } = useTripAssetObjectUrls([ref]);

  return {
    objectUrl: ref ? (objectUrls[fileRefKey(ref)] ?? null) : null,
    isPending: isLoading,
  };
}
