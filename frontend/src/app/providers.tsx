'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useAuthStore } from '@/store/auth.store';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const refreshAuth = useAuthStore((s) => s.refreshAuth);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000,      // 2 min – reduce refetches
            gcTime: 10 * 60 * 1000,         // 10 min garbage collection
            retry: (failureCount, error: any) => {
              // Don't retry on auth/forbidden errors
              if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
              }
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: 'always',
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthInitializer>{children}</AuthInitializer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
