import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { InspectionAreaDetailSection } from '@/domains/inspection/components/InspectionAreaDetailSection';
import type {
  AreaViewedProperty,
  InspectionArea,
  InspectionAreaDetail,
  InspectionVisitDetail,
  ViewedPropertyDetail,
} from '@/domains/inspection/types';
import { renderWithProviders } from '@/test/helpers/render';

// ── Hook mocks ──────────────────────────────────────────────────────────────

const useInspectionAreaDetailMock = vi.fn();
const useInspectionVisitListMock = vi.fn();
const useInspectionAreaPropertiesMock = vi.fn();
const updateAreaMutateAsyncMock = vi.fn();
const deleteVisitMutateAsyncMock = vi.fn();
const createPropertyMutateAsyncMock = vi.fn();

vi.mock('@/domains/inspection/hooks/inspection-queries', () => ({
  useInspectionAreaDetail: (areaId: string, params: { visitId?: string }) =>
    useInspectionAreaDetailMock(areaId, params),
  useInspectionVisitList: (params: unknown) =>
    useInspectionVisitListMock(params),
  useInspectionAreaProperties: (
    areaId: string,
    link: { complexName: string; name: string } | undefined
  ) => useInspectionAreaPropertiesMock(areaId, link),
  useUpdateInspectionArea: () => ({
    mutateAsync: updateAreaMutateAsyncMock,
    isPending: false,
    isError: false,
  }),
  useDeleteInspectionVisit: () => ({
    mutateAsync: deleteVisitMutateAsyncMock,
    isPending: false,
  }),
  useCreateInspectionProperty: () => ({
    mutateAsync: createPropertyMutateAsyncMock,
    isPending: false,
  }),
  useInspectionComplexNames: () => ({ data: ['트리마제'] }),
}));

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid='location'>
      {location.pathname}
      {location.search}
    </output>
  );
}

// ── Fixtures ──────────────────────────────────────────────────────────────

const baseIncompleteSummary = {
  unansweredRequiredCount: 0,
  unansweredRequiredQuestions: [],
  missingFields: [],
  draftPropertyCount: 0,
  visitMissingFields: [],
  draftVisitCount: 0,
};

function makeProperty(
  overrides: Partial<ViewedPropertyDetail>
): ViewedPropertyDetail {
  return {
    propertyId: 'prop-1',
    visitId: 'visit-3',
    areaId: 'area-1',
    areaName: '성수동',
    visitedAt: '2026-09-17T14:00',
    complexName: '트리마제',
    name: '101동 1203호 / 84A',
    memo: null,
    oneLineReview: '이번 임장에서 가장 마음에 들었던 집',
    pros: null,
    cons: null,
    interestLevel: 5,
    status: 'COMPLETED',
    sortOrder: 0,
    tags: ['남향', '고층', '한강뷰'],
    cover: null,
    photos: [],
    answers: [],
    incompleteSummary: baseIncompleteSummary,
    prevProperty: null,
    nextProperty: null,
    ...overrides,
  };
}

function makeVisit(
  overrides: Partial<InspectionVisitDetail>
): InspectionVisitDetail {
  return {
    visitId: 'visit-3',
    area: { areaId: 'area-1', name: '성수동' },
    visitedAt: '2026-09-17T14:00',
    memo: '세 번째 방문.\n\n성수역 쪽은 아직 정리가 덜 됐다.',
    revisitIntent: 'YES',
    oneLineReview: '직주근접과 분위기는 좋지만 가격이 부담된다.',
    pros: '2호선·수인분당선 모두 도보권\n서울숲이 실질적인 앞마당',
    cons: '가격대가 예산을 크게 넘음',
    status: 'COMPLETED',
    tags: ['서울숲', '한강', '직주근접', '카페상권', '가격부담'],
    properties: [makeProperty({})],
    cover: null,
    photos: [],
    incompleteSummary: baseIncompleteSummary,
    ...overrides,
  };
}

function makeArea(overrides: Partial<InspectionArea>): InspectionArea {
  return {
    areaId: 'area-1',
    name: '성수동',
    description: '서울숲 ~ 뚝섬역 주변',
    visitCount: 3,
    firstVisitedAt: '2026-03-11T18:30',
    lastVisitedAt: '2026-09-17T14:00',
    totalPropertyCount: 4,
    latestVisit: null,
    topProperty: null,
    incompleteSummary: baseIncompleteSummary,
    thumbnails: [],
    totalImageCount: 0,
    matchedProperty: null,
    ...overrides,
  };
}

