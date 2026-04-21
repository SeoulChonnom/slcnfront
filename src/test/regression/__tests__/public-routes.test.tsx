import { render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryProvider } from '../../../app/providers/QueryProvider';
import { AppRouter } from '../../../app/router/AppRouter';
import { createTestQueryClient } from '../../helpers/query-client';
import {
  resetAuthStore,
  useAuthStore,
} from '../../../domains/auth/store/auth-store';

function createMatchMedia(matches: boolean) {
  return vi.fn().mockImplementation(() => ({
    matches,
    media: '(max-width: 767px)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function LocationProbe() {
  const location = useLocation();

  return (
    <div data-testid="location-probe">
      {location.pathname}
      {location.search}
    </div>
  );
}

function renderApp(route: string) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryProvider>
    );
  }

  return render(
    <>
      <LocationProbe />
      <AppRouter />
    </>,
    { wrapper: Wrapper },
  );
}

describe('public-routes smoke', () => {
  beforeEach(() => {
    sessionStorage.clear();
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
    resetAuthStore();
    vi.unstubAllGlobals();
  });

  it('redirects a public catalog URL into the main device route', async () => {
    vi.stubGlobal('matchMedia', createMatchMedia(false));

    renderApp('/shoesRecom');

    await waitFor(() => {
      expect(screen.getByTestId('location-probe').textContent).toBe(
        '/main/shoesRecom',
      );
    });
    expect(await screen.findByText('서울 촌놈의 신발 추천 👟')).toBeTruthy();
  });

  it('redirects a public catalog URL into the mobile device route', async () => {
    vi.stubGlobal('matchMedia', createMatchMedia(true));

    renderApp('/shoesRecom');

    await waitFor(() => {
      expect(screen.getByTestId('location-probe').textContent).toBe(
        '/mobile/shoesRecom',
      );
    });
    expect(await screen.findByText('서울 촌놈의 신발 추천 👟')).toBeTruthy();
  });

  it('sends unknown public paths to the 404 route', async () => {
    vi.stubGlobal('matchMedia', createMatchMedia(false));

    renderApp('/missing/path/extra');

    await waitFor(() => {
      expect(screen.getByTestId('location-probe').textContent).toBe(
        '/main/404',
      );
    });
    expect(await screen.findByText('페이지를 찾을 수 없어요.')).toBeTruthy();
  });
});
