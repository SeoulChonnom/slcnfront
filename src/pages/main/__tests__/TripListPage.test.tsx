import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../test/helpers/render';
import { TripListPage } from '../TripListPage';
import { useAuthStore } from '../../../domains/auth/store/auth-store';

const useTripListMock = vi.fn();

vi.mock('../../../domains/trip/hooks/useTripList', () => ({
  useTripList: () => useTripListMock(),
}));

vi.mock('../../../domains/trip/hooks/useTripAssetUrls', () => ({
  useTripAssetUrls: () => ({
    '/logo.png': 'blob:logo',
  }),
}));

describe('TripListPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: 'token-123',
      restoreState: 'success',
      userInfo: {
        name: 'SLCN',
        userName: 'slcn-admin',
        roleList: ['admin'],
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    useTripListMock.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TripListPage />, {
      route: '/main/map',
    });

    expect(screen.getByLabelText('loading')).toBeTruthy();
  });

  it('renders empty state', () => {
    useTripListMock.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TripListPage />, {
      route: '/main/map',
    });

    expect(screen.getByText('아직 등록된 나들이가 없어요.')).toBeTruthy();
  });

  it('renders error state', () => {
    useTripListMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: vi.fn(),
    });

    renderWithProviders(<TripListPage />, {
      route: '/main/map',
    });

    expect(screen.getByText('나들이 기록을 불러오지 못했어요.')).toBeTruthy();
  });

  it('renders list content and register CTA in the normal state', () => {
    useTripListMock.mockReturnValue({
      data: [
        {
          id: 'trip-1',
          date: '20991231',
          name: '연말 나들이',
          displayDate: '2099.12.31',
          logoPath: '/logo.png',
          quizTitle: '정답은?',
          quizAnswerIndex: 1,
          quizAnswerTitle: '정답',
          quizAnswerText: '맞았습니다.',
          quizErrorTitle: '오답',
          quizErrorText: '다시 시도하세요.',
          quizResponses: [
            { quizIndex: '0', answer: '보기1' },
            { quizIndex: '1', answer: '보기2' },
          ],
        },
      ],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TripListPage />, {
      route: '/main/map',
    });

    expect(screen.getByText('연말 나들이')).toBeTruthy();
    expect(
      screen.getAllByRole('link', { name: '새 나들이 기록하기' }).length
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: '퀴즈 풀기' })).toBeTruthy();
    expect(screen.getByPlaceholderText('날짜나 나들이 이름')).toBeTruthy();
  });
});
