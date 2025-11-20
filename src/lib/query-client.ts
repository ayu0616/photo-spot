import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Window focus refetching is often not needed for simple data display
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});
