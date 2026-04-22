import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PropsWithChildren, ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthBootstrap } from '../../app/providers/AuthBootstrap';
import { QueryProvider } from '../../app/providers/QueryProvider';
import { SessionRestoreBootstrap } from '../../app/providers/SessionRestoreBootstrap';
import { createTestQueryClient } from './query-client';

type ExtendedRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  route?: string;
};

export function renderWithAppProviders(
  ui: ReactElement,
  { route = '/', ...options }: ExtendedRenderOptions = {}
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryProvider client={queryClient}>
        <AuthBootstrap />
        <SessionRestoreBootstrap />
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
