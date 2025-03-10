export const locales = ['he', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale = 'he'

export const localeNames = {
  he: 'עברית',
  en: 'English'
} as const

export function getDirection(locale: Locale) {
  return locale === 'he' ? 'rtl' : 'ltr'
}
