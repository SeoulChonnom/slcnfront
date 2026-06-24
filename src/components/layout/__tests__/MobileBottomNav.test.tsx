import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/helpers/render';
import { MobileBottomNav } from '../MobileBottomNav';

describe('MobileBottomNav', () => {
  it('renders labels and marks the active route', () => {
    renderWithProviders(<MobileBottomNav />, {
      route: '/mobile/calendar',
    });

    expect(screen.getByRole('link', { name: /홈/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /기록/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /일정/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /신발/i })).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /일정/i }).getAttribute('aria-current')
    ).toBe('page');
  });
});
