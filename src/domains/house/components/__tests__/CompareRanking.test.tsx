import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompareSection } from '@/domains/house/components/CompareSection';
import { CompareTable } from '@/domains/house/components/CompareTable';
import { RankingSection } from '@/domains/house/components/RankingSection';
import { useCompare } from '@/domains/house/hooks/useCompare';
import { useComplexSearch } from '@/domains/house/hooks/useComplexSearch';
import { useRankings } from '@/domains/house/hooks/useRankings';
import type {
  CompareColumn,
  CompareItem,
  HouseRankingItem,
} from '@/domains/house/types';

vi.mock('@/domains/house/hooks/useCompare', () => ({ useCompare: vi.fn() }));
vi.mock('@/domains/house/hooks/useComplexSearch', () => ({
  useComplexSearch: vi.fn(),
}));
vi.mock('@/domains/house/hooks/useRankings', () => ({ useRankings: vi.fn() }));

function column(overrides: Partial<CompareColumn> = {}): CompareColumn {
  return {
    complexId: 'HOUSE_COMPLEX-1',
    name: '한빛아파트',
    districtName: '강북구',
    umdName: '미아동',
    area: 'B59',
    recentPrice: { priceManwon: 45000, windowMonths: 3, sample: 5 },
    households: 380,
    buildYear: 1999,
    ageYears: 27,
    areaInfo: { avgExclusiveArea: 59.95, bucket: 'B59' },
    far: { pct: 248.31, source: 'RECAP' },
    schools: [{ level: 'E', name: '한빛초', distanceM: 604 }],
    redevelopments: [],
    change1y: {
      fromManwon: 40000,
      toManwon: 45000,
      pct: 12.5,
      changeManwon: 5000,
      sampleFrom: 3,
      sampleTo: 5,
      sampleStatus: 'OK',
    },
    change3y: null,
    ...overrides,
  };
}

function rankingItem(
  overrides: Partial<HouseRankingItem> = {}
): HouseRankingItem {
  return {
    rank: 1,
    complexId: 'HOUSE_COMPLEX-1',
    name: '한빛아파트',
    lawdCd: '11305',
    districtName: '강북구',
    latitude: 37.6,
    longitude: 127.02,
    buildYear: 1999,
    avgExclusiveArea: 59.95,
    households: 380,
    value: 45000,
    changeManwon: 5000,
    sample: 5,
    badge: null,
    ...overrides,
  };
}

function mockCompare(columns = [column()], missingIds: string[] = []) {
  vi.mocked(useCompare).mockReturnValue({
    data: { columns, missingIds },
    isPending: false,
    isError: false,
  } as ReturnType<typeof useCompare>);
}

function mockRankings(
  items = [rankingItem()],
  period: { from: string; to: string } | null = {
    from: '2025-11-04',
    to: '2026-11-03',
  }
) {
  vi.mocked(useRankings).mockReturnValue({
    data: { type: 'LEADER', area: 'B59', items, period },
    isPending: false,
    isError: false,
  } as ReturnType<typeof useRankings>);
}

function compareProps(
  items: CompareItem[] = [{ complexId: 'HOUSE_COMPLEX-1', area: 'B59' }]
) {
  return {
    areaBucket: 'B59' as const,
    items,
    onItemsChange: vi.fn(),
    onNotify: vi.fn(),
  };
}

