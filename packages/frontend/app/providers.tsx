// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { preloadFingerprint } from "@/lib/client/fingerprint";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            gcTime: 5 * 60 * 1000, // 5 minuti (ex cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  useEffect(() => {
    preloadFingerprint();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme">
        <AuthProvider>
          {children}
          <Toaster />
          {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
