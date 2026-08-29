import { useCallback, useEffect, useRef, useState } from 'react';

/** Start fetching a little before the element scrolls into view. */
const DEFAULT_ROOT_MARGIN = '300px';

/**
 * Tracks which keyed elements have reached (or come near) the viewport, so a
 * caller can download only the assets a reader can actually see.
 *
 * `loading="lazy"` cannot do this here: image `src` values are `blob:` URLs
 * produced by an authenticated fetch, so by the time the `<img>` exists the
 * download has already happened. The asset endpoint requires the X-AUTH-TOKEN
 * header, which an `<img>` cannot send, so the fetch cannot move into the tag.
 *
 * Keys are sticky — once visible, an asset stays requested, matching native
 * lazy loading, which never unloads an image that scrolled away.
 *
 * Without IntersectionObserver (jsdom, older browsers) every observed key is
 * marked visible immediately, degrading to the previous eager behaviour rather
 * than showing nothing.
 */
export function useVisibleAssetKeys(rootMargin: string = DEFAULT_ROOT_MARGIN) {
  const [visibleKeys, setVisibleKeys] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const visibleKeysRef = useRef<ReadonlySet<string>>(visibleKeys);
  const keysByNodeRef = useRef(new WeakMap<Element, string>());
  const observerRef = useRef<IntersectionObserver | null>(null);

  visibleKeysRef.current = visibleKeys;

  const markVisible = useCallback((key: string) => {
    setVisibleKeys((current) => {
      if (current.has(key)) return current;

      const next = new Set(current);

      next.add(key);

      return next;
    });
  }, []);

  const resolveObserver = useCallback(() => {
    if (observerRef.current) return observerRef.current;
    if (typeof IntersectionObserver === 'undefined') return null;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const key = keysByNodeRef.current.get(entry.target);

          if (!key) continue;

          observerRef.current?.unobserve(entry.target);
          markVisible(key);
        }
      },
      { rootMargin }
    );

    return observerRef.current;
  }, [markVisible, rootMargin]);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    },
    []
  );

  const observe = useCallback(
    (key: string | null | undefined) => (node: Element | null) => {
      if (!key || !node || visibleKeysRef.current.has(key)) return;

      const observer = resolveObserver();

      if (!observer) {
        markVisible(key);

        return;
      }

      keysByNodeRef.current.set(node, key);
      observer.observe(node);

      return () => {
        observer.unobserve(node);
        keysByNodeRef.current.delete(node);
      };
    },
    [markVisible, resolveObserver]
  );

  return { visibleKeys, observe };
}
