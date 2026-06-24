import { screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { HomePage as MainHomePage } from '../../../pages/main/HomePage';
import { HomePage as MobileHomePage } from '../../../pages/mobile/HomePage';
import { renderWithMinimalProviders } from '../../helpers/render';

function renderInApp(ui: ReactElement, route: string) {
  return renderWithMinimalProviders(ui, { route });
}

describe('navigation smoke', () => {
  it('renders desktop home links for core domains', () => {
    renderInApp(<MainHomePage />, '/main');

    expect(
      screen.getByRole('link', { name: /나들이 기록/i }).getAttribute('href')
    ).toBe('/main/map');
    expect(
      screen.getByRole('link', { name: /신발 추천/i }).getAttribute('href')
    ).toBe('/main/shoesRecom');
    expect(
      screen
        .getByRole('link', { name: /Choi's Film Art/i })
        .getAttribute('href')
    ).toBe('http://naver.me/52RjLNuT');
  });

  it('renders mobile home links with mobile-prefixed routes', () => {
    renderInApp(<MobileHomePage />, '/mobile');

    expect(
      screen.getByRole('link', { name: /나들이 기록/i }).getAttribute('href')
    ).toBe('/mobile/map');
    expect(
      screen.getByRole('heading', { name: '서울 촌놈 나들이 기록' })
    ).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: /Choi's Film Art/i })
        .getAttribute('href')
    ).toBe('http://naver.me/52RjLNuT');
  });
});
