import { useEffect, useMemo, useRef, useState } from 'react';
import { travelFilesApi } from '../../api/travel-files-api';

function normalizeFileIds(ids: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const id of ids) {
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }

  return result;
}

function revokeObjectUrls(record: Record<string, string>) {
  Object.values(record).forEach((objectUrl) => {
    URL.revokeObjectURL(objectUrl);
  });
}

export function useTravelAssetObjectUrls(
  ids: Array<string | null | undefined>
) {
  const normalizedIds = useMemo(() => normalizeFileIds(ids), [ids]);
  const serializedIds = JSON.stringify(normalizedIds);
  const objectUrlsRef = useRef<Record<string, string>>({});
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const nextIds: string[] = JSON.parse(serializedIds);

    if (nextIds.length === 0) {
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
      nextIds.map((id) => travelFilesApi.downloadTravelFile(id))
    ).then((results) => {
      if (cancelled) {
        return;
      }

      const nextObjectUrls: Record<string, string> = {};

      results.forEach((result, index) => {
        const id = nextIds[index];

        if (result.status === 'fulfilled' && id) {
          nextObjectUrls[id] = URL.createObjectURL(result.value);
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
  }, [serializedIds]);

  return {
    objectUrls,
    isLoading,
  };
}
