'use client'

import { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

export function Providers({
  locale,
  messages,
  children
}: {
  locale: string
  messages: any
  children: ReactNode
}) {
  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={messages}
      timeZone="Asia/Jerusalem"
      now={new Date()}
    >
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
