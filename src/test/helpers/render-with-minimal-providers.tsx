import { type RenderOptions, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PropsWithChildren, ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryProvider } from '../../app/providers/QueryProvider';
import { createTestQueryClient } from './query-client';

type ExtendedRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  route?: string;
};

export function renderWithMinimalProviders(
  ui: ReactElement,
  { route = '/', ...options }: ExtendedRenderOptions = {}
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryProvider>
    );
  }

  return {
    user: userEvent.setup(),
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}
