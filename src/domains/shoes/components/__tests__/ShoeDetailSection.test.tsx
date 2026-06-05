import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../../test/helpers/render';
import { ShoeDetailSection } from '../ShoeDetailSection';

describe('ShoeDetailSection', () => {
  it('renders a valid shoe detail immediately', () => {
    renderWithProviders(
      <ShoeDetailSection device='main' brandSlug='nike' shoesSlug='v2k' />
    );

    expect(screen.getByRole('heading', { name: 'V2K 런' })).toBeTruthy();
    expect(screen.queryByText('정보를 불러오는 중입니다.')).toBeNull();
  });

  it('shows the fallback for an unknown slug pair', () => {
    renderWithProviders(
      <ShoeDetailSection device='main' brandSlug='nike' shoesSlug='missing' />
    );

    expect(screen.getByText('존재하지 않는 신발입니다.')).toBeTruthy();
  });
});
