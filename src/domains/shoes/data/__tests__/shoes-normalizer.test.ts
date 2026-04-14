import { describe, expect, it } from 'vitest';
import { rawGlobalShoes } from '../shoes-data';
import { normalizeShoesCatalog } from '../shoes-normalizer';

describe('normalizeShoesCatalog', () => {
  it('converts legacy shoe data into a typed brand catalog', () => {
    const catalog = normalizeShoesCatalog(rawGlobalShoes);

    expect(catalog).toHaveLength(3);
    expect(catalog[0]?.brandId).toBe('nb');
    expect(catalog[1]?.shoes[1]?.videoUrl).toMatch(/mjV2K\.mp4/);
    expect(catalog[2]?.shoes[0]?.reviews[1]?.imageUrl).toMatch(
      /AsicsJogReview2\.png/,
    );
    expect(catalog[1]?.shoes[0]?.info).toHaveLength(3);
  });
});
