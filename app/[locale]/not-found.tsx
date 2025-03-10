'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function NotFound() {
  const t = useTranslations('common')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h1 className="text-4xl font-bold">{t('not_found')}</h1>
      <Link
        href="/"
        className="text-primary hover:underline"
      >
        {t('back_home')}
      </Link>
    </div>
  )
}
