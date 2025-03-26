'use client'

import { PropsWithChildren, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from 'next-themes'
import GTMRouteTracker from '@/components/analytics/gtm-route-tracker'
import { initializeDataLayer } from '@/lib/gtm'
import { SpeedInsights } from "@vercel/speed-insights/next"

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
      retry: 3, // Retry failed requests 3 times
      retryDelay: attemptIndex => Math.min(1000 * (2 ** attemptIndex), 30000), // Exponential backoff
    },
  },
})

interface ProvidersProps extends PropsWithChildren {
  locale: string
  messages: Record<string, any>
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  // Initialize dataLayer when the component mounts
  useEffect(() => {
    initializeDataLayer()
  }, [])

  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={messages}
      // The timeZone is now handled by i18n.config.ts
      timeZone="America/New_York"
      now={new Date()}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
        disableTransitionOnChange={false}
        storageKey="serets-theme"
      >
        <QueryClientProvider client={queryClient}>
          {/* Add GTM Route Tracker */}
          <GTMRouteTracker />
          {children}
          {/* Add Vercel Speed Insights */}
          <SpeedInsights />
        </QueryClientProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}