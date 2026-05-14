import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../../test/helpers/render';
import { getShoesCatalog } from '../../data/shoes-data';
import { ShoeCard } from '../ShoeCard';

describe('ShoeCard', () => {
  it('renders shoe info and links to the device detail route', () => {
    const brand = getShoesCatalog()[1];

    if (!brand) {
      throw new Error('Expected second shoe brand fixture to exist.');
    }

    const shoe = brand.shoes[1];

    if (!shoe) {
      throw new Error('Expected second shoe fixture to exist.');
    }

    renderWithProviders(<ShoeCard device='main' brand={brand} shoe={shoe} />);

    expect(screen.getByText('나이키')).toBeTruthy();
    expect(screen.getByText('V2K 런')).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'V2K 런 상세 보기' })
        .getAttribute('href')
    ).toBe('/main/nike/v2k');
  });
});
