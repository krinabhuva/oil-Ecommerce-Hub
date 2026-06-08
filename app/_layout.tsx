import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LanguageProvider } from "@/context/LanguageContext";
import { OilProvider } from "@/context/OilContext";

const queryClient = new QueryClient();

type RootProvidersProps = {
  children: React.ReactNode;
};

export default function RootProviders({ children }: RootProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <OilProvider>{children}</OilProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
