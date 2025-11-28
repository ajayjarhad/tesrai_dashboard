import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (
          error?.status >= 400 &&
          error?.status < 500 &&
          error?.status !== 408 &&
          error?.status !== 429
        ) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Add default error handling
      throwOnError: false,
    },
    mutations: {
      retry: 1,
      // Default mutation settings
      throwOnError: true,
    },
  },
});
