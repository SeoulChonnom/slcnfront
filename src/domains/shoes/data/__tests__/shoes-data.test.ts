import { describe, expect, it } from 'vitest';
import { getShoesCatalog } from '../shoes-data';

describe('shoes-data', () => {
  it('exports the shoes catalog in the final domain shape', () => {
    const catalog = getShoesCatalog();

    expect(catalog).toHaveLength(3);
    expect(catalog[0]?.brandId).toBe('nb');
    expect(catalog[1]?.shoes[1]?.videoUrl).toMatch(/mjV2K\.mp4/);
    expect(catalog[2]?.shoes[0]?.reviews[1]?.imageUrl).toMatch(
      /AsicsJogReview2\.png/
    );
    expect(catalog[1]?.shoes[0]?.info).toHaveLength(3);
  });

  it('stores shoes with explicit null media fields instead of relying on normalization', () => {
    const catalog = getShoesCatalog();
    const nb574 = catalog[0]?.shoes[0];

    expect(nb574?.videoLink).toBeNull();
    expect(nb574?.videoUrl).toBeNull();
    expect(nb574?.videoDesc).toBeNull();
  });
});
