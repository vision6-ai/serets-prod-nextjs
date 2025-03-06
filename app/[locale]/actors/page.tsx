import { createClient } from '@supabase/supabase-js'
import { Link } from '@/app/i18n'
import Image from 'next/image'
import { Locale } from '@/config/i18n'
import { unstable_setRequestLocale } from 'next-intl/server'

interface Actor {
  id: string
  name: string
  hebrew_name: string | null
  photo_url: string | null
  slug: string
}

interface ActorTranslation {
  name: string;
  biography: string | null;
  language_code: string;
}

export const revalidate = 3600

async function getActors(locale: Locale) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get actors with translations for the current locale
  const { data: actorsData, error } = await supabase
    .from('actors')
    .select(`
      id,
      slug,
      photo_url,
      translations:actor_translations(
        name,
        language_code
      )
    `)
    .eq('translations.language_code', locale)
    .order('slug')

  if (error) {
    console.error('Error fetching actors:', error)
    return []
  }

  if (!actorsData || actorsData.length === 0) {
    return []
  }

  // Transform the data to match the expected format
  const actors = actorsData.map(actor => {
    // Get the translation for the current locale
    const translation = actor.translations && actor.translations.length > 0 
      ? actor.translations[0] as ActorTranslation
      : null;
    
    return {
      id: actor.id,
      name: translation?.name || actor.slug,
      hebrew_name: locale === 'he' ? translation?.name : null,
      photo_url: actor.photo_url,
      slug: actor.slug
    }
  })

  return actors as Actor[]
}

export default async function ActorsPage({ params }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(params.locale)
  
  const actors = await getActors(params.locale)

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Israeli Actors</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {actors.map((actor: Actor) => (
          <Link
            key={actor.id}
            href={`/actors/${actor.slug}`}
            className="group text-center"
          >
            {actor.photo_url ? (
              <Image
                src={actor.photo_url}
                alt={actor.name}
                className="aspect-square object-cover rounded-full mb-4"
                width={256}
                height={256}
              />
            ) : (
              <div className="aspect-square bg-muted rounded-full mb-4" />
            )}
            <h2 className="font-medium group-hover:text-primary transition-colors">
              {actor.name}
            </h2>
            {actor.hebrew_name && actor.hebrew_name !== actor.name && (
              <p className="text-sm text-muted-foreground">
                {actor.hebrew_name}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
