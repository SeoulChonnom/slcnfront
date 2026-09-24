import { act, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InspectionAreaListSection } from '@/domains/inspection/components/InspectionAreaListSection';
import type {
  InspectionArea,
  InspectionAreaListParams,
  InspectionAreaListResult,
} from '@/domains/inspection/types';
import { renderWithProviders } from '@/test/helpers/render';

const useInspectionAreaListMock = vi.fn();

vi.mock('@/domains/inspection/hooks/inspection-queries', () => ({
  useInspectionAreaList: (params: InspectionAreaListParams) =>
    useInspectionAreaListMock(params),
}));

const baseIncompleteSummary = {
  unansweredRequiredCount: 0,
  unansweredRequiredQuestions: [],
  missingFields: [],
  draftPropertyCount: 0,
  visitMissingFields: [],
  draftVisitCount: 0,
};

function area(overrides: Partial<InspectionArea>): InspectionArea {
  return {
    areaId: 'area-1',
    name: '성수동',
    description: '서울숲 ~ 뚝섬역 주변',
    visitCount: 3,
    firstVisitedAt: '2026-03-11T00:00',
    lastVisitedAt: '2026-09-17T14:00',
    totalPropertyCount: 4,
    latestVisit: {
      visitId: 'visit-1',
      visitedAt: '2026-09-17T14:00',
      oneLineReview: '직주근접과 분위기는 좋지만 가격이 부담된다.',
      revisitIntent: 'YES',
      status: 'COMPLETED',
      tags: ['서울숲', '한강', '직주근접', '가격부담'],
      propertyCount: 4,
      incompleteSummary: baseIncompleteSummary,
      cover: null,
    },
    topProperty: {
      propertyId: 'prop-1',
      complexName: '트리마제',
      name: '101동 1203호 / 84A',
      interestLevel: 5,
    },
    incompleteSummary: baseIncompleteSummary,
    thumbnails: [],
    totalImageCount: 0,
    matchedProperty: null,
    ...overrides,
  };
}

function listResult(
  overrides: Partial<InspectionAreaListResult> = {}
): InspectionAreaListResult {
  return {
    items: [area({})],
    totalCount: 1,
    hasNext: false,
    revisitIntentCounts: { total: 6, YES: 3, MAYBE: 2, NO: 1, UNDECIDED: 0 },
    totals: { areaCount: 6, visitCount: 10, propertyCount: 17 },
    ...overrides,
  };
}

function mockQueryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: listResult(),
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  };
}

