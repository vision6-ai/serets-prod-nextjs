export const locales = ['en', 'he'] as const;
export type Locale = typeof locales[number];

export const defaultLocale = 'en' as const;

export const localeNames = {
  en: 'English',
  he: 'עברית',
} as const;

export const localeDirections = {
  en: 'ltr',
  he: 'rtl',
} as const;