function rankingProps() {
  return {
    areaBucket: 'B59' as const,
    rankingType: 'LEADER' as const,
    statsComputedDate: '2026-11-03',
    onRankingTypeChange: vi.fn(),
    onAddCompare: vi.fn(),
    onViewOnMap: vi.fn(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCompare();
  mockRankings();
  vi.mocked(useComplexSearch).mockReturnValue({
    data: {
      items: [
        {
          complexId: 'HOUSE_COMPLEX-1',
          name: '한빛아파트',
          districtName: '강북구',
          umdName: '미아동',
          buildYear: 1999,
        },
      ],
    },
    isPending: false,
    isFetching: false,
    isError: false,
  } as ReturnType<typeof useComplexSearch>);
});

describe('CompareTable contract display', () => {
  it('renders nine metrics, same complex with two areas, and the supplied area mean', () => {
    render(
      <CompareTable
        columns={[
          column(),
          column({
            area: 'B84',
            areaInfo: { bucket: 'B84', avgExclusiveArea: null },
          }),
        ]}
      />
    );
    expect(screen.getAllByRole('rowheader')).toHaveLength(9);
    expect(
      screen.getByRole('columnheader', { name: '한빛아파트 · 59㎡' })
    ).toBeTruthy();
    expect(
      screen.getByRole('columnheader', { name: '한빛아파트 · 84㎡' })
    ).toBeTruthy();
    expect(screen.getByText('84 구간')).toBeTruthy();
    expect(screen.getAllByText('직선거리 · 학교 배정 보장 아님')).toHaveLength(
      1
    );
  });

  it('does not substitute the 6-month price into insufficient 3-month changes', () => {
    render(
      <CompareTable
        columns={[
          column({
            recentPrice: { priceManwon: 45000, windowMonths: 6, sample: 2 },
            change1y: {
              fromManwon: 42000,
              toManwon: null,
              pct: null,
              changeManwon: null,
              sampleFrom: 1,
              sampleTo: 0,
              sampleStatus: 'INSUFFICIENT',
            },
          }),
        ]}
      />
    );
    expect(screen.getByText('표본 적음')).toBeTruthy();
    const row = screen
      .getByRole('rowheader', { name: '1년 실거래 변동' })
      .closest('tr') as HTMLElement;
    expect(within(row).getByText('과거 4.20억')).toBeTruthy();
    expect(within(row).getByText('표본 부족')).toBeTruthy();
    expect(within(row).queryByText(/4.50억|%/)).toBeNull();
  });

  it('keeps null, empty, unknown project strings, and source links distinct', () => {
    render(
      <CompareTable
        columns={[
          column({ redevelopments: null }),
          column({ complexId: 'HOUSE_COMPLEX-2', redevelopments: [] }),
          column({
            complexId: 'HOUSE_COMPLEX-3',
            redevelopments: [
              {
                name: '새로운 사업',
                projectType: '새 유형',
                stage: '새 단계',
                distanceM: 123,
                sourceUrl: null,
              },
              {
                name: '출처 사업',
                projectType: '공동주택 재건축',
                stage: '착공',
                distanceM: 200,
                sourceUrl: 'https://example.com/project',
              },
            ],
          }),
        ]}
      />
    );
    const row = screen
      .getByRole('rowheader', { name: '호재·정비사업' })
      .closest('tr') as HTMLElement;
    expect(within(row).getByText('정보 없음')).toBeTruthy();
    expect(within(row).getByText('직접 연관 사업 없음')).toBeTruthy();
    expect(within(row).getByText(/새 유형 · 새 단계 · 약 123m/)).toBeTruthy();
    expect(within(row).getAllByRole('link')).toHaveLength(1);
    expect(
      within(row).getByRole('link', { name: '출처 보기' }).getAttribute('href')
    ).toBe('https://example.com/project');
  });

  it('shows LOW sample warning while retaining provided prices and signed movement', () => {
    render(
      <CompareTable
        columns={[
          column({
            change1y: {
              fromManwon: 45000,
              toManwon: 42000,
              pct: -6.67,
              changeManwon: -3000,
              sampleFrom: 2,
              sampleTo: 3,
              sampleStatus: 'LOW',
            },
          }),
        ]}
      />
    );
    expect(screen.getByText('낮은 표본')).toBeTruthy();
    expect(screen.getByText('4.50억 → 4.20억')).toBeTruthy();
    expect(
      screen
        .getByText(/-6.67% · -3,000만/)
        .classList.contains('house-change-down')
    ).toBe(true);
  });
});

describe('CompareSection selection', () => {
  it('removes every area of a missing complex and counts missing ids rather than columns', () => {
    mockCompare(
      [column({ complexId: 'HOUSE_COMPLEX-2' })],
      ['HOUSE_COMPLEX-1']
    );
    const props = compareProps([
      { complexId: 'HOUSE_COMPLEX-1', area: 'B59' },
      { complexId: 'HOUSE_COMPLEX-1', area: 'B84' },
      { complexId: 'HOUSE_COMPLEX-2', area: 'B59' },
    ]);
    render(<CompareSection {...props} />);
    expect(props.onItemsChange).toHaveBeenCalledWith([
      { complexId: 'HOUSE_COMPLEX-2', area: 'B59' },
    ]);
    expect(props.onNotify).toHaveBeenCalledWith(
      '찾을 수 없는 단지 1개를 비교에서 뺐어요'
    );
  });

  it('rejects an area switch that would duplicate a column', () => {
    mockCompare([column(), column({ area: 'B84' })]);
    const props = compareProps([
      { complexId: 'HOUSE_COMPLEX-1', area: 'B59' },
      { complexId: 'HOUSE_COMPLEX-1', area: 'B84' },
    ]);
    render(<CompareSection {...props} />);
    fireEvent.click(
      within(
        screen.getByRole('group', { name: '한빛아파트 59㎡ 열 평형 전환' })
      ).getByRole('button', { name: '84' })
    );
    expect(props.onNotify).toHaveBeenCalledWith('이미 비교함에 있어요');
    expect(props.onItemsChange).not.toHaveBeenCalled();
  });

  it('adds search selections at the current area without changing existing columns', () => {
    const props = compareProps();
    render(<CompareSection {...props} areaBucket='B84' />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '한빛' },
    });
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    expect(props.onItemsChange).toHaveBeenCalledWith([
      { complexId: 'HOUSE_COMPLEX-1', area: 'B59' },
      { complexId: 'HOUSE_COMPLEX-1', area: 'B84' },
    ]);
  });

  it('blocks a fourth item with a notification', () => {
    const props = compareProps([
      { complexId: 'HOUSE_COMPLEX-2', area: 'B59' },
      { complexId: 'HOUSE_COMPLEX-3', area: 'B59' },
      { complexId: 'HOUSE_COMPLEX-4', area: 'B59' },
    ]);
    render(<CompareSection {...props} />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '한빛' },
    });
    fireEvent.click(screen.getByRole('option'));
    expect(props.onNotify).toHaveBeenCalledWith(
      '최대 3개까지 비교할 수 있어요'
    );
    expect(props.onItemsChange).not.toHaveBeenCalled();
  });
});

