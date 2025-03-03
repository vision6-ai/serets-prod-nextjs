import { useTranslations } from 'next-intl'

export default function NotFound() {
  const t = useTranslations('common')
  
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - {t('pageNotFound')}</h1>
      <p className="text-xl text-muted-foreground mb-8">
        {t('pageNotFoundDesc')}
      </p>
    </div>
  )
}
