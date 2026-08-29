/**
 * Server-generated size variants for image assets.
 *
 * The asset endpoint never rejects an unknown `variant`: it silently falls back
 * to `home-feature` for reads and to the original for downloads. A typo is
 * therefore invisible at runtime, so this union is the only place a wrong value
 * can be caught. Never widen it to `string`.
 *
 * The sibling `width` parameter is deliberately unused: `width=0` (an element
 * measured before layout) resolves to the original, and a non-numeric value
 * returns 500. Always pass an explicit variant instead.
 */
export type ImageVariant = 'home-feature' | 'home-thumb' | 'original';

/**
 * Query params for an asset request. `original` sends none so the URL stays
 * byte-identical to the pre-variant one and keeps its existing cache entry.
 */
export function toImageVariantQuery(variant: ImageVariant) {
  return variant === 'original' ? undefined : { variant };
}
