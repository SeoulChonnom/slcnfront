import type { PropsWithChildren } from 'react';
import { AuthBootstrap } from './AuthBootstrap';
import { QueryProvider } from './QueryProvider';
import { SessionRestoreBootstrap } from './SessionRestoreBootstrap';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthBootstrap />
      <SessionRestoreBootstrap />
      {children}
    </QueryProvider>
  );
}
