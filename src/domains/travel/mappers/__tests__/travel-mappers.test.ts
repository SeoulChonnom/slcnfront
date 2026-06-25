import { describe, expect, it } from 'vitest';
import {
  formatDateRange,
  formatDisplayDate,
  formatNightsDays,
  mapTravelDetailDto,
  mapTravelListItemDto,
} from '../travel-mappers';

describe('travel-mappers', () => {
  describe('formatDisplayDate', () => {
    it('converts YYYY-MM-DD to YYYY.MM.DD', () => {
      expect(formatDisplayDate('2025-07-04')).toBe('2025.07.04');
      expect(formatDisplayDate('2099-12-31')).toBe('2099.12.31');
      expect(formatDisplayDate('2000-01-01')).toBe('2000.01.01');
    });

    it('returns non-matching strings unchanged', () => {
      expect(formatDisplayDate('20250704')).toBe('20250704');
      expect(formatDisplayDate('')).toBe('');
    });
  });

  describe('formatDateRange', () => {
    it('formats a date range as "YYYY.MM.DD – YYYY.MM.DD"', () => {
      expect(formatDateRange('2025-06-01', '2025-06-05')).toBe(
        '2025.06.01 – 2025.06.05'
      );
    });
  });

  describe('formatNightsDays', () => {
    it('formats nights and days as "N박 M일"', () => {
      expect(formatNightsDays(2, 3)).toBe('2박 3일');
      expect(formatNightsDays(0, 1)).toBe('0박 1일');
      expect(formatNightsDays(6, 7)).toBe('6박 7일');
    });
  });

  describe('mapTravelListItemDto', () => {
    const baseDto = {
      id: 'item-1',
      travelId: 'travel-1',
      title: '제주도 여행',
      region: '제주',
      startDate: '2025-06-01',
      endDate: '2025-06-05',
      coverPhotoId: null,
      oneLineReview: '정말 좋았다',
      nights: 4,
      days: 5,
      tags: [
        {
          id: 'tag-1',
          travelId: 'travel-1',
          name: '힐링',
          sortOrder: 0,
        },
      ],
    };

    it('maps all scalar fields from the dto', () => {
      const result = mapTravelListItemDto(baseDto);

      expect(result.id).toBe('item-1');
      expect(result.travelId).toBe('travel-1');
      expect(result.title).toBe('제주도 여행');
      expect(result.region).toBe('제주');
      expect(result.startDate).toBe('2025-06-01');
      expect(result.endDate).toBe('2025-06-05');
      expect(result.nights).toBe(4);
      expect(result.days).toBe(5);
      expect(result.oneLineReview).toBe('정말 좋았다');
    });

    it('computes display and range labels', () => {
      const result = mapTravelListItemDto(baseDto);

      expect(result.displayStartDate).toBe('2025.06.01');
      expect(result.displayEndDate).toBe('2025.06.05');
      expect(result.dateRangeLabel).toBe('2025.06.01 – 2025.06.05');
      expect(result.nightsDaysLabel).toBe('4박 5일');
    });

    it('maps nested tags', () => {
      const result = mapTravelListItemDto(baseDto);

      expect(result.tags).toHaveLength(1);
      expect(result.tags[0]).toEqual({
        id: 'tag-1',
        travelId: 'travel-1',
        name: '힐링',
        sortOrder: 0,
      });
    });

    it('handles empty tags array', () => {
      const result = mapTravelListItemDto({ ...baseDto, tags: [] });

      expect(result.tags).toEqual([]);
    });

    it('passes through null optional fields', () => {
      const result = mapTravelListItemDto({
        ...baseDto,
        coverPhotoId: null,
        oneLineReview: null,
      });

      expect(result.coverPhotoId).toBeNull();
      expect(result.oneLineReview).toBeNull();
    });
  });

  describe('mapTravelDetailDto', () => {
    const basePhoto = {
      id: 'photo-1',
      travelId: 'travel-1',
      travelDayId: 'day-1',
      travelPlaceId: null,
      photoFileId: 'file-1',
      caption: null,
      sortOrder: 0,
    };

    const basePlace = {
      id: 'place-1',
      travelId: 'travel-1',
      travelDayId: 'day-1',
      name: '한라산',
      category: 'TOURIST_SPOT' as const,
      address: '제주특별자치도',
      memo: null,
      description: null,
      coverPhotoId: null,
      sortOrder: 0,
      photos: [basePhoto],
    };

    const baseDay = {
      id: 'day-1',
      travelId: 'travel-1',
      date: '2025-06-01',
      title: '1일차',
      memo: null,
      coverPhotoId: null,
      dayNumber: 1,
      sortOrder: 0,
      places: [basePlace],
      photos: [basePhoto],
    };

    const baseReview = {
      id: 'review-1',
      travelId: 'travel-1',
      content: '좋았어요',
      oneLineSummary: '최고',
      goodPoint: '날씨',
      badPoint: null,
      revisitPlace: null,
      finalReview: null,
    };

    const baseDetailDto = {
      id: 'item-1',
      travelId: 'travel-1',
      title: '제주도 여행',
      region: '제주',
      startDate: '2025-06-01',
      endDate: '2025-06-05',
      coverPhotoId: null,
      oneLineReview: '최고의 여행',
      nights: 4,
      days: 5,
      travelDays: [baseDay],
      places: [basePlace],
      photos: [basePhoto],
      tags: [
        {
          id: 'tag-1',
          travelId: 'travel-1',
          name: '힐링',
          sortOrder: 0,
        },
      ],
      review: baseReview,
    };

    it('maps top-level scalar fields', () => {
      const result = mapTravelDetailDto(baseDetailDto);

      expect(result.id).toBe('item-1');
      expect(result.title).toBe('제주도 여행');
      expect(result.region).toBe('제주');
      expect(result.nights).toBe(4);
      expect(result.days).toBe(5);
      expect(result.nightsDaysLabel).toBe('4박 5일');
      expect(result.dateRangeLabel).toBe('2025.06.01 – 2025.06.05');
    });

    it('maps nested travelDays with places and photos', () => {
      const result = mapTravelDetailDto(baseDetailDto);

      expect(result.travelDays).toHaveLength(1);
      const day = result.travelDays[0];
      expect(day?.id).toBe('day-1');
      expect(day?.date).toBe('2025-06-01');
      expect(day?.displayDate).toBe('2025.06.01');
      expect(day?.places).toHaveLength(1);
      expect(day?.places[0]?.name).toBe('한라산');
      expect(day?.photos).toHaveLength(1);
    });

    it('maps nested places with their photos', () => {
      const result = mapTravelDetailDto(baseDetailDto);

      const place = result.travelDays[0]?.places[0];
      expect(place?.category).toBe('TOURIST_SPOT');
      expect(place?.photos).toHaveLength(1);
      expect(place?.photos[0]?.id).toBe('photo-1');
    });

    it('maps top-level photos and tags', () => {
      const result = mapTravelDetailDto(baseDetailDto);

      expect(result.photos).toHaveLength(1);
      expect(result.tags).toHaveLength(1);
      expect(result.tags[0]?.name).toBe('힐링');
    });

    it('maps the review when present', () => {
      const result = mapTravelDetailDto(baseDetailDto);

      expect(result.review).not.toBeNull();
      expect(result.review?.id).toBe('review-1');
      expect(result.review?.content).toBe('좋았어요');
      expect(result.review?.goodPoint).toBe('날씨');
    });

    it('maps review as null when absent', () => {
      const result = mapTravelDetailDto({ ...baseDetailDto, review: null });

      expect(result.review).toBeNull();
    });
  });
});
