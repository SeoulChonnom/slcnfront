import { describe, expect, it } from 'vitest';
import { getShoesCatalog } from '../shoes-data';

describe('shoes-data', () => {
  it('exports the shoes catalog in the final domain shape', () => {
    const catalog = getShoesCatalog();

    expect(catalog).toHaveLength(3);
    expect(catalog[0]?.brandId).toBe('nb');
    expect(catalog[1]?.shoes[1]?.videoUrl).toMatch(/mjV2K\.mp4/);
    expect(catalog[2]?.shoes[0]?.reviews[1]?.imageUrl).toMatch(
      /AsicsJogReview2\.webp/
    );
    expect(catalog[1]?.shoes[0]?.info).toHaveLength(3);
  });

  it('stores shoes with explicit null media fields instead of relying on normalization', () => {
    const catalog = getShoesCatalog();
    const nb574 = catalog[0]?.shoes[0];

    expect(nb574?.videoLink).toBeNull();
    expect(nb574?.videoUrl).toBeNull();
    expect(nb574?.videoPosterUrl).toBeNull();
    expect(nb574?.videoDesc).toBeNull();
  });

  it('pairs every self-hosted clip with a poster frame', () => {
    const withVideo = getShoesCatalog()
      .flatMap((brand) => brand.shoes)
      .filter((shoe) => shoe.videoUrl !== null);

    expect(withVideo.length).toBeGreaterThan(0);

    for (const shoe of withVideo) {
      // Without a poster the panel opens on an empty black box, which says
      // nothing about what the clip holds.
      expect(shoe.videoPosterUrl).toMatch(/\.webp$/);
    }
  });
});
