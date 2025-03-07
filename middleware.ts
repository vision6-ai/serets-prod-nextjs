import createMiddleware from 'next-intl/middleware'
import { locales } from './config/i18n'

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'he',

  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  localePrefix: 'always'
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(he|en)/:path*']
}
