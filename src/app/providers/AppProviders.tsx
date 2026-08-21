import type { PropsWithChildren } from 'react';
import { ThemeProvider } from '../../lib/theme/ThemeProvider';
import { AuthBootstrap } from './AuthBootstrap';
import { QueryProvider } from './QueryProvider';
import { SessionRestoreBootstrap } from './SessionRestoreBootstrap';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthBootstrap />
        <SessionRestoreBootstrap />
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
}
