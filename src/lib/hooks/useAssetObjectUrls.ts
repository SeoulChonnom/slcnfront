import { useEffect, useMemo, useRef, useState } from 'react';

export type AssetObjectUrlsOptions<T> = {
  getKey: (item: T) => string;
  download: (item: T) => Promise<Blob>;
};

function normalizeItems<T>(
  items: Array<T | null | undefined>,
  getKey: (item: T) => string
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    if (!item) continue;
    const key = getKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

function revokeObjectUrls(record: Record<string, string>) {
  Object.values(record).forEach((objectUrl) => {
    URL.revokeObjectURL(objectUrl);
  });
}

/**
 * Downloads the given assets and exposes object URLs keyed by `getKey`.
 * Items must be JSON-serializable; `getKey` and `download` must have stable
 * identities (e.g. module-level functions) so the effect only re-runs when
 * the item list content changes.
 */
export function useAssetObjectUrls<T>(
  items: Array<T | null | undefined>,
  options: AssetObjectUrlsOptions<T>
) {
  const { getKey, download } = options;
  const normalizedItems = useMemo(
    () => normalizeItems(items, getKey),
    [items, getKey]
  );
  const serializedItems = JSON.stringify(normalizedItems);
  const objectUrlsRef = useRef<Record<string, string>>({});
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const nextItems: T[] = JSON.parse(serializedItems);

    if (nextItems.length === 0) {
      revokeObjectUrls(objectUrlsRef.current);
      objectUrlsRef.current = {};
      setObjectUrls({});
      setIsLoading(false);

      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);

    void Promise.allSettled(nextItems.map((item) => download(item))).then(
      (results) => {
        if (cancelled) {
          return;
        }

        const nextObjectUrls: Record<string, string> = {};

        results.forEach((result, index) => {
          const item = nextItems[index];

          if (result.status === 'fulfilled' && item) {
            nextObjectUrls[getKey(item)] = URL.createObjectURL(result.value);
          }
        });

        revokeObjectUrls(objectUrlsRef.current);
        objectUrlsRef.current = nextObjectUrls;
        setObjectUrls(nextObjectUrls);
        setIsLoading(false);
      }
    );

    return () => {
      cancelled = true;
      revokeObjectUrls(objectUrlsRef.current);
      objectUrlsRef.current = {};
    };
  }, [serializedItems, getKey, download]);

  return {
    objectUrls,
    isLoading,
  };
}
