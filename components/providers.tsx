"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';

export function Providers({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <NextThemesProvider {...props}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