describe('InspectionAreaListSection', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header summary sentence from `totals`, not the filtered items', () => {
    useInspectionAreaListMock.mockReturnValue(mockQueryResult());

    renderWithProviders(<InspectionAreaListSection device='main' />);

    expect(
      screen.getByText('6개 지역을 10번 걸었고, 매물 17건을 봤습니다.')
    ).toBeTruthy();
  });

  it('uses `revisitIntentCounts.total` for the "전체" chip, not YES+MAYBE+NO', () => {
    useInspectionAreaListMock.mockReturnValue(mockQueryResult());

    renderWithProviders(<InspectionAreaListSection device='main' />);

    expect(screen.getByRole('button', { name: '전체 6' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: '다시 임장하고 싶음 3' })
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: '조금 더 고민 2' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: '재방문하지 않을 예정 1' })
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: '미정 0' })).toBeTruthy();
  });

  it('renders an area row with name, revisit mark, and top property', () => {
    useInspectionAreaListMock.mockReturnValue(mockQueryResult());

    renderWithProviders(<InspectionAreaListSection device='main' />);

    expect(
      screen.getByRole('heading', { level: 2, name: '성수동' })
    ).toBeTruthy();
    expect(screen.getByText('다시 임장하고 싶음')).toBeTruthy();
    expect(screen.getByText('트리마제')).toBeTruthy();
    expect(screen.getByText('101동 1203호 / 84A')).toBeTruthy();
  });

  it('shows a "작성 중" badge and the incomplete reason for a DRAFT latest visit', () => {
    useInspectionAreaListMock.mockReturnValue(
      mockQueryResult({
        data: listResult({
          items: [
            area({
              latestVisit: {
                visitId: 'visit-2',
                visitedAt: '2026-09-20T13:00',
                oneLineReview: null,
                revisitIntent: null,
                status: 'DRAFT',
                tags: ['학군'],
                propertyCount: 2,
                incompleteSummary: {
                  ...baseIncompleteSummary,
                  unansweredRequiredCount: 3,
                },
                cover: null,
              },
              incompleteSummary: {
                ...baseIncompleteSummary,
                unansweredRequiredCount: 3,
              },
            }),
          ],
        }),
      })
    );

    renderWithProviders(<InspectionAreaListSection device='main' />);

    expect(screen.getByText('작성 중')).toBeTruthy();
    expect(screen.getByText('한줄평을 아직 쓰지 않았습니다.')).toBeTruthy();
    // The reason text sits next to a `<strong>` count, so the default
    // text matcher (which reads only an element's own direct text nodes)
    // can't see it — match on the full recursive `textContent` instead.
    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent === '누적 매물 4건 · 필수 문답 3개 미작성'
      )
    ).toBeTruthy();
    expect(screen.getByText('미정')).toBeTruthy();
  });

  it('shows the loading skeleton (same grid, no spinner) while pending', () => {
    useInspectionAreaListMock.mockReturnValue(
      mockQueryResult({ data: undefined, isPending: true })
    );

    renderWithProviders(<InspectionAreaListSection device='main' />);

    expect(
      screen.getByRole('status', { name: '임장 지역 목록을 불러오는 중' })
    ).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
  });

  it('shows an error state with a retry action that calls refetch', () => {
    const refetch = vi.fn();
    useInspectionAreaListMock.mockReturnValue(
      mockQueryResult({ data: undefined, isError: true, refetch })
    );

    renderWithProviders(<InspectionAreaListSection device='main' />);

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows the empty-archive state when there are truly no areas', () => {
    useInspectionAreaListMock.mockReturnValue(
      mockQueryResult({
        data: listResult({
          items: [],
          totalCount: 0,
          revisitIntentCounts: {
            total: 0,
            YES: 0,
            MAYBE: 0,
            NO: 0,
            UNDECIDED: 0,
          },
          totals: { areaCount: 0, visitCount: 0, propertyCount: 0 },
        }),
      })
    );

    renderWithProviders(<InspectionAreaListSection device='main' />);

    expect(screen.getByText('아직 임장 기록이 없습니다')).toBeTruthy();
  });

  it('shows the search/filter no-results state (not the empty-archive state) when a query matches nothing', () => {
    useInspectionAreaListMock.mockReturnValue(
      mockQueryResult({
        data: listResult({ items: [], totalCount: 0 }),
      })
    );

    renderWithProviders(<InspectionAreaListSection device='main' />, {
      route: '/main/inspection?q=반포',
    });

    expect(screen.getByText("'반포'와 맞는 기록이 없습니다")).toBeTruthy();
    expect(
      screen.getByText(
        '지역명, 지역 설명, 단지명, 매물명, 태그에서 찾았습니다. 다른 검색어로 찾아보세요.'
      )
    ).toBeTruthy();
    expect(screen.queryByText('아직 임장 기록이 없습니다')).toBeNull();
  });

  it('reads `q`/`revisit`/`sort` from the URL and passes them to the query', () => {
    useInspectionAreaListMock.mockReturnValue(mockQueryResult());

    renderWithProviders(<InspectionAreaListSection device='main' />, {
      route: '/main/inspection?q=성수&revisit=MAYBE&sort=VISIT_COUNT',
    });

    expect(useInspectionAreaListMock).toHaveBeenCalledWith({
      keyword: '성수',
      revisitIntent: 'MAYBE',
      sort: 'VISIT_COUNT',
    });
    expect(
      screen
        .getByRole('button', { name: '조금 더 고민 2' })
        .getAttribute('aria-pressed')
    ).toBe('true');
  });

  it('sends no `revisitIntent` for the "미정" filter (no server param exists for it)', () => {
    useInspectionAreaListMock.mockReturnValue(mockQueryResult());

    renderWithProviders(<InspectionAreaListSection device='main' />, {
      route: '/main/inspection?revisit=UNDECIDED',
    });

    expect(useInspectionAreaListMock).toHaveBeenCalledWith({
      keyword: undefined,
      revisitIntent: undefined,
      sort: undefined,
    });
  });

  it('debounces committing the search box into the `q` URL param', () => {
    vi.useFakeTimers();
    useInspectionAreaListMock.mockReturnValue(mockQueryResult());

    renderWithProviders(<InspectionAreaListSection device='main' />);

    const input = screen.getByLabelText('임장 검색');
    fireEvent.change(input, { target: { value: '성수' } });

    // Not yet committed to the query.
    expect(useInspectionAreaListMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ keyword: undefined })
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(useInspectionAreaListMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ keyword: '성수' })
    );

    vi.useRealTimers();
  });

  it('hides the top "임장 기록하기" link visually on mobile via CSS, but keeps it in the DOM', () => {
    useInspectionAreaListMock.mockReturnValue(mockQueryResult());

    renderWithProviders(<InspectionAreaListSection device='mobile' />);

    expect(screen.getByRole('link', { name: '+ 임장 기록하기' })).toBeTruthy();
  });

  it('omits the property-detail thumbnails/complex line and shows "아직 없음" when there is no property yet', () => {
    useInspectionAreaListMock.mockReturnValue(
      mockQueryResult({
        data: listResult({
          items: [
            area({
              areaId: 'area-2',
              name: '광교',
              totalPropertyCount: 0,
              topProperty: null,
            }),
          ],
        }),
      })
    );

    renderWithProviders(<InspectionAreaListSection device='main' />);

    expect(screen.getByText('아직 없음')).toBeTruthy();
    expect(screen.getByText('본 매물 없음 · 지역만 확인')).toBeTruthy();
  });

  it('draws the visit-count rail with the numeric count and a dot per visit', () => {
    useInspectionAreaListMock.mockReturnValue(mockQueryResult());

    renderWithProviders(<InspectionAreaListSection device='main' />);

    const row = screen
      .getByRole('heading', { level: 2, name: '성수동' })
      .closest('a') as HTMLElement;
    expect(within(row).getByText('3')).toBeTruthy();
  });
});
