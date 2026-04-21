import { useEffect, useRef, useState } from 'react';
import { tripFilesApi } from '../api/trip-files-api';

function normalizeAssetPaths(paths: Array<string | null | undefined>) {
  return Array.from(
    new Set(paths.filter((path): path is string => Boolean(path?.trim())))
  );
}

export function useTripAssetUrls(paths: Array<string | null | undefined>) {
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  const objectUrlsRef = useRef<Record<string, string>>({});
  const serializedPaths = normalizeAssetPaths(paths).join('\u0000');

  useEffect(() => {
    let cancelled = false;
    const nextPaths = serializedPaths ? serializedPaths.split('\u0000') : [];

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      if (Object.keys(objectUrlsRef.current).length > 0) {
        Object.values(objectUrlsRef.current).forEach((objectUrl) => {
          URL.revokeObjectURL(objectUrl);
        });
        objectUrlsRef.current = {};
      }

      setObjectUrls((current) =>
        Object.keys(current).length === 0 ? current : {}
      );
    });

    if (nextPaths.length === 0) {
      return () => {
        cancelled = true;
      };
    }

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

      Object.values(objectUrlsRef.current).forEach((objectUrl) => {
        URL.revokeObjectURL(objectUrl);
      });
      objectUrlsRef.current = nextObjectUrls;
      setObjectUrls(nextObjectUrls);
    });

    return () => {
      cancelled = true;

      Object.values(objectUrlsRef.current).forEach((objectUrl) => {
        URL.revokeObjectURL(objectUrl);
      });
      objectUrlsRef.current = {};
    };
  }, [serializedPaths]);

  return objectUrls;
}
