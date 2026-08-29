import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { scheduleApi } from '@/domains/calendar/api/schedule-api';
import { useHomeTimeline } from '@/domains/home/hooks/useHomeTimeline';
import { createTestQueryClient } from '@/test/helpers/query-client';

const { useTravelListMock, useTripListMock } = vi.hoisted(() => ({
  useTravelListMock: vi.fn(),
  useTripListMock: vi.fn(),
}));

vi.mock('@/domains/travel/hooks/useTravelList', () => ({
  useTravelList: useTravelListMock,
}));

vi.mock('@/domains/trip/hooks/useTripList', () => ({
  useTripList: useTripListMock,
}));

vi.mock('@/domains/calendar/api/schedule-api', () => ({
  scheduleApi: {
    getCurrentSchedules: vi.fn(),
  },
}));

const travelItems = [
  {
    id: 'travel-old',
    travelId: 'travel-old',
    title: '제주 겨울',
    region: '제주',
    startDate: '2023-01-10',
    endDate: '2023-01-13',
    displayStartDate: '2023.01.10',
    displayEndDate: '2023.01.13',
    dateRangeLabel: '2023.01.10 – 2023.01.13',
    nightsDaysLabel: '3박 4일',
    coverPhotoId: 'cover-old',
    oneLineReview: '귤밭을 천천히 걸었다.',
    nights: 3,
    days: 4,
    tags: [],
  },
  {
    id: 'travel-new',
    travelId: 'travel-new',
    title: '속초 2박 3일',
    region: '속초',
    startDate: '2025-08-12',
    endDate: '2025-08-14',
    displayStartDate: '2025.08.12',
    displayEndDate: '2025.08.14',
    dateRangeLabel: '2025.08.12 – 2025.08.14',
    nightsDaysLabel: '2박 3일',
    coverPhotoId: 'cover-new',
    oneLineReview: '바다를 오래 걸었다.',
    nights: 2,
    days: 3,
    tags: [{ name: '바다' }],
  },
] as const;

const tripItems = [
  {
    id: 'trip-1',
    date: '2025-07-01',
    type: 'AYO' as const,
    name: '남산 야경',
    description: '천천히 걸었다',
    displayDate: '2025.07.01',
    logo: {
      fileId: 'logo-1',
      type: 'image',
      originalFilename: 'logo.png',
      filename: 'logo.png',
      path: 'logo/logo.png',
      mimeType: 'image/png',
      size: 100,
    },
  },
] as const;

function createWrapper() {
  const client = createTestQueryClient();

  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('useHomeTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the complete travel archive and independent secondary sources', async () => {
    const travelRefetch = vi.fn();
    const tripRefetch = vi.fn();

    useTravelListMock.mockReturnValue({
      data: [...travelItems],
      isLoading: false,
      isError: false,
      error: null,
      refetch: travelRefetch,
    });
    useTripListMock.mockReturnValue({
      data: [...tripItems],
      isLoading: false,
      isError: false,
      error: null,
      refetch: tripRefetch,
    });
    vi.mocked(scheduleApi.getCurrentSchedules).mockResolvedValue([
      {
        id: 'schedule-1',
        calendarId: 'calendar-1',
        title: '오늘 저녁',
        body: '',
        start: '2099-08-25T18:00:00+09:00',
        end: '2099-08-25T20:00:00+09:00',
        allDay: false,
        location: '을지로',
      },
    ]);

    const { result } = renderHook(() => useHomeTimeline(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.sources.schedules.status).toBe('ready');
    });

    expect(result.current.travels.map((travel) => travel.id)).toEqual([
      'travel-new',
      'travel-old',
    ]);
    expect(
      result.current.nearestSchedules.map((schedule) => schedule.id)
    ).toEqual(['schedule-1']);
    expect(result.current.dayOuts.map((trip) => trip.id)).toEqual(['trip-1']);
    expect(result.current.sources.travels.status).toBe('ready');
    expect(result.current.sources.dayOuts.status).toBe('ready');
    expect(result.current.isPartialFailure).toBe(false);
    expect('upcoming' in result.current).toBe(false);
    expect('past' in result.current).toBe(false);
  });

  it('marks a source loading when its query is pending even if only isPending is provided', () => {
    // Catches treating React Query's pending state as ready when a test or
    // adapter omits the derived isLoading flag.
    useTravelListMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isPending: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    useTripListMock.mockReturnValue({
      data: [...tripItems],
      isLoading: false,
      isPending: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(scheduleApi.getCurrentSchedules).mockResolvedValue([]);

    const { result } = renderHook(() => useHomeTimeline(), {
      wrapper: createWrapper(),
    });

    expect(result.current.sources.travels.status).toBe('loading');
  });

  it('keeps successful records visible and exposes retryable partial failures', async () => {
    const travelRefetch = vi.fn();

    useTravelListMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('travel failed'),
      refetch: travelRefetch,
    });
    useTripListMock.mockReturnValue({
      data: [...tripItems],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(scheduleApi.getCurrentSchedules).mockRejectedValue(
      new Error('schedule failed')
    );

    const { result } = renderHook(() => useHomeTimeline(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.sources.schedules.status).toBe('error');
    });

    expect(result.current.sources.travels.status).toBe('error');
    expect(result.current.sources.dayOuts.status).toBe('ready');
    expect(result.current.dayOuts).toHaveLength(1);
    expect(result.current.isPartialFailure).toBe(true);

    result.current.sources.travels.retry();
    result.current.sources.schedules.retry();
    expect(travelRefetch).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(scheduleApi.getCurrentSchedules).toHaveBeenCalledTimes(2);
    });
  });
});
