import { Providers } from './providers'
import { unstable_setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { ToasterProvider } from '@/components/toaster'
import { locales, getDirection } from '@/config/i18n'
import HeaderClient from '@/components/header-client'
import Footer from '@/components/footer'

async function getMessages(locale: string) {
  try {
    return (await import(`@/messages/${locale}.json`)).default
  } catch (error) {
    notFound()
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

interface RootLayoutProps {
  children: React.ReactNode
  params: {
    locale: string
  }
}

export default async function RootLayout({
  children,
  params: { locale }
}: RootLayoutProps) {
  const messages = await getMessages(locale)
  unstable_setRequestLocale(locale)

  return (
    <html lang={locale} dir={getDirection(locale as any)} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body suppressHydrationWarning>
        <Providers locale={locale} messages={messages}>
          <HeaderClient locale={locale} />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer locale={locale} />
          <ToasterProvider />
        </Providers>
      </body>
    </html>
  )
}

// Prevent auto redirect based on user's locale
export const dynamic = 'force-static'
