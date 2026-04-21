import { render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { QueryProvider } from '../../providers/QueryProvider';
import { createTestQueryClient } from '../../../test/helpers/query-client';
import {
  resetAuthStore,
  useAuthStore,
} from '../../../domains/auth/store/auth-store';
import { AppRouter } from '../AppRouter';

vi.mock('../../../pages/mobile/CalendarMonthPage', () => ({
  CalendarMonthPage: () => <div>모바일 월간 캘린더</div>,
}));

vi.mock('../../../pages/mobile/CalendarWeekPage', () => ({
  CalendarWeekPage: () => <div>모바일 주간 캘린더</div>,
}));

vi.mock('../../../pages/main/CalendarMonthPage', () => ({
  CalendarMonthPage: () => <div>데스크톱 월간 캘린더</div>,
}));

vi.mock('../../../pages/main/CalendarWeekPage', () => ({
  CalendarWeekPage: () => <div>데스크톱 주간 캘린더</div>,
}));

function stubMatchMedia(matches: boolean) {
  window.matchMedia = ((query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) satisfies MediaQueryList) as typeof window.matchMedia;
}

function renderAppRouter(route: string) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryProvider>
    );
  }

  return render(<AppRouter />, { wrapper: Wrapper });
}

describe('AppRouter', () => {
  beforeEach(() => {
    resetAuthStore();
    stubMatchMedia(false);
  });

  afterEach(() => {
    resetAuthStore();
  });

  it('resolves public routes through device routing and guard redirects', async () => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: null,
      userInfo: null,
      restoreState: 'error',
    });
    renderAppRouter('/map');

    await waitFor(() => {
      expect(screen.getByText('SLCN Login')).toBeTruthy();
    });
  });

  it('renders authenticated internal routes inside the mobile shell', async () => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: 'demo-token',
      userInfo: {
        name: 'SLCN Demo',
        userName: 'demo',
        roleList: ['admin'],
      },
      restoreState: 'success',
    });

    renderAppRouter('/mobile/calendar');

    await waitFor(() => {
      expect(screen.getByText('모바일 월간 캘린더')).toBeTruthy();
    });

    expect(
      screen.getByRole('navigation', { name: '모바일 하단 내비게이션' }),
    ).toBeTruthy();
  });

  it('sends unknown internal routes to the device specific not-found page', async () => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: null,
      userInfo: null,
      restoreState: 'error',
    });
    renderAppRouter('/main/not-a-route');

    await waitFor(() => {
      expect(screen.getByText('페이지를 찾을 수 없어요.')).toBeTruthy();
    });
  });
});
