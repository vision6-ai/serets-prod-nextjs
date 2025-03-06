import { MoviesContent } from '@/components/movies/movies-content'
import { useTranslations } from 'next-intl'
import { unstable_setRequestLocale } from 'next-intl/server'
import { Locale } from '@/config/i18n'

export default function LatestReleasesPage({ params }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(params.locale)
  const t = useTranslations('movies')
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{t('latestReleases')}</h1>
      <MoviesContent locale={params.locale} />
    </div>
  )
}
