import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeHubPage } from '@/pages/shared/HomeHubPage';
import { renderWithMinimalProviders } from '@/test/helpers/render';

const { getCurrentSchedulesMock, useTravelListMock, useTripListMock } =
  vi.hoisted(() => ({
    getCurrentSchedulesMock: vi.fn(),
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
  scheduleApi: { getCurrentSchedules: getCurrentSchedulesMock },
}));

vi.mock('@/domains/travel/hooks/useTravelAssetUrls', () => ({
  useTravelAssetUrls: () => ({}),
}));

const travel = {
  id: 'travel-1',
  travelId: 'travel-1',
  title: '속초 2박 3일',
  region: '속초',
  startDate: '2025-08-12',
  endDate: '2025-08-14',
  displayStartDate: '2025.08.12',
  displayEndDate: '2025.08.14',
  dateRangeLabel: '2025.08.12 – 2025.08.14',
  nightsDaysLabel: '2박 3일',
  coverPhotoId: null,
  oneLineReview: '바다와 시장 사이를 오래 걸었다.',
  nights: 2,
  days: 3,
  tags: [],
};

const dayOut = {
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
};

function renderHome() {
  return renderWithMinimalProviders(<HomeHubPage device='main' />, {
    route: '/main',
  });
}

describe('HomeHubPage and useHomeTimeline integration', () => {
  it('derives full error and retries all independent sources', async () => {
    const travelRefetch = vi.fn();
    const tripRefetch = vi.fn();
    useTravelListMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('travel failed'),
      refetch: travelRefetch,
    });
    useTripListMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('day-out failed'),
      refetch: tripRefetch,
    });
    getCurrentSchedulesMock.mockRejectedValue(new Error('schedule failed'));

    const { user } = renderHome();

    await waitFor(() => {
      expect(getCurrentSchedulesMock).toHaveBeenCalledTimes(1);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: '여행 기록을 불러오지 못했어요.',
        })
      ).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(travelRefetch).toHaveBeenCalledTimes(1);
    expect(tripRefetch).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(getCurrentSchedulesMock).toHaveBeenCalledTimes(2);
    });
  });

  it('keeps a successful travel source visible when schedules fail', async () => {
    useTravelListMock.mockReturnValue({
      data: [travel],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    useTripListMock.mockReturnValue({
      data: [dayOut],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    getCurrentSchedulesMock.mockRejectedValue(new Error('schedule failed'));

    renderHome();

    await waitFor(() => {
      expect(screen.getByRole('article').textContent).toContain('속초 2박 3일');
      expect(screen.getByText('일정 정보를 불러오지 못했어요.')).toBeTruthy();
    });
    expect(screen.queryByText('여행 기록을 불러오지 못했어요.')).toBeNull();
  });
});
