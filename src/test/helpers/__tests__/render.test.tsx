import { useQuery } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../render';

function ProviderProbe() {
  const location = useLocation();
  const query = useQuery({
    queryKey: ['probe'],
    queryFn: async () => 'query-ready',
  });

  return (
    <div>
      <p>{location.pathname}</p>
      <p>{query.data ?? 'loading'}</p>
    </div>
  );
}

describe('renderWithProviders', () => {
  it('wraps components with router and query providers', async () => {
    renderWithProviders(<ProviderProbe />, {
      route: '/calendar',
    });

    expect(screen.getByText('/calendar')).toBeTruthy();
    expect(await screen.findByText('query-ready')).toBeTruthy();
  });
});
