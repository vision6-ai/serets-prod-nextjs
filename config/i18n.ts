export const locales = ['en', 'he'] as const;
export const defaultLocale = 'en' as const;

export const localeNames = {
  en: 'English',
  he: 'עברית'
} as const;

export type Locale = (typeof locales)[number];