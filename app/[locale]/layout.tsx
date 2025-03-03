import { notFound } from 'next/navigation';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { locales } from '@/config/i18n';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Providers } from './providers';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { PageTransition } from '@/components/page-transition';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: {
      default: t('title'),
      template: '%s | SERETS.CO.IL'
    },
    description: t('description'),
    keywords: t('keywords').split(','),
    openGraph: {
      type: 'website',
      locale: locale,
      alternateLocales: locales.filter(l => l !== locale),
      url: 'https://serets.co.il',
      siteName: 'SERETS.CO.IL',
      title: t('title'),
      description: t('description'),
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'SERETS.CO.IL'
        }
      ]
    }
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate and set the locale
  if (!locales.includes(locale as any)) notFound();
  unstable_setRequestLocale(locale);

  // Get messages for the current locale
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} dir={locale === 'he' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers locale={locale} messages={messages}>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}