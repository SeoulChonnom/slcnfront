import { describe, expect, it } from 'vitest';
import { buildTravelFileBoxItems } from '@/domains/travel/mappers/travel-payload';

describe('buildTravelFileBoxItems', () => {
  it('returns [] when neither a cover nor album files are given', () => {
    expect(
      buildTravelFileBoxItems({ coverFileId: null, albumFileIds: [] })
    ).toEqual([]);
  });

  it('builds a single COVER entry when only a cover file is given', () => {
    expect(
      buildTravelFileBoxItems({ coverFileId: 'cover-1', albumFileIds: [] })
    ).toEqual([
      {
        fileAssetId: 'cover-1',
        targetType: 'TRAVEL',
        role: 'COVER',
        sortOrder: 0,
      },
    ]);
  });

  it('builds sequenced GALLERY entries when only album files are given', () => {
    expect(
      buildTravelFileBoxItems({
        coverFileId: null,
        albumFileIds: ['album-1', 'album-2', 'album-3'],
      })
    ).toEqual([
      {
        fileAssetId: 'album-1',
        targetType: 'TRAVEL',
        role: 'GALLERY',
        sortOrder: 0,
      },
      {
        fileAssetId: 'album-2',
        targetType: 'TRAVEL',
        role: 'GALLERY',
        sortOrder: 1,
      },
      {
        fileAssetId: 'album-3',
        targetType: 'TRAVEL',
        role: 'GALLERY',
        sortOrder: 2,
      },
    ]);
  });

  it('puts the COVER entry first and never sets targetId when both are given', () => {
    const result = buildTravelFileBoxItems({
      coverFileId: 'cover-1',
      albumFileIds: ['album-1', 'album-2'],
    });

    expect(result).toEqual([
      {
        fileAssetId: 'cover-1',
        targetType: 'TRAVEL',
        role: 'COVER',
        sortOrder: 0,
      },
      {
        fileAssetId: 'album-1',
        targetType: 'TRAVEL',
        role: 'GALLERY',
        sortOrder: 0,
      },
      {
        fileAssetId: 'album-2',
        targetType: 'TRAVEL',
        role: 'GALLERY',
        sortOrder: 1,
      },
    ]);
    expect(result.every((item) => !('targetId' in item))).toBe(true);
  });
});
