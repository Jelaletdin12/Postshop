"use client"

import { QueryClientProvider, HydrationBoundary } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import type { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
  dehydratedState?: unknown
}

export function Providers({ children, dehydratedState }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        {children}
      </HydrationBoundary>
    </QueryClientProvider>
  )
}