import { screen, waitFor } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import {
  resetAuthStore,
  useAuthStore,
} from '../../domains/auth/store/auth-store';
import { renderWithProviders } from '../../test/helpers/render';
import { RequireAuth } from './guards';

function LocationProbe() {
  const location = useLocation();

  return (
    <p data-testid="location-probe">
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

  it('redirects unauthenticated routes to canonical login with a redirect target', async () => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: null,
      userInfo: null,
    });

    renderWithProviders(
      <>
        <Routes>
          <Route path="/login" element={<p>login-page</p>} />
          <Route element={<RequireAuth />}>
            <Route path="/protected" element={<p>private-page</p>} />
          </Route>
        </Routes>
        <LocationProbe />
      </>,
      {
        route: '/protected',
      },
    );

    await waitFor(() => {
      expect(screen.getByText('login-page')).toBeTruthy();
    });

    expect(screen.getByTestId('location-probe').textContent).toBe(
      '/login?redirect=%2Fprotected',
    );
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
    });

    renderWithProviders(
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/protected" element={<p>private-page</p>} />
        </Route>
      </Routes>,
      {
        route: '/protected',
      },
    );

    await waitFor(() => {
      expect(screen.getByText('private-page')).toBeTruthy();
    });
  });
});
