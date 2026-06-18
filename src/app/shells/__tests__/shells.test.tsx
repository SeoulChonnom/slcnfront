import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/helpers/render';
import { DetailMobileShell } from '../DetailMobileShell';
import { MainDesktopShell } from '../MainDesktopShell';
import { MainMobileShell } from '../MainMobileShell';
import { PublicShell } from '../PublicShell';

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
    expect(screen.getByText('서울 촌놈 나들이 기록 📷')).toBeTruthy();
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
