import { screen } from '@testing-library/react';
import { DesktopHeader } from './DesktopHeader';
import { renderWithProviders } from '../../test/helpers/render';

describe('DesktopHeader', () => {
  it('renders the primary navigation items', () => {
    renderWithProviders(<DesktopHeader />, {
      route: '/calendar',
    });

    expect(screen.getByRole('link', { name: 'SLCN 홈으로 이동' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '나들이' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '달력' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '신발' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '사용자 메뉴' })).toBeTruthy();
  });
});
