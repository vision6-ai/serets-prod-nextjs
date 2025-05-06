import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

export default function BlogPostNotFound() {
  const t = useTranslations('common')
  const locale = useLocale()
  
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">{t('pageNotFound')}</h1>
      <p className="text-lg text-muted-foreground mb-8">
        The blog post you're looking for doesn't exist or has been removed.
      </p>
      <Link
        href={`/${locale}/blog`}
        className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
      >
        Return to Blog
      </Link>
    </div>
  )
} 