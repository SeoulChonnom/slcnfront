import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tripQueryKeys } from '../../../lib/api/query-keys';
import { tripFilesApi } from '../api/trip-files-api';

export function useTripAssetUrl(path: string | null | undefined) {
  const query = useQuery({
    queryKey: tripQueryKeys.file(path ?? ''),
    queryFn: () => tripFilesApi.downloadTripFile(path ?? ''),
    enabled: Boolean(path),
  });

  const objectUrl = useMemo(
    () => (query.data ? URL.createObjectURL(query.data) : null),
    [query.data]
  );

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  return {
    ...query,
    objectUrl,
  };
}
