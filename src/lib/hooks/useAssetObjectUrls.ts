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
 * How many assets to hold on to after they leave the list, so a filter that
 * removes them and then restores them costs nothing. Retention is per hook
 * instance and released on unmount, so it cannot accumulate across navigation.
 */
const RETAINED_ASSET_LIMIT = 16;

/**
 * Downloads the given assets and exposes object URLs keyed by `getKey`.
 * Items must be JSON-serializable; `getKey` and `download` must have stable
 * identities (e.g. module-level functions) so the effect only re-runs when
 * the item list content changes.
 *
 * The cache is incremental: when the list changes, assets that are still in it
 * keep the object URL they already have, and assets that drop out are retained
 * for a while rather than revoked immediately. Only genuinely new keys are
 * downloaded. A list rebuilt on every keystroke — a filtered archive, say —
 * therefore neither refetches nor blanks images while the filter narrows, and
 * costs nothing when it widens again.
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
  const inFlightKeysRef = useRef<Set<string>>(new Set());
  const wantedKeysRef = useRef<Set<string>>(new Set());
  const retainedKeysRef = useRef<string[]>([]);
  const isMountedRef = useRef(true);
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      revokeObjectUrls(objectUrlsRef.current);
      objectUrlsRef.current = {};
      inFlightKeysRef.current.clear();
      wantedKeysRef.current.clear();
      retainedKeysRef.current = [];
    };
  }, []);

  useEffect(() => {
    const nextItems: T[] = JSON.parse(serializedItems);
    const wantedKeys = new Set(nextItems.map(getKey));

    wantedKeysRef.current = wantedKeys;

    // Assets that left the list join the retention queue instead of being
    // revoked, so restoring the filter does not refetch them.
    const stillRetained = retainedKeysRef.current.filter(
      (key) => !wantedKeys.has(key)
    );

    for (const key of Object.keys(objectUrlsRef.current)) {
      if (wantedKeys.has(key) || stillRetained.includes(key)) continue;
      stillRetained.push(key);
    }

    const evictedKeys = stillRetained.splice(
      0,
      Math.max(0, stillRetained.length - RETAINED_ASSET_LIMIT)
    );

    retainedKeysRef.current = stillRetained;

    for (const key of evictedKeys) {
      const objectUrl = objectUrlsRef.current[key];

      if (!objectUrl) continue;

      URL.revokeObjectURL(objectUrl);
      delete objectUrlsRef.current[key];
    }

    if (evictedKeys.length > 0) {
      setObjectUrls({ ...objectUrlsRef.current });
    }

    const missingItems = nextItems.filter((item) => {
      const key = getKey(item);

      return !objectUrlsRef.current[key] && !inFlightKeysRef.current.has(key);
    });

    if (missingItems.length === 0) {
      setIsLoading(inFlightKeysRef.current.size > 0);

      return;
    }

    for (const item of missingItems) {
      inFlightKeysRef.current.add(getKey(item));
    }

    setIsLoading(true);

    void Promise.allSettled(missingItems.map((item) => download(item))).then(
      (results) => {
        results.forEach((result, index) => {
          const item = missingItems[index];

          if (!item) return;

          const key = getKey(item);

          inFlightKeysRef.current.delete(key);

          if (result.status !== 'fulfilled') return;

          const objectUrl = URL.createObjectURL(result.value);

          // Nothing can use it after unmount, so revoke rather than leak.
          if (!isMountedRef.current) {
            URL.revokeObjectURL(objectUrl);

            return;
          }

          objectUrlsRef.current[key] = objectUrl;

          // The list moved on while this was in flight. Keep it, but queue it
          // for eviction so the retention cap still bounds it.
          if (
            !wantedKeysRef.current.has(key) &&
            !retainedKeysRef.current.includes(key)
          ) {
            retainedKeysRef.current.push(key);
          }
        });

        if (!isMountedRef.current) return;

        setObjectUrls({ ...objectUrlsRef.current });
        setIsLoading(inFlightKeysRef.current.size > 0);
      }
    );
  }, [serializedItems, getKey, download]);

  return {
    objectUrls,
    isLoading,
  };
}
