import { unstable_setRequestLocale } from 'next-intl/server'
import { LanguageSwitcherClient } from './client'

export function LanguageSwitcher({ locale }: { locale: string }) {
  unstable_setRequestLocale(locale)
  
  return <LanguageSwitcherClient />
}