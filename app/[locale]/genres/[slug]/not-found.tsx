import { useTranslations } from 'next-intl'

export default function NotFound() {
  const t = useTranslations('genres')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">{t('notFound')}</h1>
        <p className="text-muted-foreground">
          {t('notFoundDesc')}
        </p>
      </div>
    </div>
  )
}
