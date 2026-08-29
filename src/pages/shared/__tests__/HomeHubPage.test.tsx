import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HomeRetrievalModel, HomeSourceState } from '@/domains/home/types';
import type { TravelListItem } from '@/domains/travel/types';
import { HomeHubPage } from '@/pages/shared/HomeHubPage';
import { renderWithMinimalProviders } from '@/test/helpers/render';

const { requestedTravelAssetIds, useHomeTimelineMock } = vi.hoisted(() => ({
  requestedTravelAssetIds: [] as Array<Array<string | null | undefined>>,
  useHomeTimelineMock: vi.fn(),
}));

vi.mock('@/domains/home/hooks/useHomeTimeline', () => ({
  useHomeTimeline: useHomeTimelineMock,
}));

vi.mock('@/domains/travel/hooks/useTravelAssetUrls', () => ({
  useTravelAssetUrls: (ids: Array<string | null | undefined>) => {
    requestedTravelAssetIds.push([...ids]);
    return Object.fromEntries(
      ids
        .filter((id): id is string => Boolean(id))
        .map((id) => [id, `blob:${id}`])
    );
  },
}));

const travels: TravelListItem[] = [
  {
    id: 'travel-sokcho',
    travelId: 'travel-sokcho',
    title: '속초 2박 3일',
    region: '속초',
    startDate: '2025-08-12',
    endDate: '2025-08-14',
    displayStartDate: '2025.08.12',
    displayEndDate: '2025.08.14',
    dateRangeLabel: '2025.08.12 – 2025.08.14',
    nightsDaysLabel: '2박 3일',
    coverPhotoId: 'cover-sokcho',
    oneLineReview: '바다와 시장 사이를 오래 걸었던 여름 여행.',
    nights: 2,
    days: 3,
    tags: [{ name: '바다' }],
  },
  {
    id: 'travel-busan',
    travelId: 'travel-busan',
    title: '부산, 비 오는 주말',
    region: '부산',
    startDate: '2024-10-04',
    endDate: '2024-10-06',
    displayStartDate: '2024.10.04',
    displayEndDate: '2024.10.06',
    dateRangeLabel: '2024.10.04 – 2024.10.06',
    nightsDaysLabel: '2박 3일',
    coverPhotoId: null,
    oneLineReview: '비가 와서 더 오래 카페에 머물렀다.',
    nights: 2,
    days: 3,
    tags: [{ name: '카페' }],
  },
  {
    id: 'travel-jeju',
    travelId: 'travel-jeju',
    title: '제주 겨울',
    region: '제주',
    startDate: '2023-01-10',
    endDate: '2023-01-13',
    displayStartDate: '2023.01.10',
    displayEndDate: '2023.01.13',
    dateRangeLabel: '2023.01.10 – 2023.01.13',
    nightsDaysLabel: '3박 4일',
    coverPhotoId: 'cover-jeju',
    oneLineReview: '귤밭을 천천히 걸었다.',
    nights: 3,
    days: 4,
    tags: [],
  },
  {
    id: 'travel-gangneung',
    travelId: 'travel-gangneung',
    title: '강릉의 늦여름',
    region: '강릉',
    startDate: '2022-08-22',
    endDate: '2022-08-24',
    displayStartDate: '2022.08.22',
    displayEndDate: '2022.08.24',
    dateRangeLabel: '2022.08.22 – 2022.08.24',
    nightsDaysLabel: '2박 3일',
    coverPhotoId: 'cover-gangneung',
    oneLineReview: null,
    nights: 2,
    days: 3,
    tags: [],
  },
] as const;

