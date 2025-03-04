'use client'

import { MoviesContent } from '@/components/movies/movies-content'
import { useTranslations } from 'next-intl'

export default function MoviesPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('movies')
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
      <MoviesContent />
    </div>
  )
}
