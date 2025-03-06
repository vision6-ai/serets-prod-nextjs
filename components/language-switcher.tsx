'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/app/i18n'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check } from 'lucide-react'
import { localeNames, type Locale, locales } from '@/config/i18n'

// Map of locale codes to flag emojis
const localeFlags: Record<string, string> = {
  en: '🇺🇸',
  he: '🇮🇱',
}

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Get current locale from window location
  const [currentLocale, setCurrentLocale] = useState<Locale>('en')
  
  useEffect(() => {
    // Update locale based on current URL
    const path = window.location.pathname
    setCurrentLocale(path.startsWith('/he') ? 'he' : 'en')
  }, [pathname])
  
  const switchLocale = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    
    // Get the path without the locale prefix
    const newPath = pathname.replace(/^\/(en|he)/, '');
    
    // Construct the new URL with the new locale
    const newUrl = newPath === '' ? `/${newLocale}` : `/${newLocale}${newPath}`;
    
    // Navigate to new URL
    window.location.pathname = newUrl;
  }

  return (
    <div className="flex items-center" dir="ltr">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9 px-3">
            <span className="text-base">{localeFlags[currentLocale]}</span>
            <span className="font-medium">{localeNames[currentLocale]}</span>
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
