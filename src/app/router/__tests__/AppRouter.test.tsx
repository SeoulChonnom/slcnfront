import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import {
  resetAuthStore,
  useAuthStore,
} from '../../../domains/auth/store/auth-store';
import { AppRouter } from '../AppRouter';
import { renderWithMinimalProviders } from '../../../test/helpers/render';

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

function renderAppRouter(route: string) {
  return renderWithMinimalProviders(<AppRouter />, { route });
}

describe('AppRouter', () => {
  beforeEach(() => {
    resetAuthStore();
  });

  afterEach(() => {
    resetAuthStore();
  });

  it('redirects unauthenticated internal routes to the device login page', async () => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: null,
      userInfo: null,
      restoreState: 'error',
    });
    renderAppRouter('/main/map');

    expect(await screen.findByRole('button', { name: 'Login' })).toBeTruthy();
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
      screen.getByRole('navigation', { name: '모바일 하단 내비게이션' })
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

  it('sends unknown top-level routes to the main not-found page', async () => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: null,
      userInfo: null,
      restoreState: 'error',
    });
    renderAppRouter('/unknown-top-level-route');

    await waitFor(() => {
      expect(screen.getByText('페이지를 찾을 수 없어요.')).toBeTruthy();
    });
  });

  it('treats removed public routes as top-level not-found paths', async () => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: null,
      userInfo: null,
      restoreState: 'error',
    });
    renderAppRouter('/map');

    await waitFor(() => {
      expect(screen.getByText('페이지를 찾을 수 없어요.')).toBeTruthy();
    });
  });
});
