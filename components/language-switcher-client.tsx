'use client'

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
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

// Map of locale codes to flag emojis
const localeFlags: Record<string, string> = {
  en: '🇺🇸',
  he: '🇮🇱',
}

export function LanguageSwitcherClient({ locale: initialLocale }: { locale: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('common')
  const [currentLocale, setCurrentLocale] = useState(initialLocale)

  useEffect(() => {
    setCurrentLocale(initialLocale)
  }, [initialLocale])

  const switchLocale = (newLocale: Locale) => {
    setCurrentLocale(newLocale)
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="flex items-center" dir="ltr">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9 px-3">
            <span className="text-base">{localeFlags[currentLocale]}</span>
            <span className="font-medium">{localeNames[currentLocale as Locale]}</span>
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
              {currentLocale === code && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