const dayOuts = [
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

const schedules = [
  {
    id: 'schedule-1',
    calendarId: 'calendar-1',
    title: '성수 산책',
    body: '',
    start: '2099-08-25T18:00:00+09:00',
    end: '2099-08-25T20:00:00+09:00',
    allDay: false,
    location: '성수동',
  },
] as const;

function source<T>(
  data: T[],
  overrides: Partial<HomeSourceState<T>> = {}
): HomeSourceState<T> {
  return {
    data,
    status: 'ready',
    isLoading: false,
    isError: false,
    error: null,
    retry: vi.fn(),
    ...overrides,
  };
}

function createModel(
  overrides: Partial<HomeRetrievalModel> = {}
): HomeRetrievalModel {
  return {
    travels: [...travels],
    nearestSchedules: [...schedules],
    dayOuts: [...dayOuts],
    years: ['2025', '2024', '2023', '2022'],
    sources: {
      travels: source([...travels]),
      schedules: source([...schedules]),
      dayOuts: source([...dayOuts]),
    },
    isPartialFailure: false,
    isError: false,
    isLoading: false,
    retry: vi.fn(),
    retrySource: vi.fn(),
    ...overrides,
  };
}

function renderHome(
  model: HomeRetrievalModel = createModel(),
  device: 'main' | 'mobile' = 'main'
) {
  useHomeTimelineMock.mockReturnValue(model);
  return renderWithMinimalProviders(<HomeHubPage device={device} />, {
    route: '/main',
  });
}

beforeEach(() => {
  requestedTravelAssetIds.length = 0;
});

describe('HomeHubPage Memory Chronicle', () => {
  it('opens with a recent travel memory and a direct detail link', () => {
    renderHome();

    expect(
      screen.getByRole('heading', { level: 1, name: '지난 여행' })
    ).toBeTruthy();
    expect(screen.getByRole('img', { name: /속초 2박 3일/ })).toBeTruthy();
    expect(
      within(screen.getByRole('article')).getByText(
        '바다와 시장 사이를 오래 걸었던 여름 여행.'
      )
    ).toBeTruthy();
    expect(
      within(screen.getByRole('article')).getByRole('link').getAttribute('href')
    ).toBe('/main/travel/travel-sokcho');
  });

  it('keeps the archive travel-only and points day-outs to their separate destination', () => {
    renderHome();

    const archive = screen.getByRole('list', { name: '여행 기록' });
    expect(within(archive).queryByText('속초 2박 3일')).toBeNull();
    expect(within(archive).getByText('부산, 비 오는 주말')).toBeTruthy();
    expect(within(archive).getByText('제주 겨울')).toBeTruthy();
    expect(within(archive).getByText('강릉의 늦여름')).toBeTruthy();
    expect(within(archive).queryByText('남산 야경')).toBeNull();
    expect(
      screen
        .getByRole('link', { name: /나들이 기록으로 가기/ })
        .getAttribute('href')
    ).toBe('/main/map');
  });

  it('requests the feature cover plus at most twelve unique archive covers', () => {
    const archiveTravels = Array.from({ length: 12 }, (_, index) => ({
      ...travels[1],
      id: `travel-archive-${index}`,
      travelId: `travel-archive-${index}`,
      title: `기록 ${index + 1}`,
      startDate: `2020-${String((index % 9) + 1).padStart(2, '0')}-01`,
      coverPhotoId: `cover-archive-${index}`,
    }));
    const allTravels = [travels[0], ...archiveTravels];

    renderHome(
      createModel({
        travels: allTravels,
        sources: {
          travels: source(allTravels),
          schedules: source([...schedules]),
          dayOuts: source([...dayOuts]),
        },
      })
    );

    const requested = requestedTravelAssetIds.at(-1) ?? [];
    expect(requested[0]).toBe('cover-sokcho');
    expect(requested).toHaveLength(13);
    expect(new Set(requested).size).toBe(requested.length);
  });

  it('links the nearest schedule to the calendar without mixing it into travel rows', () => {
    renderHome();

    expect(screen.getByText('성수 산책')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /성수 산책/ }).getAttribute('href')
    ).toBe('/main/calendar');
    expect(screen.getByRole('region', { name: '다음 일정' })).toBeTruthy();
  });

  it('provides labeled search and keyboard-operable year navigation', async () => {
    const { user } = renderHome();

    const search = screen.getByRole('searchbox', { name: '여행 기록 검색' });
    await user.type(search, '비 오는');
    expect(screen.getByText('부산, 비 오는 주말')).toBeTruthy();
    expect(
      within(screen.getByRole('list', { name: '여행 기록' })).queryByText(
        '속초 2박 3일'
      )
    ).toBeNull();

    await user.clear(search);
    await user.click(screen.getByRole('button', { name: '2024년' }));
    expect(screen.getByText('부산, 비 오는 주말')).toBeTruthy();
    expect(screen.queryByText('제주 겨울')).toBeNull();
    expect(
      screen
        .getByRole('button', { name: '2024년' })
        .getAttribute('aria-pressed')
    ).toBe('true');
  });

  it('keeps mobile search directly available for filtering and clearing', async () => {
    const { user } = renderHome(createModel(), 'mobile');

    const search = screen.getByRole('searchbox', { name: '여행 기록 검색' });
    expect(search).toBeTruthy();
    expect(screen.queryByRole('button', { name: '여행 검색 열기' })).toBeNull();
    expect(screen.queryByRole('button', { name: '여행 검색 닫기' })).toBeNull();
    expect(screen.getByRole('button', { name: '전체' })).toBeTruthy();

    await user.type(search, '비 오는');
    expect(screen.getByText('부산, 비 오는 주말')).toBeTruthy();
    expect(
      within(screen.getByRole('list', { name: '여행 기록' })).queryByText(
        '속초 2박 3일'
      )
    ).toBeNull();

    await user.click(screen.getByRole('button', { name: '검색 초기화' }));
    expect((search as HTMLInputElement).value).toBe('');
    expect(screen.getByText('제주 겨울')).toBeTruthy();
  });

  it('announces when a search matches only the always-visible hero travel', async () => {
    const { user } = renderHome();

    await user.type(
      screen.getByRole('searchbox', { name: '여행 기록 검색' }),
      '속초 2박 3일'
    );

    expect(
      within(screen.getByRole('article')).getByText('속초 2박 3일')
    ).toBeTruthy();
    expect(screen.getByText('가장 최근 여행이 검색 결과예요.')).toBeTruthy();
    expect(screen.queryByText('검색 결과가 없어요')).toBeNull();
  });

  it('keeps shoes and Film Art together under a secondary more navigation on both devices', () => {
    const { unmount } = renderHome(createModel(), 'main');

    const desktopMore = screen.getByRole('navigation', { name: '더보기' });
    expect(
      within(desktopMore)
        .getByRole('link', { name: '신발 기록' })
        .getAttribute('href')
    ).toBe('/main/shoesRecom');
    expect(
      within(desktopMore)
        .getByRole('link', { name: "Choi's Film Art" })
        .getAttribute('target')
    ).toBe('_blank');
    expect(
      within(desktopMore)
        .getByRole('link', { name: "Choi's Film Art" })
        .getAttribute('rel')
    ).toBe('noreferrer');

    unmount();
    renderHome(createModel(), 'mobile');
    const mobileMore = screen.getByRole('navigation', { name: '더보기' });
    expect(
      within(mobileMore)
        .getByRole('link', { name: '신발 기록' })
        .getAttribute('href')
    ).toBe('/mobile/shoesRecom');
    expect(
      within(mobileMore)
        .getByRole('link', { name: "Choi's Film Art" })
        .getAttribute('href')
    ).toBe('http://naver.me/52RjLNuT');
  });

  it('renders missing-cover travels as complete typography instead of a placeholder tile', () => {
    renderHome();

    const row = screen.getByRole('link', { name: /부산, 비 오는 주말/ });
    expect(row.textContent).toContain('부산');
    expect(row.textContent).toContain('2박 3일');
    expect(within(row).queryByRole('img')).toBeNull();
  });

  it('announces a recent missing cover as an image fallback', () => {
    const noCoverTravel = { ...travels[0], coverPhotoId: null };

    renderHome(
      createModel({
        travels: [noCoverTravel, ...travels.slice(1)],
        sources: {
          travels: source([noCoverTravel, ...travels.slice(1)]),
          schedules: source([...schedules]),
          dayOuts: source([...dayOuts]),
        },
      })
    );

    expect(screen.getByRole('img', { name: '표지 사진 없음' })).toBeTruthy();
  });

  it('offers recovery when search has no matches', async () => {
    const { user } = renderHome();

    await user.type(
      screen.getByRole('searchbox', { name: '여행 기록 검색' }),
      '도쿄'
    );
    expect(screen.getByText('검색 결과가 없어요')).toBeTruthy();
    const resetButtons = screen.getAllByRole('button', { name: '검색 초기화' });
    await user.click(resetButtons.at(-1) as HTMLElement);
    expect(
      within(screen.getByRole('article')).getByText('속초 2박 3일')
    ).toBeTruthy();
  });

  it('announces loading state before any source has resolved', () => {
    renderHome(
      createModel({
        isLoading: true,
        sources: {
          travels: source([], { status: 'loading', isLoading: true }),
          schedules: source([], { status: 'loading', isLoading: true }),
          dayOuts: source([], { status: 'loading', isLoading: true }),
        },
      })
    );

    expect(
      screen.getByRole('status', { name: '여행 기록을 불러오는 중' })
    ).toBeTruthy();
  });

  it('keeps travel retrieval visible while secondary sources report loading', () => {
    renderHome(
      createModel({
        isLoading: true,
        sources: {
          travels: source([...travels]),
          schedules: source([], { status: 'loading', isLoading: true }),
          dayOuts: source([], { status: 'loading', isLoading: true }),
        },
      })
    );

    expect(
      within(screen.getByRole('article')).getByText('속초 2박 3일')
    ).toBeTruthy();
    expect(screen.getByText('일정을 불러오는 중')).toBeTruthy();
    expect(screen.getByText('나들이 기록을 불러오는 중')).toBeTruthy();
  });

  it('shows a full error with a retry action when every source fails', async () => {
    const retry = vi.fn();
    const failedSource = <T,>(data: T[]) =>
      source(data, {
        status: 'error',
        isError: true,
        error: new Error('failed'),
      });

    const { user } = renderHome(
      createModel({
        isError: true,
        isPartialFailure: false,
        travels: [],
        nearestSchedules: [],
        dayOuts: [],
        sources: {
          travels: failedSource([]),
          schedules: failedSource([]),
          dayOuts: failedSource([]),
        },
        retry,
      })
    );

    expect(screen.getByText('여행 기록을 불러오지 못했어요.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('keeps travel retrieval usable while naming a failed secondary source', () => {
    renderHome(
      createModel({
        isPartialFailure: true,
        sources: {
          travels: source([...travels]),
          schedules: source([], {
            status: 'error',
            isError: true,
            error: new Error('schedule failed'),
          }),
          dayOuts: source([...dayOuts]),
        },
      })
    );

    expect(
      within(screen.getByRole('article')).getByText('속초 2박 3일')
    ).toBeTruthy();
    expect(screen.getByText('일정 정보를 불러오지 못했어요.')).toBeTruthy();
  });

  it('offers a first travel action when the archive is empty', () => {
    renderHome(
      createModel({
        travels: [],
        years: [],
        sources: {
          travels: source([]),
          schedules: source([...schedules]),
          dayOuts: source([...dayOuts]),
        },
      })
    );

    expect(screen.getByText('아직 남긴 여행이 없어요.')).toBeTruthy();
    expect(screen.queryByText('더 오래된 여행은 아직 없어요.')).toBeNull();
    expect(
      screen
        .getByRole('link', { name: '첫 여행 기록하기' })
        .getAttribute('href')
    ).toBe('/main/travel/register');
  });

  it('shows a quiet older-history state when the hero is the only travel', () => {
    const onlyTravel = [travels[0]];

    renderHome(
      createModel({
        travels: onlyTravel,
        years: ['2025'],
        sources: {
          travels: source(onlyTravel),
          schedules: source([...schedules]),
          dayOuts: source([...dayOuts]),
        },
      })
    );

    expect(
      within(screen.getByRole('article')).getByText('속초 2박 3일')
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: '전체' }).getAttribute('aria-pressed')
    ).toBe('true');
    expect(screen.getByText('더 오래된 여행은 아직 없어요.')).toBeTruthy();
    expect(screen.queryByText('검색 결과가 없어요')).toBeNull();
    expect(screen.queryByRole('link', { name: '첫 여행 기록하기' })).toBeNull();
  });
});