describe('RankingSection', () => {
  it('disables all NO_TRADE actions and only map action for missing coordinates', () => {
    mockRankings([
      rankingItem({
        rank: 1,
        complexId: null,
        name: null,
        latitude: null,
        longitude: null,
        buildYear: null,
        avgExclusiveArea: null,
        households: null,
        value: null,
        changeManwon: null,
        sample: 0,
        badge: 'NO_TRADE',
      }),
      rankingItem({
        rank: 2,
        lawdCd: '11110',
        latitude: null,
        longitude: null,
        badge: 'LOW_SAMPLE',
        sample: 1,
      }),
    ]);
    const props = rankingProps();
    render(<RankingSection {...props} />);
    const [noTrade, noCoordinates] = screen.getAllByRole('listitem');
    expect(within(noTrade).getByText('최근 12개월 거래 없음')).toBeTruthy();
    expect(
      within(noTrade)
        .getByRole('button', { name: '비교 담기' })
        .hasAttribute('disabled')
    ).toBe(true);
    expect(
      within(noCoordinates)
        .getByRole('button', { name: '지도에서 위치 보기' })
        .hasAttribute('disabled')
    ).toBe(true);
    fireEvent.click(
      within(noCoordinates).getByRole('button', { name: '비교 담기' })
    );
    expect(props.onAddCompare).toHaveBeenCalledWith('HOUSE_COMPLEX-1', 'B59');
    expect(screen.getByText('표본 적음')).toBeTruthy();
  });

  it('moves to the supplied map coordinates and exposes keyboard-operable tabs', () => {
    const props = rankingProps();
    render(<RankingSection {...props} />);
    fireEvent.click(screen.getByRole('button', { name: '지도에서 위치 보기' }));
    expect(props.onViewOnMap).toHaveBeenCalledWith({
      complexId: 'HOUSE_COMPLEX-1',
      latitude: 37.6,
      longitude: 127.02,
    });
    fireEvent.keyDown(screen.getByRole('tab', { name: '구별 대장' }), {
      key: 'ArrowRight',
    });
    expect(props.onRankingTypeChange).toHaveBeenCalledWith('RISE');
  });

  it('distinguishes uncomputed statistics from an empty ranking with a null period', () => {
    mockRankings([], null);
    const props = rankingProps();
    const { rerender } = render(
      <RankingSection {...props} statsComputedDate={null} />
    );
    expect(screen.getByText('통계 준비 중이에요')).toBeTruthy();
    expect(screen.queryByText('조건에 맞는 단지가 없어요.')).toBeNull();
    rerender(<RankingSection {...props} />);
    expect(screen.getByText('조건에 맞는 단지가 없어요.')).toBeTruthy();
    expect(screen.getByText('정보 없음')).toBeTruthy();
  });

  it('renders VOLUME as integer counts and FALL guidance with signed changes', () => {
    mockRankings([rankingItem({ value: 37 })]);
    const props = rankingProps();
    const { rerender } = render(
      <RankingSection {...props} rankingType='VOLUME' />
    );
    expect(screen.getByText('37건')).toBeTruthy();
    mockRankings([rankingItem({ value: -8.2, changeManwon: -11000 })]);
    rerender(<RankingSection {...props} rankingType='FALL' />);
    expect(
      screen.getByText('▼ -8.20%').classList.contains('house-change-down')
    ).toBe(true);
    expect(screen.getByText('-1.10억')).toBeTruthy();
    expect(
      screen.getByText(/싸 보이는 단지가 저평가인지 저가치인지/)
    ).toBeTruthy();
  });
});
