import {
  type ImageVariant,
  toImageVariantQuery,
} from '@/lib/api/image-variant';
import { getAppEnv } from '@/lib/env/env';

/**
 * Direct URL for an image asset, for use as an `<img src>`.
 *
 * The endpoint accepts the session cookie, which the browser attaches to the
 * request on its own, so images no longer have to be fetched with an
 * `X-AUTH-TOKEN` header and handed to `URL.createObjectURL`. That is what lets
 * `loading="lazy"` and `fetchPriority` work, keeps the decoded image in the
 * browser cache, and drops the CORS preflight each fetch used to trigger.
 *
 * `original` sends no query param so the URL stays byte-identical to the one
 * the app has always requested, preserving existing cache entries.
 */
export function buildAssetImageUrl(
  fileId: string,
  variant: ImageVariant = 'original'
) {
  const baseUrl = getAppEnv().apiUrl;
  const url = new URL(
    `assets/files/${encodeURIComponent(fileId)}`,
    baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  );

  for (const [key, value] of Object.entries(
    toImageVariantQuery(variant) ?? {}
  )) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

/** Same as {@link buildAssetImageUrl}, but tolerates a missing id. */
export function buildOptionalAssetImageUrl(
  fileId: string | null | undefined,
  variant: ImageVariant = 'original'
) {
  return fileId ? buildAssetImageUrl(fileId, variant) : null;
}
