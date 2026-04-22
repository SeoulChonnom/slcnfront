import { useEffect, useMemo, useRef, useState } from 'react';
import { tripFilesApi } from '../../api/trip-files-api';

function normalizeAssetPaths(paths: Array<string | null | undefined>) {
  return Array.from(
    new Set(paths.filter((path): path is string => Boolean(path?.trim())))
  );
}

function revokeObjectUrls(record: Record<string, string>) {
  Object.values(record).forEach((objectUrl) => {
    URL.revokeObjectURL(objectUrl);
  });
}

export function useTripAssetObjectUrls(
  paths: Array<string | null | undefined>
) {
  const normalizedPaths = useMemo(() => normalizeAssetPaths(paths), [paths]);
  const serializedPaths = normalizedPaths.join('\u0000');
  const objectUrlsRef = useRef<Record<string, string>>({});
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const nextPaths = serializedPaths ? serializedPaths.split('\u0000') : [];

    if (nextPaths.length === 0) {
      revokeObjectUrls(objectUrlsRef.current);
      objectUrlsRef.current = {};
      setObjectUrls({});
      setIsLoading(false);

      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);

    void Promise.allSettled(
      nextPaths.map((path) => tripFilesApi.downloadTripFile(path))
    ).then((results) => {
      if (cancelled) {
        return;
      }

      const nextObjectUrls: Record<string, string> = {};

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          nextObjectUrls[nextPaths[index]!] = URL.createObjectURL(result.value);
        }
      });

      revokeObjectUrls(objectUrlsRef.current);
      objectUrlsRef.current = nextObjectUrls;
      setObjectUrls(nextObjectUrls);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      revokeObjectUrls(objectUrlsRef.current);
      objectUrlsRef.current = {};
    };
  }, [serializedPaths]);

  return {
    objectUrls,
    isLoading,
  };
}
