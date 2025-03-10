import { Locale } from '@/config/i18n'
import { unstable_setRequestLocale } from 'next-intl/server'
import { ActorsContent } from '@/components/actors/actors-content'

export const revalidate = 3600

export default async function ActorsPage({ params }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(params.locale)
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Israeli Actors</h1>
      <ActorsContent locale={params.locale} />
    </div>
  )
}
