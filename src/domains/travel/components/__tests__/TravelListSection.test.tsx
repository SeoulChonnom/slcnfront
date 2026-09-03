import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { TravelListSection } from '@/domains/travel/components/TravelListSection';
import type { TravelListItem } from '@/domains/travel/types';
import { renderWithProviders } from '@/test/helpers/render';

const useTravelListMock = vi.fn();

vi.mock('@/domains/travel/hooks/useTravelList', () => ({
  useTravelList: () => useTravelListMock(),
}));

function travel(overrides: Partial<TravelListItem>): TravelListItem {
  return {
    id: 'travel-id',
    travelId: 'travel-id',
    title: '여행',
    region: '지역',
    startDate: '2025-01-01',
    endDate: '2025-01-02',
    displayStartDate: '2025.01.01',
    displayEndDate: '2025.01.02',
    dateRangeLabel: '2025.01.01 – 2025.01.02',
    nightsDaysLabel: '1박 2일',
    coverPhotoId: null,
    oneLineReview: null,
    nights: 1,
    days: 2,
    tags: [],
    ...overrides,
  };
}

// API order is newest-first; the two 2025 entries stay adjacent so grouping
// by year matches encounter order without needing to re-sort.
const travels = [
  travel({
    id: 'travel-busan',
    title: '부산 여행',
    region: '부산',
    startDate: '2025-08-12',
    dateRangeLabel: '2025.08.12 – 2025.08.14',
  }),
  travel({
    id: 'travel-seoul',
    title: '서울 나들이',
    region: '서울',
    startDate: '2025-03-01',
    dateRangeLabel: '2025.03.01 – 2025.03.02',
  }),
  travel({
    id: 'travel-jeju',
    title: '제주 겨울여행',
    region: '제주',
    startDate: '2023-01-10',
    dateRangeLabel: '2023.01.10 – 2023.01.13',
  }),
];

describe('TravelListSection', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a year heading per distinct year, in API order', () => {
    useTravelListMock.mockReturnValue({
      data: travels,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TravelListSection device='main' />);

    const yearHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(yearHeadings.map((heading) => heading.textContent)).toEqual([
      '2025년',
      '2023년',
    ]);
  });

  it('narrows the rendered cards when searching by title', () => {
    useTravelListMock.mockReturnValue({
      data: travels,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TravelListSection device='main' />);

    const input = screen.getByLabelText('여행 검색');
    fireEvent.change(input, { target: { value: '부산' } });

    expect(screen.getByText('부산 여행')).toBeTruthy();
    expect(screen.queryByText('서울 나들이')).toBeNull();
    expect(screen.queryByText('제주 겨울여행')).toBeNull();
  });

  it('narrows the rendered cards when searching by region', () => {
    useTravelListMock.mockReturnValue({
      data: travels,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TravelListSection device='main' />);

    const input = screen.getByLabelText('여행 검색');
    fireEvent.change(input, { target: { value: '제주' } });

    expect(screen.getByText('제주 겨울여행')).toBeTruthy();
    expect(screen.queryByText('부산 여행')).toBeNull();
    expect(screen.queryByText('서울 나들이')).toBeNull();
  });

  it('shows a distinct no-results state for a query that matches nothing', () => {
    useTravelListMock.mockReturnValue({
      data: travels,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TravelListSection device='main' />);

    const input = screen.getByLabelText('여행 검색');
    fireEvent.change(input, { target: { value: '존재하지 않는 지역' } });

    expect(screen.getByText('검색 결과가 없어요.')).toBeTruthy();
    expect(screen.queryByText('아직 남긴 여행이 없어요.')).toBeNull();
  });

  it('shows the empty-archive state for an empty API response', () => {
    useTravelListMock.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TravelListSection device='main' />);

    expect(screen.getByText('아직 남긴 여행이 없어요.')).toBeTruthy();
    expect(screen.queryByText('검색 결과가 없어요.')).toBeNull();
  });

  it('gives the search input an accessible name', () => {
    useTravelListMock.mockReturnValue({
      data: travels,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TravelListSection device='main' />);

    const input = screen.getByRole('searchbox', { name: '여행 검색' });
    expect(input).toBeTruthy();
  });
});
