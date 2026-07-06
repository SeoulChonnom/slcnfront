import { useTravelAssetObjectUrls } from './internal/useTravelAssetObjectUrls';

export function useTravelAssetUrl(fileId: string | null | undefined) {
  const { objectUrls, isLoading } = useTravelAssetObjectUrls([fileId]);

  return {
    objectUrl: fileId ? (objectUrls[fileId] ?? null) : null,
    isPending: isLoading,
  };
}
