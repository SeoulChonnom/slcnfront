import { type ReactNode, useState } from 'react';

type TravelImageProps = {
  /** Resolved asset URL. Null/undefined means "no photo was ever attached". */
  src: string | null | undefined;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  /**
   * What to draw when there is no image to show. Every caller already sits
   * inside a hatched or striped placeholder box, so most pass `null` and let
   * that box stand on its own.
   */
  fallback?: ReactNode;
};

/**
 * A photo that fails to load and a photo that was never attached are the same
 * thing to the reader, so they get the same quiet placeholder. A bare `<img>`
 * with a dead URL renders a broken-image glyph with the alt text leaking out
 * beside it — the loudest element on a page whose whole premise is that the
 * photographs lead.
 */
export function TravelImage({
  src,
  alt,
  className,
  loading,
  fetchPriority,
  fallback = null,
}: TravelImageProps) {
  // Keyed on the URL rather than a bare boolean so a re-render with a new src
  // gets a fresh attempt instead of inheriting the previous failure.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding='async'
      onError={() => setFailedSrc(src)}
    />
  );
}
