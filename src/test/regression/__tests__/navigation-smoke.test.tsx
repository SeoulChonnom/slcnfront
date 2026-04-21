import { render, screen } from '@testing-library/react';
import type { PropsWithChildren, ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '../../../app/providers/AppProviders';
import { HomePage as MainHomePage } from '../../../pages/main/HomePage';
import { HomePage as MobileHomePage } from '../../../pages/mobile/HomePage';

function renderInApp(ui: ReactElement, route: string) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <AppProviders>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </AppProviders>
    );
  }

  return render(ui, { wrapper: Wrapper });
}

describe('navigation smoke', () => {
  it('renders desktop home links for core domains', () => {
    renderInApp(<MainHomePage />, '/main');

    expect(
      screen.getByRole('link', { name: /\bmap\b/i }).getAttribute('href'),
    ).toBe('/main/map');
    expect(
      screen.getByRole('link', { name: /\brecom\b/i }).getAttribute('href'),
    ).toBe('/main/shoesRecom');
    expect(
      screen
        .getByRole('link', { name: /Choi's Film Art~🎞/i })
        .getAttribute('href'),
    ).toBe('http://naver.me/52RjLNuT');
  });

  it('renders mobile home links with mobile-prefixed routes', () => {
    renderInApp(<MobileHomePage />, '/mobile');

    expect(
      screen
        .getAllByRole('link', { name: '바로 이동' })[0]
        ?.getAttribute('href'),
    ).toBe('/mobile/map');
    expect(
      screen.getByRole('heading', { name: '서울 촌놈 나들이 기록 📷' }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: "Choi's Film Art~🎞" })
        .getAttribute('href'),
    ).toBe('http://naver.me/52RjLNuT');
  });
});
