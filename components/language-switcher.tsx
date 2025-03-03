'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/app/i18n'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check } from 'lucide-react'
import { localeNames, type Locale } from '@/config/i18n'

// Map of locale codes to flag emojis
const localeFlags: Record<string, string> = {
  en: '🇺🇸',
  he: '🇮🇱',
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('common')

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="flex items-center" dir="ltr">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9 px-3">
            <span className="text-base">{localeFlags[locale]}</span>
            <span className="font-medium">{localeNames[locale]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {Object.entries(localeNames).map(([code, name]) => (
            <DropdownMenuItem
              key={code}
              className="flex items-center justify-between cursor-pointer"
              onClick={() => switchLocale(code as Locale)}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{localeFlags[code]}</span>
                <span>{name}</span>
              </div>
              {locale === code && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}