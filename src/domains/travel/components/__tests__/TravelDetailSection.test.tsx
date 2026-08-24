import { screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TravelDetailSection } from '@/domains/travel/components/TravelDetailSection';
import type { TravelDetail } from '@/domains/travel/types';
import { renderWithMinimalProviders } from '@/test/helpers/render';

// ── Asset download mock (avoids real network calls for cover/place/album photos) ──

vi.mock('@/domains/travel/api/travel-files-api', () => ({
  travelFilesApi: {
    downloadTravelFile: vi.fn(async (fileId: string) => {
      return new File([fileId], `${fileId}.png`, { type: 'image/png' });
    }),
  },
}));

beforeEach(() => {
  vi.spyOn(URL, 'createObjectURL').mockImplementation(
    (blob) => `blob:${(blob as File).name}`
  );
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Fixture: a multi-day trip with photos, places, a review, and tags ──────────
// (exercises the long-page case, not just a one-day trip)

const travel: TravelDetail = {
  id: 'item-1',
  travelId: 'travel-1',
  title: '가을 부산 여행',
  region: '부산',
  startDate: '2025-10-01',
  endDate: '2025-10-03',
  displayStartDate: '2025.10.01',
  displayEndDate: '2025.10.03',
  dateRangeLabel: '2025.10.01 – 2025.10.03',
  nightsDaysLabel: '2박 3일',
  coverPhotoId: 'cover-file',
  oneLineReview: '단풍이 예뻤던 여행',
  nights: 2,
  days: 3,
  travelDays: [
    {
      id: 'day-1',
      travelId: 'travel-1',
      date: '2025-10-01',
      displayDate: '2025.10.01',
      title: '도착과 해변 산책',
      memo: '비행기가 늦어서 저녁에 도착했다.',
      coverPhotoId: null,
      dayNumber: 1,
      sortOrder: 0,
      places: [
        {
          id: 'place-1',
          name: '해운대 해변',
          category: 'TOURIST_SPOT',
          address: null,
          memo: '노을이 예뻤다',
          description: null,
          coverPhotoId: null,
          sortOrder: 0,
          photos: [
            {
              id: 'photo-place-1',
              travelId: 'travel-1',
              travelDayId: 'day-1',
              travelPlaceId: 'place-1',
              photoFileId: 'file-place-1',
              caption: '해변 사진',
              sortOrder: 0,
            },
          ],
        },
      ],
      photos: [],
    },
    {
      id: 'day-2',
      travelId: 'travel-1',
      date: '2025-10-02',
      displayDate: '2025.10.02',
      title: null,
      memo: '온종일 시장 구경',
      coverPhotoId: null,
      dayNumber: 2,
      sortOrder: 1,
      places: [],
      photos: [],
    },
    {
      id: 'day-3',
      travelId: 'travel-1',
      date: '2025-10-03',
      displayDate: '2025.10.03',
      title: '귀가',
      memo: null,
      coverPhotoId: null,
      dayNumber: 3,
      sortOrder: 2,
      places: [],
      photos: [],
    },
  ],
  places: [],
  photos: [
    {
      id: 'photo-1',
      travelId: 'travel-1',
      travelDayId: 'day-1',
      travelPlaceId: null,
      photoFileId: 'file-album-1',
      caption: '앨범 사진 1',
      sortOrder: 0,
    },
    {
      id: 'photo-2',
      travelId: 'travel-1',
      travelDayId: 'day-2',
      travelPlaceId: null,
      photoFileId: 'file-album-2',
      caption: '앨범 사진 2',
      sortOrder: 1,
    },
  ],
  files: [],
  tags: [{ name: '부산' }, { name: '가을여행' }],
  review: {
    oneLineSummary: '한 줄 총평: 단풍이 예뻤다',
    goodPoint: '날씨가 좋았다',
    badPoint: '비행기가 늦었다',
    revisitPlace: '해운대 해변',
    finalReview: '다음에 또 가고 싶다',
  },
};

describe('TravelDetailSection', () => {
  it('drops the KPI stat row and the anchor tab bar', () => {
    renderWithMinimalProviders(
      <TravelDetailSection device='main' travel={travel} />
    );

    // No stat-row chrome: neither the labels nor a "N장/N곳/N일" count block.
    expect(screen.queryByText('장소')).toBeNull();
    expect(screen.queryByText('사진')).toBeNull();
    expect(document.querySelector('.slcn-travel-detail__stats')).toBeNull();

    // No section-jump nav: no nav landmark for in-page navigation, and none
    // of the former pill buttons exist.
    expect(
      screen.queryByRole('navigation', { name: '페이지 내 섹션 이동' })
    ).toBeNull();
    expect(screen.queryByRole('button', { name: '날짜별 기록' })).toBeNull();
    expect(screen.queryByRole('button', { name: '사진 앨범' })).toBeNull();
  });

  it('keeps every piece of content present and reachable by scrolling', async () => {
    renderWithMinimalProviders(
      <TravelDetailSection device='main' travel={travel} />
    );

    // Hero / title block
    expect(
      screen.getByRole('heading', { name: '가을 부산 여행' })
    ).toBeTruthy();
    expect(screen.getByText('부산')).toBeTruthy();
    expect(screen.getByText('2025.10.01 – 2025.10.03')).toBeTruthy();
    expect(screen.getByText('단풍이 예뻤던 여행')).toBeTruthy();

    // Every day, in order, each still carrying its own date for orientation
    // (the rail), with no anchor-jump needed to reach any of them.
    const daysSection = document.getElementById('section-days') as HTMLElement;
    expect(within(daysSection).getByText('도착과 해변 산책')).toBeTruthy();
    expect(within(daysSection).getByText('온종일 시장 구경')).toBeTruthy();
    expect(within(daysSection).getByText('귀가')).toBeTruthy();
    expect(within(daysSection).getByText('Day 1')).toBeTruthy();
    expect(within(daysSection).getByText('Day 2')).toBeTruthy();
    expect(within(daysSection).getByText('Day 3')).toBeTruthy();
    expect(within(daysSection).getByText('해운대 해변')).toBeTruthy();

    // Photo album section: every photo present (grid defaults to 'all')
    const albumSection = document.getElementById(
      'section-album'
    ) as HTMLElement;
    await waitFor(() => {
      expect(within(albumSection).getAllByLabelText(/앨범 사진/).length).toBe(
        2
      );
    });

    // Review section: every field
    const reviewSection = document.getElementById(
      'section-review'
    ) as HTMLElement;
    expect(within(reviewSection).getByText('날씨가 좋았다')).toBeTruthy();
    expect(within(reviewSection).getByText('비행기가 늦었다')).toBeTruthy();
    expect(within(reviewSection).getByText('다음에 또 가고 싶다')).toBeTruthy();

    // Tags section: every tag
    const tagsSection = document.getElementById('section-tags') as HTMLElement;
    expect(within(tagsSection).getByText('#부산')).toBeTruthy();
    expect(within(tagsSection).getByText('#가을여행')).toBeTruthy();
  });
});
