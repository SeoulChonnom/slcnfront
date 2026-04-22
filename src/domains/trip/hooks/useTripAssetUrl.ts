import { useTripAssetObjectUrls } from './internal/useTripAssetObjectUrls';

export function useTripAssetUrl(path: string | null | undefined) {
  const { objectUrls, isLoading } = useTripAssetObjectUrls([path]);

  return {
    objectUrl: path ? (objectUrls[path] ?? null) : null,
    isPending: isLoading,
  };
}
