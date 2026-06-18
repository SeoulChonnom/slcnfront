import { useEffect, useMemo, useRef, useState } from 'react';
import { tripFilesApi } from '../../api/trip-files-api';
import { type FileRef, fileRefKey } from '../../types';

function normalizeAssetRefs(
  refs: Array<FileRef | null | undefined>
): FileRef[] {
  const seen = new Set<string>();
  const result: FileRef[] = [];

  for (const ref of refs) {
    if (!ref) continue;
    const key = fileRefKey(ref);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(ref);
  }

  return result;
}

function revokeObjectUrls(record: Record<string, string>) {
  Object.values(record).forEach((objectUrl) => {
    URL.revokeObjectURL(objectUrl);
  });
}

export function useTripAssetObjectUrls(
  refs: Array<FileRef | null | undefined>
) {
  const normalizedRefs = useMemo(() => normalizeAssetRefs(refs), [refs]);
  const serializedRefs = JSON.stringify(normalizedRefs);
  const objectUrlsRef = useRef<Record<string, string>>({});
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const nextRefs: FileRef[] = JSON.parse(serializedRefs);

    if (nextRefs.length === 0) {
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
      nextRefs.map((ref) => tripFilesApi.downloadTripFile(ref))
    ).then((results) => {
      if (cancelled) {
        return;
      }

      const nextObjectUrls: Record<string, string> = {};

      results.forEach((result, index) => {
        const ref = nextRefs[index];

        if (result.status === 'fulfilled' && ref) {
          nextObjectUrls[fileRefKey(ref)] = URL.createObjectURL(result.value);
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
  }, [serializedRefs]);

  return {
    objectUrls,
    isLoading,
  };
}
