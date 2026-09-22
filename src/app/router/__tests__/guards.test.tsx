import { screen, waitFor } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { RequireAuth, RequireRole } from '@/app/router/guards';
import { resetAuthStore, useAuthStore } from '@/domains/auth/store/auth-store';
import type { Role } from '@/domains/auth/types';
import { renderWithMinimalProviders } from '@/test/helpers/render';

// biome's useValidAriaRole rule treats any JSX `role='...'` string literal as
// an HTML/ARIA role attribute, even on this custom component — routed
// through a typed, non-literal binding so it isn't (mis)validated as one.
const ADMIN_ROLE: Role = 'admin';

function LocationProbe() {
  const location = useLocation();

  return (
    <p data-testid='location-probe'>
      {location.pathname}
      {location.search}
    </p>
  );
}

describe('RequireAuth', () => {
  beforeEach(() => {
    resetAuthStore();
  });

  afterEach(() => {
    resetAuthStore();
  });

  it('redirects unauthenticated main routes to the main login path with a redirect target', async () => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: null,
      userInfo: null,
      restoreState: 'error',
    });

    renderWithMinimalProviders(
      <>
        <Routes>
          <Route path='/main/login' element={<p>login-page</p>} />
          <Route element={<RequireAuth />}>
            <Route path='/main/protected' element={<p>private-page</p>} />
          </Route>
        </Routes>
        <LocationProbe />
      </>,
      {
        route: '/main/protected',
      }
    );

    await waitFor(() => {
      expect(screen.getByText('login-page')).toBeTruthy();
    });

    expect(screen.getByTestId('location-probe').textContent).toBe(
      '/main/login?redirect=%2Fmain%2Fprotected'
    );
  });

  it('redirects unauthenticated mobile routes to the mobile login path with a redirect target', async () => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: null,
      userInfo: null,
      restoreState: 'error',
    });

    renderWithMinimalProviders(
      <>
        <Routes>
          <Route path='/mobile/login' element={<p>mobile-login-page</p>} />
          <Route element={<RequireAuth />}>
            <Route path='/mobile/protected' element={<p>private-page</p>} />
          </Route>
        </Routes>
        <LocationProbe />
      </>,
      {
        route: '/mobile/protected',
      }
    );

    await waitFor(() => {
      expect(screen.getByText('mobile-login-page')).toBeTruthy();
    });

    expect(screen.getByTestId('location-probe').textContent).toBe(
      '/mobile/login?redirect=%2Fmobile%2Fprotected'
    );
  });

  it('shows a pending state while refresh-token restore is in progress', async () => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: null,
      userInfo: null,
      restoreState: 'idle',
    });

    renderWithMinimalProviders(
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path='/main/protected' element={<p>private-page</p>} />
        </Route>
      </Routes>,
      {
        route: '/main/protected',
      }
    );

    await waitFor(() => {
      expect(screen.getByText('세션을 확인하고 있어요.')).toBeTruthy();
    });
  });

  it('renders the protected outlet when a session is present', async () => {
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

    renderWithMinimalProviders(
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path='/main/protected' element={<p>private-page</p>} />
        </Route>
      </Routes>,
      {
        route: '/main/protected',
      }
    );

    await waitFor(() => {
      expect(screen.getByText('private-page')).toBeTruthy();
    });
  });
});

describe('RequireRole', () => {
  beforeEach(() => {
    resetAuthStore();
  });

  afterEach(() => {
    resetAuthStore();
  });

  it('renders its children when the user has the required role', async () => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: 'demo-token',
      userInfo: {
        name: 'Admin',
        userName: 'admin',
        roleList: ['admin', 'user'],
      },
      restoreState: 'success',
    });

    renderWithMinimalProviders(
      <Routes>
        <Route path='/main/404' element={<p>not-found-page</p>} />
        <Route
          path='/main/inspection/questions'
          element={
            <RequireRole role={ADMIN_ROLE} fallbackPath='/main/404'>
              <p>admin-only-page</p>
            </RequireRole>
          }
        />
      </Routes>,
      { route: '/main/inspection/questions' }
    );

    await waitFor(() => {
      expect(screen.getByText('admin-only-page')).toBeTruthy();
    });
  });

  it('redirects to the fallback path (not login) when the role is missing — auth is fine, only permission is missing', async () => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: 'demo-token',
      userInfo: { name: 'User', userName: 'user', roleList: ['user'] },
      restoreState: 'success',
    });

    renderWithMinimalProviders(
      <>
        <Routes>
          <Route path='/main/404' element={<p>not-found-page</p>} />
          <Route
            path='/main/inspection/questions'
            element={
              <RequireRole role={ADMIN_ROLE} fallbackPath='/main/404'>
                <p>admin-only-page</p>
              </RequireRole>
            }
          />
        </Routes>
        <LocationProbe />
      </>,
      { route: '/main/inspection/questions' }
    );

    await waitFor(() => {
      expect(screen.getByText('not-found-page')).toBeTruthy();
    });

    expect(screen.queryByText('admin-only-page')).toBeNull();
    expect(screen.getByTestId('location-probe').textContent).toBe('/main/404');
  });
});
