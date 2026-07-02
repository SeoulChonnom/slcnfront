import { describe, expect, it } from 'vitest';
import { AppError } from '../../../../lib/api/errors';
import {
  parseTravelDetailResponse,
  parseTravelListResponse,
  parseTravelRdoResponse,
  travelCdoSchema,
  travelDetailRdoSchema,
  travelRdoSchema,
  travelUdoSchema,
} from '../travel-schemas';

const validFileBoxItem = {
  id: 'fbox-1',
  fileAssetId: 'asset-1',
  targetType: 'TRAVEL_DAY',
  targetId: 'day-1',
  role: 'GALLERY',
  caption: null,
  sortOrder: 0,
  file: {
    fileId: 'f-1',
    type: 'image/jpeg',
    filename: 'photo.jpg',
    path: '/uploads/photo.jpg',
  },
};

const validTravelRdo = {
  id: 'item-1',
  travelId: 'travel-1',
  title: '제주도 여행',
  region: '제주',
  startDate: '2025-06-01',
  endDate: '2025-06-05',
  cover: null,
  oneLineReview: '좋았어요',
  nights: 4,
  days: 5,
  tags: ['힐링'],
};

const validPlace = {
  placeKey: 'place-1',
  name: '한라산',
  category: 'TOURIST_SPOT',
  address: null,
  memo: null,
  description: null,
  cover: null,
  sortOrder: 0,
  photos: [],
};

const validDay = {
  id: 'day-1',
  travelId: 'travel-1',
  date: '2025-06-01',
  title: '1일차',
  memo: null,
  cover: null,
  dayNumber: 1,
  sortOrder: 0,
  places: [validPlace],
  photos: [validFileBoxItem],
};

const validDetailRdo = {
  id: 'item-1',
  travelId: 'travel-1',
  title: '제주도 여행',
  region: '제주',
  startDate: '2025-06-01',
  endDate: '2025-06-05',
  cover: null,
  oneLineReview: '좋았어요',
  nights: 4,
  days: 5,
  travelDays: [validDay],
  files: [],
  tags: ['힐링'],
  review: null,
};

