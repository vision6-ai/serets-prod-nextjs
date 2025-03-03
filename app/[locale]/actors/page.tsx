import { createClient } from '@supabase/supabase-js'
import { Link } from '@/app/i18n'
import Image from 'next/image'
import { useLocale } from 'next-intl'

interface Actor {
  id: string
  name: string
  hebrew_name: string | null
  photo_url: string | null
  slug: string
}

export const revalidate = 3600

async function getActors() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: actors } = await supabase
    .from('actors')
    .select('*')
    .order('name')

  return actors as Actor[] || []
}

export default async function ActorsPage() {
  const actors = await getActors()

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
            {actor.hebrew_name && (
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
