import { screen } from '@testing-library/react';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { renderWithProviders } from '@/test/helpers/render';

describe('MobileBottomNav', () => {
  it('renders labels and marks the active route', () => {
    renderWithProviders(<MobileBottomNav />, {
      route: '/mobile/calendar',
    });

    expect(screen.getByRole('link', { name: /홈/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /나들이/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /여행/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /달력/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /신발/i })).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /달력/i }).getAttribute('aria-current')
    ).toBe('page');
    // The icon is keyed on a stable name, not the visible label.
    expect(
      screen.getByRole('link', { name: /나들이/i }).querySelector('svg')
    ).toBeTruthy();
  });
});
