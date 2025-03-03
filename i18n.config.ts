import { getRequestConfig } from 'next-intl/server';
import { locales } from '@/config/i18n';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) {
    throw new Error(`Locale ${locale} is not supported`);
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Asia/Jerusalem',
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }
      }
    },
    defaultTranslationValues: {
      year: new Date().getFullYear(),
      locale
    }
  };
});