'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/app/i18n'
import { Button } from '@/components/ui/button'
import { localeNames, type Locale } from '@/config/i18n'

export function LanguageSwitcherClient() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="flex items-center gap-2" dir="ltr">
      {Object.entries(localeNames).map(([code, name]) => (
        <Button
          key={code}
          variant={locale === code ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchLocale(code as Locale)}
          className={locale === code ? 'pointer-events-none' : ''}
        >
          {name}
        </Button>
      ))}
    </div>
  )
}