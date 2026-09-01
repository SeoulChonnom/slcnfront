import { screen } from '@testing-library/react';
import { DetailMobileShell } from '@/app/shells/DetailMobileShell';
import { MainDesktopShell } from '@/app/shells/MainDesktopShell';
import { MainMobileShell } from '@/app/shells/MainMobileShell';
import { PublicShell } from '@/app/shells/PublicShell';
import { renderWithProviders } from '@/test/helpers/render';

describe('shell components', () => {
  it('renders the desktop shell with header and footer', () => {
    renderWithProviders(
      <MainDesktopShell>
        <p>desktop-content</p>
      </MainDesktopShell>,
      {
        route: '/main',
      }
    );

    expect(screen.getByText('desktop-content')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'SLCN 홈으로 이동' })).toBeTruthy();
    expect(screen.getByText('© 2024 SLCN.')).toBeTruthy();
  });

  it('hides the film footer link only on the desktop home route', () => {
    renderWithProviders(<MainDesktopShell />, { route: '/main' });

    expect(screen.queryByRole('link', { name: /Choi's Film Art/i })).toBeNull();
  });

  it('keeps the film footer link on non-home desktop routes', () => {
    renderWithProviders(<MainDesktopShell />, { route: '/main/calendar' });

    expect(screen.getByRole('link', { name: /Choi's Film Art/i })).toBeTruthy();
  });

  it('renders the mobile shell with top bar and bottom navigation', () => {
    renderWithProviders(
      <MainMobileShell>
        <p>mobile-content</p>
      </MainMobileShell>,
      {
        route: '/mobile',
      }
    );

    expect(screen.getByText('mobile-content')).toBeTruthy();
    expect(screen.getByText('서울 촌놈')).toBeTruthy();
    expect(
      screen.getByRole('navigation', { name: '모바일 하단 내비게이션' })
    ).toBeTruthy();
  });

  it('renders the detail mobile shell without the bottom navigation', () => {
    renderWithProviders(
      <DetailMobileShell title='DETAIL'>
        <p>detail-content</p>
      </DetailMobileShell>,
      {
        route: '/mobile/map/register',
      }
    );

    expect(screen.getByText('detail-content')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '이전 화면으로 이동' })
    ).toBeTruthy();
    expect(
      screen.queryByRole('navigation', { name: '모바일 하단 내비게이션' })
    ).toBeNull();
  });

  it('titles the travel register route, not the generic detail fallback', () => {
    renderWithProviders(
      <DetailMobileShell title='DETAIL'>
        <p>register-content</p>
      </DetailMobileShell>,
      {
        route: '/mobile/travel/register',
      }
    );

    expect(screen.getByText('새 여행')).toBeTruthy();
    expect(screen.queryByText('신발 상세')).toBeNull();
    expect(
      screen
        .getByRole('link', { name: '이전 화면으로 이동' })
        .getAttribute('href')
    ).toBe('/mobile/travel');
  });

  it('titles the travel edit route and points its back arrow at the travel list', () => {
    renderWithProviders(
      <DetailMobileShell title='DETAIL'>
        <p>edit-content</p>
      </DetailMobileShell>,
      {
        route: '/mobile/travel/travel-1/edit',
      }
    );

    expect(screen.getByText('여행 수정')).toBeTruthy();
    expect(screen.queryByText('신발 상세')).toBeNull();
    expect(
      screen
        .getByRole('link', { name: '이전 화면으로 이동' })
        .getAttribute('href')
    ).toBe('/mobile/travel');
  });

  it('renders the public shell as a centered standalone surface', () => {
    renderWithProviders(
      <PublicShell>
        <p>public-content</p>
      </PublicShell>,
      {
        route: '/login',
      }
    );

    expect(screen.getByText('public-content')).toBeTruthy();
    expect(
      screen.queryByRole('navigation', { name: '모바일 하단 내비게이션' })
    ).toBeNull();
    expect(screen.queryByText('Contact . Terms . Privacy')).toBeNull();
  });
});
