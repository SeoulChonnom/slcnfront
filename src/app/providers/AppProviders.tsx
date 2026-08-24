import type { PropsWithChildren } from 'react';
import { AuthBootstrap } from '@/app/providers/AuthBootstrap';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { SessionRestoreBootstrap } from '@/app/providers/SessionRestoreBootstrap';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';

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
