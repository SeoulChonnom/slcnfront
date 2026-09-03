import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AppRouter } from '@/app/router/AppRouter';
import { resetAuthStore, useAuthStore } from '@/domains/auth/store/auth-store';
import { renderWithMinimalProviders } from '@/test/helpers/render';

vi.mock('@/pages/mobile/CalendarMonthPage', () => ({
  CalendarMonthPage: () => <div>모바일 월간 캘린더</div>,
}));

vi.mock('@/pages/mobile/CalendarWeekPage', () => ({
  CalendarWeekPage: () => <div>모바일 주간 캘린더</div>,
}));

vi.mock('@/pages/main/CalendarMonthPage', () => ({
  CalendarMonthPage: () => <div>데스크톱 월간 캘린더</div>,
}));

vi.mock('@/pages/main/CalendarWeekPage', () => ({
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

    expect(await screen.findByRole('button', { name: '로그인' })).toBeTruthy();
  });

  it('protects the mobile profile route with the mobile login page', async () => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: null,
      userInfo: null,
      restoreState: 'error',
    });
    renderAppRouter('/mobile/profile');

    expect(await screen.findByRole('button', { name: '로그인' })).toBeTruthy();
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

  it('renders the mobile travel register route inside the detail mobile shell, not the main shell', async () => {
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

    renderAppRouter('/mobile/travel/register');

    // The detail shell's top bar carries the real title -- if this route
    // had fallen through to DetailMobileShell's generic '/mobile/' branch
    // it would read '신발 상세' instead, and if it had stayed on
    // MainMobileShell there would be no back link and a bottom nav.
    await waitFor(() => {
      expect(screen.getByText('새 여행')).toBeTruthy();
    });
    expect(screen.queryByText('신발 상세')).toBeNull();

    const backLink = screen.getByRole('link', { name: '이전 화면으로 이동' });
    expect(backLink.getAttribute('href')).toBe('/mobile/travel');

    expect(
      screen.queryByRole('navigation', { name: '모바일 하단 내비게이션' })
    ).toBeNull();
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
