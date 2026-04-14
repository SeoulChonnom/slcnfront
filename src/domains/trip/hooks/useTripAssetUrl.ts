import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tripQueryKeys } from '../../../lib/api/query-keys';
import { tripFilesApi } from '../api/trip-files-api';

export function useTripAssetUrl(path: string | null | undefined) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const query = useQuery({
    queryKey: tripQueryKeys.file(path ?? ''),
    queryFn: () => tripFilesApi.downloadTripFile(path ?? ''),
    enabled: Boolean(path),
  });

  useEffect(() => {
    if (!query.data) {
      setObjectUrl(null);

      return;
    }

    const nextObjectUrl = URL.createObjectURL(query.data);
    setObjectUrl(nextObjectUrl);

    return () => {
      URL.revokeObjectURL(nextObjectUrl);
    };
  }, [query.data]);

  return {
    ...query,
    objectUrl,
  };
}
