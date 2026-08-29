import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from '@/components/layout/Footer';
import { renderWithProviders } from '@/test/helpers/render';

describe('Footer', () => {
  it('can omit the optional Film Art link', () => {
    renderWithProviders(<Footer showFilmLink={false} />);

    expect(screen.queryByRole('link', { name: /Choi's Film Art/i })).toBeNull();
    expect(screen.getByText('© 2024 SLCN.')).toBeTruthy();
  });
});
