import { screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import type { HomeRetrievalModel } from '@/domains/home/types';
import { HomePage as MainHomePage } from '@/pages/main/HomePage';
import { HomePage as MobileHomePage } from '@/pages/mobile/HomePage';
import { renderWithMinimalProviders } from '@/test/helpers/render';

const travel = {
  id: 'travel-1',
  travelId: 'travel-1',
  title: '속초 2박 3일',
  region: '속초',
  startDate: '2026-07-10',
  endDate: '2026-07-12',
  displayStartDate: '2026.07.10',
  displayEndDate: '2026.07.12',
  dateRangeLabel: '2026.07.10 – 2026.07.12',
  nightsDaysLabel: '2박 3일',
  coverPhotoId: 'cover-1',
  oneLineReview: '바다가 좋았다.',
  nights: 2,
  days: 3,
  tags: [],
};

const schedule = {
  id: 'schedule-1',
  calendarId: 'calendar-1',
  title: '성수 산책',
  body: '',
  start: '2099-09-01T09:00:00+09:00',
  end: '2099-09-01T11:00:00+09:00',
  allDay: false,
  location: '성수동',
};

const dayOut = {
  id: 'trip-1',
  date: '2026-06-20',
  type: 'AYO' as const,
  name: '남산 야경',
  description: '계단이 많았다',
  displayDate: '2026.06.20',
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

const source = <T,>(data: T[]) => ({
  data,
  status: 'ready' as const,
  isLoading: false,
  isError: false,
  error: null,
  retry: vi.fn(),
});

const homeModel: HomeRetrievalModel = {
  travels: [travel],
  nearestSchedules: [schedule],
  dayOuts: [dayOut],
  years: ['2026'],
  sources: {
    travels: source([travel]),
    schedules: source([schedule]),
    dayOuts: source([dayOut]),
  },
  isPartialFailure: false,
  isError: false,
  isLoading: false,
  retry: vi.fn(),
  retrySource: vi.fn(),
};

vi.mock('@/domains/home/hooks/useHomeTimeline', () => ({
  useHomeTimeline: () => homeModel,
}));

vi.mock('@/domains/trip/hooks/useTripAssetUrls', () => ({
  useTripAssetUrls: () => ({ 'logo-1': 'blob:logo' }),
}));

vi.mock('@/domains/travel/hooks/useTravelAssetUrls', () => ({
  useTravelAssetUrls: () => ({ 'cover-1': 'blob:cover' }),
}));

function renderInApp(ui: ReactElement, route: string) {
  return renderWithMinimalProviders(ui, { route });
}

function hrefOf(name: RegExp) {
  return screen.getByRole('link', { name }).getAttribute('href');
}

describe('navigation smoke', () => {
  it('links desktop home timeline entries to device-prefixed detail routes', () => {
    renderInApp(<MainHomePage />, '/main');

    expect(
      screen.getByRole('heading', { level: 1, name: '지난 여행' })
    ).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /속초 2박 3일/ })).toHaveLength(
      1
    );
    expect(
      screen.getByRole('link', { name: /속초 2박 3일/ }).getAttribute('href')
    ).toBe('/main/travel/travel-1');
    expect(screen.queryByRole('link', { name: /남산 야경/ })).toBeNull();
    expect(hrefOf(/성수 산책/)).toBe('/main/calendar');
  });

  it('links mobile home timeline entries to mobile-prefixed routes', () => {
    renderInApp(<MobileHomePage />, '/mobile');

    expect(screen.getAllByRole('link', { name: /속초 2박 3일/ })).toHaveLength(
      1
    );
    expect(
      screen.getByRole('link', { name: /속초 2박 3일/ }).getAttribute('href')
    ).toBe('/mobile/travel/travel-1');
    expect(screen.queryByRole('link', { name: /남산 야경/ })).toBeNull();
    expect(hrefOf(/Choi's Film Art/i)).toBe('http://naver.me/52RjLNuT');
  });

  it('keeps the film link reachable from the desktop footer', () => {
    renderInApp(<Footer />, '/main');

    expect(hrefOf(/Choi's Film Art/i)).toBe('http://naver.me/52RjLNuT');
  });

  it('does not repeat the global navigation destinations on the home surface', () => {
    renderInApp(<MainHomePage />, '/main');

    expect(screen.queryByRole('link', { name: '신발 추천' })).toBeNull();
    expect(screen.queryByRole('link', { name: '서울 촌놈 달력' })).toBeNull();
  });

  it('keeps shoes out of the mobile home primary navigation', () => {
    renderInApp(<MobileBottomNav device='mobile' />, '/mobile');

    expect(screen.queryByRole('link', { name: /신발/i })).toBeNull();
  });
});
