import { screen, waitFor } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import {
  resetAuthStore,
  useAuthStore,
} from '../../../domains/auth/store/auth-store';
import { renderWithMinimalProviders } from '../../../test/helpers/render';
import { RequireAuth } from '../guards';

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
