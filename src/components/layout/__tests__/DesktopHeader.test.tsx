import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/helpers/render';
import { DesktopHeader } from '../DesktopHeader';

describe('DesktopHeader', () => {
  it('renders the primary navigation items', () => {
    renderWithProviders(<DesktopHeader />, {
      route: '/calendar',
    });

    expect(
      screen.getByRole('link', { name: /SLCN 홈으로 이동/i })
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: '나들이 기록' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '나들이 일정' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '신발 추천' })).toBeTruthy();
  });
});
