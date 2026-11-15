import type { PropsWithChildren } from 'react';
import { AccessTokenRefreshBootstrap } from '@/app/providers/AccessTokenRefreshBootstrap';
import { AuthBootstrap } from '@/app/providers/AuthBootstrap';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { SessionRestoreBootstrap } from '@/app/providers/SessionRestoreBootstrap';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AccessTokenRefreshBootstrap />
        <AuthBootstrap />
        <SessionRestoreBootstrap />
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
}