describe('travel-schemas', () => {
  describe('travelRdoSchema', () => {
    it('parses a valid travel rdo payload', () => {
      const result = travelRdoSchema.safeParse(validTravelRdo);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('item-1');
        expect(result.data.tags).toHaveLength(1);
      }
    });

    it('defaults tags to empty array when absent', () => {
      const { tags: _tags, ...withoutTags } = validTravelRdo;
      const result = travelRdoSchema.safeParse(withoutTags);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual([]);
      }
    });

    it('fails when tags contains a non-string value', () => {
      const badPayload = {
        ...validTravelRdo,
        tags: [{ name: '힐링' }],
      };
      const result = travelRdoSchema.safeParse(badPayload);

      expect(result.success).toBe(false);
    });

    it('fails when a required field (title) is missing', () => {
      const { title: _title, ...noTitle } = validTravelRdo;
      const result = travelRdoSchema.safeParse(noTitle);

      expect(result.success).toBe(false);
    });
  });

  describe('travelDetailRdoSchema', () => {
    it('parses a valid detail rdo payload', () => {
      const result = travelDetailRdoSchema.safeParse(validDetailRdo);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.travelDays).toHaveLength(1);
        expect(result.data.review).toBeNull();
      }
    });

    it('parses when review is present', () => {
      const withReview = {
        ...validDetailRdo,
        review: {
          oneLineSummary: null,
          goodPoint: null,
          badPoint: null,
          revisitPlace: null,
          finalReview: null,
        },
      };
      const result = travelDetailRdoSchema.safeParse(withReview);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.review).not.toBeNull();
        expect(result.data.review?.oneLineSummary).toBeNull();
      }
    });
  });

  describe('parseTravelListResponse', () => {
    it('parses a valid list payload', () => {
      const parsed = parseTravelListResponse([validTravelRdo]);

      expect(parsed).toHaveLength(1);
      expect(parsed[0]?.id).toBe('item-1');
    });

    it('throws INVALID_RESPONSE when sortOrder is not a number', () => {
      expect(() =>
        parseTravelListResponse([{ ...validTravelRdo, nights: 'four' }])
      ).toThrow(AppError);

      expect(() =>
        parseTravelListResponse([{ ...validTravelRdo, nights: 'four' }])
      ).toThrow('Travel list response payload is invalid.');
    });

    it('throws INVALID_RESPONSE when required field is missing', () => {
      const { title: _title, ...noTitle } = validTravelRdo;
      expect(() => parseTravelListResponse([noTitle])).toThrow(AppError);
    });

    it('throws INVALID_RESPONSE when payload is not an array', () => {
      expect(() => parseTravelListResponse(validTravelRdo)).toThrow(AppError);
    });
  });

  describe('parseTravelDetailResponse', () => {
    it('parses a valid detail payload', () => {
      const parsed = parseTravelDetailResponse(validDetailRdo, 'detail');

      expect(parsed.id).toBe('item-1');
      expect(parsed.travelDays).toHaveLength(1);
    });

    it('throws INVALID_RESPONSE when place category is invalid', () => {
      const badDetail = {
        ...validDetailRdo,
        travelDays: [
          {
            ...validDay,
            places: [{ ...validPlace, category: 'UNKNOWN_CATEGORY' }],
          },
        ],
      };
      expect(() => parseTravelDetailResponse(badDetail, 'detail')).toThrow(
        AppError
      );
    });

    it('throws INVALID_RESPONSE on create context when payload is malformed', () => {
      expect(() =>
        parseTravelDetailResponse({ ...validDetailRdo, title: 42 }, 'create')
      ).toThrow(AppError);
    });

    it('throws INVALID_RESPONSE on update context when payload is malformed', () => {
      expect(() =>
        parseTravelDetailResponse({ ...validDetailRdo, days: 'five' }, 'update')
      ).toThrow(AppError);
    });
  });

  describe('travelCdoSchema', () => {
    const validCdo = {
      title: '제주도 여행',
      region: '제주',
      startDate: '2025-06-01',
      endDate: '2025-06-05',
      tags: ['힐링'],
      travelDays: [
        {
          date: '2025-06-01',
          sortOrder: 0,
          photos: [],
          places: [
            {
              name: '한라산',
              category: 'TOURIST_SPOT',
              sortOrder: 0,
              photos: [],
            },
          ],
        },
      ],
      photos: [],
      review: { content: '좋았어요' },
    };

    it('parses a full nested create payload', () => {
      const result = travelCdoSchema.safeParse(validCdo);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.travelDays).toHaveLength(1);
        expect(result.data.travelDays[0]?.places[0]?.name).toBe('한라산');
      }
    });

    it('fails when a nested place category is invalid', () => {
      const badCdo = {
        ...validCdo,
        travelDays: [
          {
            ...validCdo.travelDays[0],
            places: [
              {
                name: '한라산',
                category: 'UNKNOWN',
                sortOrder: 0,
                photos: [],
              },
            ],
          },
        ],
      };
      const result = travelCdoSchema.safeParse(badCdo);

      expect(result.success).toBe(false);
    });

    it('fails when travelDays is missing', () => {
      const { travelDays: _days, ...withoutDays } = validCdo;
      const result = travelCdoSchema.safeParse(withoutDays);

      expect(result.success).toBe(false);
    });
  });

  describe('travelUdoSchema', () => {
    it('parses a full nested update payload with confirmDeleteDays', () => {
      const result = travelUdoSchema.safeParse({
        title: '제주도 여행',
        region: '제주',
        startDate: '2025-06-01',
        endDate: '2025-06-05',
        tags: [],
        confirmDeleteDays: true,
        travelDays: [],
        photos: [],
        review: {},
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.confirmDeleteDays).toBe(true);
      }
    });

    it('fails when confirmDeleteDays is missing', () => {
      const result = travelUdoSchema.safeParse({
        title: '제주도 여행',
        region: '제주',
        startDate: '2025-06-01',
        endDate: '2025-06-05',
        tags: [],
        travelDays: [],
        photos: [],
        review: {},
      });

      expect(result.success).toBe(false);
    });
  });

  describe('parseTravelRdoResponse', () => {
    it('parses a valid single rdo payload', () => {
      const parsed = parseTravelRdoResponse(validTravelRdo);

      expect(parsed.id).toBe('item-1');
      expect(parsed.region).toBe('제주');
    });

    it('throws INVALID_RESPONSE for malformed payload', () => {
      expect(() =>
        parseTravelRdoResponse({ ...validTravelRdo, nights: 'four' })
      ).toThrow(AppError);
    });
  });
});
