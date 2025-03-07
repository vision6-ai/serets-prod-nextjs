'use client'

import { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
    },
  },
})

interface ProvidersProps extends PropsWithChildren {
  locale: string
  messages: Record<string, any>
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={messages}
      // The timeZone is now handled by i18n.config.ts
      now={new Date()}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </NextIntlClientProvider>
  )
}
