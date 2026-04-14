import { screen } from '@testing-library/react';
import { MobileBottomNav } from '../MobileBottomNav';
import { renderWithProviders } from '../../../test/helpers/render';

describe('MobileBottomNav', () => {
  it('renders labels and marks the active route', () => {
    renderWithProviders(<MobileBottomNav />, {
      route: '/mobile/calendar',
    });

    expect(screen.getByRole('link', { name: '메인' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '나들이' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '달력' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '신발' })).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '달력' }).getAttribute('aria-current'),
    ).toBe('page');
  });
});
