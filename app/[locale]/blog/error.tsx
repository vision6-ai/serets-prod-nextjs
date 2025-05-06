'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('common')

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">{t('error')}</h1>
      <p className="text-lg text-muted-foreground mb-8">
        {t('errorDesc')}
      </p>
      <div className="flex gap-4 justify-center">
        <Button onClick={() => reset()}>{t('tryAgain')}</Button>
        <Button variant="outline" asChild>
          <a href="/blog">{t('goHome')}</a>
        </Button>
      </div>
    </div>
  )
} 