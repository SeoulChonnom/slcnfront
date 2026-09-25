import { describe, expect, it } from 'vitest';
import { buildTravelFileBoxItems } from '@/domains/travel/mappers/travel-payload';
import type { FileBoxItem } from '@/domains/travel/types';

const existingItems: FileBoxItem[] = [
  {
    id: 'item-cover',
    fileAssetId: 'old-cover',
    targetType: 'TRAVEL',
    targetId: null,
    role: 'COVER',
    caption: null,
    sortOrder: 0,
  },
  {
    id: 'item-album-0',
    fileAssetId: 'old-album-0',
    rawFileAssetId: 'old-raw-0',
    targetType: 'TRAVEL',
    targetId: null,
    role: 'GALLERY',
    caption: '첫날 아침',
    sortOrder: 0,
  },
  {
    id: 'item-album-1',
    fileAssetId: 'old-album-1',
    targetType: 'TRAVEL',
    targetId: null,
    role: 'GALLERY',
    caption: null,
    sortOrder: 1,
  },
  {
    id: 'item-day',
    fileAssetId: 'old-day-photo',
    targetType: 'TRAVEL_DAY',
    targetId: '2026-04-14',
    role: 'GALLERY',
    caption: null,
    sortOrder: 0,
  },
];

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

  describe('on update, where the server replaces the whole list', () => {
    it('keeps every existing item, with its id, when only album photos are added', () => {
      const result = buildTravelFileBoxItems({
        coverFileId: null,
        albumFileIds: ['new-album'],
        existingItems,
      });

      expect(result).toEqual([
        {
          id: 'item-cover',
          fileAssetId: 'old-cover',
          targetType: 'TRAVEL',
          role: 'COVER',
          sortOrder: 0,
        },
        {
          id: 'item-album-0',
          fileAssetId: 'old-album-0',
          rawFileAssetId: 'old-raw-0',
          targetType: 'TRAVEL',
          role: 'GALLERY',
          caption: '첫날 아침',
          sortOrder: 0,
        },
        {
          id: 'item-album-1',
          fileAssetId: 'old-album-1',
          targetType: 'TRAVEL',
          role: 'GALLERY',
          sortOrder: 1,
        },
        {
          id: 'item-day',
          fileAssetId: 'old-day-photo',
          targetType: 'TRAVEL_DAY',
          targetId: '2026-04-14',
          role: 'GALLERY',
          sortOrder: 0,
        },
        {
          fileAssetId: 'new-album',
          targetType: 'TRAVEL',
          role: 'GALLERY',
          sortOrder: 2,
        },
      ]);
    });

    it('swaps only the travel cover for a new one and keeps the rest', () => {
      const result = buildTravelFileBoxItems({
        coverFileId: 'new-cover',
        albumFileIds: [],
        existingItems,
      });

      const covers = result.filter(
        (item) => item.targetType === 'TRAVEL' && item.role === 'COVER'
      );
      expect(covers).toEqual([
        {
          fileAssetId: 'new-cover',
          targetType: 'TRAVEL',
          role: 'COVER',
          sortOrder: 0,
        },
      ]);
      expect(result.map((item) => item.id).filter(Boolean)).toEqual([
        'item-album-0',
        'item-album-1',
        'item-day',
      ]);
    });

    it('ignores items that are not travel photos', () => {
      const result = buildTravelFileBoxItems({
        coverFileId: null,
        albumFileIds: [],
        existingItems: [
          {
            id: 'item-trip',
            fileAssetId: 'trip-logo',
            targetType: 'TRIP',
            targetId: null,
            role: 'LOGO',
            caption: null,
            sortOrder: 0,
          },
        ],
      });

      expect(result).toEqual([]);
    });
  });
});