function makeDetail(
  overrides: Partial<InspectionAreaDetail> = {}
): InspectionAreaDetail {
  const area = makeArea({});
  return {
    area,
    visits: [
      {
        visitId: 'visit-3',
        visitedAt: '2026-09-17T14:00',
        oneLineReview: '직주근접과 분위기는 좋지만 가격이 부담된다.',
        revisitIntent: 'YES',
        status: 'COMPLETED',
        tags: [],
        propertyCount: 3,
        incompleteSummary: baseIncompleteSummary,
        cover: null,
      },
      {
        visitId: 'visit-2',
        visitedAt: '2026-06-02T11:00',
        oneLineReview: '장마철이라 누수만 봤다.',
        revisitIntent: 'MAYBE',
        status: 'COMPLETED',
        tags: [],
        propertyCount: 1,
        incompleteSummary: baseIncompleteSummary,
        cover: null,
      },
      {
        visitId: 'visit-1',
        visitedAt: '2026-03-11T18:30',
        oneLineReview: '일단 동네가 마음에 든다.',
        revisitIntent: 'YES',
        status: 'COMPLETED',
        tags: [],
        propertyCount: 0,
        incompleteSummary: baseIncompleteSummary,
        cover: null,
      },
    ],
    hasMoreVisits: false,
    visitPageSize: 50,
    selectedVisit: makeVisit({}),
    ...overrides,
  };
}

function mockDetailFor(byVisitId: Record<string, InspectionAreaDetail>) {
  useInspectionAreaDetailMock.mockImplementation(
    (_areaId: string, params: { visitId?: string }) => {
      const key = params.visitId ?? 'default';
      const data = byVisitId[key] ?? byVisitId.default;
      return { data, isPending: false, isError: false, refetch: vi.fn() };
    }
  );
}

function setup(detail: InspectionAreaDetail = makeDetail()) {
  mockDetailFor({ default: detail });
  useInspectionAreaPropertiesMock.mockReturnValue({ data: [] });
  return renderWithProviders(
    <>
      <InspectionAreaDetailSection device='main' areaId='area-1' />
      <LocationProbe />
    </>
  );
}

describe('InspectionAreaDetailSection', () => {
  it('shows a skeleton while loading', () => {
    useInspectionAreaDetailMock.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: vi.fn(),
    });
    useInspectionAreaPropertiesMock.mockReturnValue({ data: [] });

    renderWithProviders(
      <InspectionAreaDetailSection device='main' areaId='area-1' />
    );

    expect(
      document.querySelector('.slcn-inspection-area-detail__skeleton-rail')
    ).toBeTruthy();
  });

  it('shows an error state with retry on failure', () => {
    const refetch = vi.fn();
    useInspectionAreaDetailMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch,
    });
    useInspectionAreaPropertiesMock.mockReturnValue({ data: [] });

    renderWithProviders(
      <InspectionAreaDetailSection device='main' areaId='area-1' />
    );

    expect(
      screen.getByRole('heading', { name: '지역 정보를 불러오지 못했습니다.' })
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('renders the area header with stats and the two head actions', () => {
    setup();

    expect(screen.getByRole('heading', { name: '성수동' })).toBeTruthy();
    expect(
      screen.getByText(
        '서울숲 ~ 뚝섬역 주변 · 임장 3회 · 누적 매물 4건 · 첫 임장 2026.03.11'
      )
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: '지역 정보 수정' })).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /이 지역 다시 임장/ })
    ).toBeTruthy();
  });

  it('renders the visit rail as a tablist with ordinal numbers, latest/first suffixes, and the selected tab marked', () => {
    setup();

    const tablist = screen.getByRole('tablist', { name: '임장 회차' });
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    expect(within(tabs[0]).getByText('3차 · 가장 최근')).toBeTruthy();
    expect(within(tabs[1]).getByText('2차')).toBeTruthy();
    expect(within(tabs[2]).getByText('1차 · 처음')).toBeTruthy();

    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    expect(tabs[2].getAttribute('aria-selected')).toBe('false');

    // Zero-property visit reads "매물 없음", not "매물 0".
    expect(within(tabs[2]).getByText(/매물 없음/)).toBeTruthy();
  });

  it('switches the panel content when a different rail tab is clicked, keyed by visitId', () => {
    const detail = makeDetail();
    mockDetailFor({
      default: detail,
      'visit-2': makeDetail({
        selectedVisit: makeVisit({
          visitId: 'visit-2',
          oneLineReview: '장마철이라 누수만 봤다.',
          revisitIntent: 'MAYBE',
          properties: [],
        }),
      }),
    });
    useInspectionAreaPropertiesMock.mockReturnValue({ data: [] });

    renderWithProviders(
      <InspectionAreaDetailSection device='main' areaId='area-1' />
    );

    expect(
      screen.getByText('“직주근접과 분위기는 좋지만 가격이 부담된다.”')
    ).toBeTruthy();

    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[1]);

    expect(screen.getByText('“장마철이라 누수만 봤다.”')).toBeTruthy();
  });

  it('renders the one-line review, tags, and memo paragraphs', () => {
    setup();

    expect(
      screen.getByText('“직주근접과 분위기는 좋지만 가격이 부담된다.”')
    ).toBeTruthy();
    expect(screen.getByText('#서울숲')).toBeTruthy();
    expect(screen.getByText('세 번째 방문.')).toBeTruthy();
    expect(screen.getByText('성수역 쪽은 아직 정리가 덜 됐다.')).toBeTruthy();
  });

  it('renders pros and cons as one line per hairline row, not colored cards', () => {
    setup();

    expect(screen.getByText('장점')).toBeTruthy();
    expect(screen.getByText('단점')).toBeTruthy();
    expect(screen.getByText('2호선·수인분당선 모두 도보권')).toBeTruthy();
    expect(screen.getByText('서울숲이 실질적인 앞마당')).toBeTruthy();
    expect(screen.getByText('가격대가 예산을 크게 넘음')).toBeTruthy();
  });

  it('groups the property list by complexName with a count header, and links to property detail', () => {
    const detail = makeDetail({
      selectedVisit: makeVisit({
        properties: [
          makeProperty({ propertyId: 'p1', complexName: '트리마제' }),
          makeProperty({
            propertyId: 'p2',
            complexName: '트리마제',
            name: '102동 1501호 / 84A',
          }),
          makeProperty({
            propertyId: 'p3',
            complexName: '서울숲리버뷰자이',
            name: '105동 803호 / 84B',
          }),
        ],
      }),
    });
    setup(detail);

    expect(screen.getByText('단지 2곳 · 매물 3건')).toBeTruthy();
    expect(screen.getByText('트리마제')).toBeTruthy();
    expect(screen.getByText('서울숲리버뷰자이')).toBeTruthy();

    const link = screen.getByRole('link', { name: /101동 1203호 \/ 84A/ });
    expect(link.getAttribute('href')).toBe(
      '/main/inspection/area-1/property/p1'
    );
  });

  it('shows the quiet dashed empty state for a zero-property visit and calls it a completed record', () => {
    const detail = makeDetail({
      selectedVisit: makeVisit({ properties: [] }),
    });
    setup(detail);

    expect(screen.getByText('이 날은 매물을 보지 않았습니다')).toBeTruthy();
    expect(screen.getByText(/이 상태로도 완료된 기록입니다/)).toBeTruthy();
    expect(screen.queryByText('확인 매물')).toBeNull();
  });

  it('places 매물 추가 below the last complex, and creating a property opens its editor flagged to return here', async () => {
    createPropertyMutateAsyncMock.mockResolvedValue(
      makeProperty({ propertyId: 'p-new' })
    );
    const { user } = setup();

    const list = screen
      .getByText('확인 매물')
      .closest('.slcn-inspection-area-detail-properties') as HTMLElement;
    const addButton = within(list).getByRole('button', { name: '+ 매물 추가' });
    const lastComplex = within(list).getByText('트리마제');
    expect(
      lastComplex.compareDocumentPosition(addButton) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    await user.click(addButton);
    await user.type(screen.getByLabelText(/단지\/건물명/), ' 트리마제 ');
    await user.type(screen.getByLabelText(/매물명/), '103동 902호');
    await user.click(
      screen.getByRole('button', { name: '추가하고 계속 쓰기' })
    );

    expect(createPropertyMutateAsyncMock).toHaveBeenCalledWith({
      complexName: '트리마제',
      name: '103동 902호',
    });
    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe(
        '/main/inspection/area-1/visit/visit-3/property/p-new/edit?from=area'
      )
    );
  });

  it('asks for both names before creating a property', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: '+ 매물 추가' }));
    await user.type(screen.getByLabelText(/매물명/), '103동 902호');
    await user.click(
      screen.getByRole('button', { name: '추가하고 계속 쓰기' })
    );

    expect(screen.getByRole('alert').textContent).toBe(
      '단지명과 매물명을 모두 입력해 주세요.'
    );
    expect(createPropertyMutateAsyncMock).not.toHaveBeenCalled();
  });

  it('offers 매물 추가 under the empty state of a zero-property visit', () => {
    setup(makeDetail({ selectedVisit: makeVisit({ properties: [] }) }));

    expect(screen.getByRole('button', { name: '+ 매물 추가' })).toBeTruthy();
  });

  it('shows the DRAFT badge on the panel header for a draft visit, and nothing for a completed one', () => {
    const draftDetail = makeDetail({
      selectedVisit: makeVisit({ status: 'DRAFT' }),
    });
    setup(draftDetail);
    expect(screen.getByText('작성 중')).toBeTruthy();
  });

  it('renders no DRAFT badge for a completed visit', () => {
    setup();
    expect(screen.queryByText('작성 중')).toBeNull();
  });

  it('shows the cross-visit interest delta note when the linked property list has an earlier, different-level entry', () => {
    const linked: AreaViewedProperty[] = [
      {
        propertyId: 'p1',
        visitId: 'visit-3',
        visitedAt: '2026-09-17T14:00',
        complexName: '트리마제',
        name: '101동 1203호 / 84A',
        interestLevel: 5,
        status: 'COMPLETED',
      },
      {
        propertyId: 'p1-prev',
        visitId: 'visit-2',
        visitedAt: '2026-06-02T11:00',
        complexName: '트리마제',
        name: '101동 1203호 / 84A',
        interestLevel: 3,
        status: 'COMPLETED',
      },
    ];
    useInspectionAreaPropertiesMock.mockReturnValue({ data: linked });
    mockDetailFor({ default: makeDetail() });

    renderWithProviders(
      <InspectionAreaDetailSection device='main' areaId='area-1' />
    );

    expect(screen.getByText(/6월보다 2단계/)).toBeTruthy();
  });

  it('opens the area edit modal pre-filled with the current name and description, and saves via the update mutation', async () => {
    updateAreaMutateAsyncMock.mockResolvedValue(undefined);
    setup();

    fireEvent.click(screen.getByRole('button', { name: '지역 정보 수정' }));

    const dialog = screen.getByRole('dialog');
    const nameInput = within(dialog).getByLabelText(
      /지역명/
    ) as HTMLInputElement;
    expect(nameInput.value).toBe('성수동');

    fireEvent.click(within(dialog).getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(updateAreaMutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: '성수동' })
      );
    });
  });

  it('enumerates what gets deleted with the visit in the delete confirmation dialog', async () => {
    deleteVisitMutateAsyncMock.mockResolvedValue(undefined);
    const detail = makeDetail({
      selectedVisit: makeVisit({
        properties: [makeProperty({}), makeProperty({ propertyId: 'p2' })],
        photos: [
          {
            id: 'file-1',
            fileAssetId: 'asset-1',
            targetType: 'INSPECTION_VISIT',
            targetId: 'visit-3',
            role: 'GALLERY',
            caption: null,
            sortOrder: 0,
          },
        ],
      }),
    });
    setup(detail);

    fireEvent.click(screen.getByRole('button', { name: '이 임장 삭제' }));

    expect(
      screen.getByText(/매물 2건, 사진 1장, 문답 답변이 모두 사라져요/)
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '삭제할게요' }));

    await waitFor(() => {
      expect(deleteVisitMutateAsyncMock).toHaveBeenCalledWith('visit-3');
    });
  });
});
