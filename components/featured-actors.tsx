'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import { useLocale } from 'next-intl'

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

export function FeaturedActors() {
  const [actors, setActors] = useState<Actor[]>([])
  const [loading, setLoading] = useState(true)
  const locale = useLocale() as string
  const supabase = createClient()

  useEffect(() => {
    async function fetchActors() {
      try {
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
          .limit(6)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error fetching actors:', error)
          setActors([])
          setLoading(false)
          return
        }
        
        if (!actorsData || actorsData.length === 0) {
          setActors([])
          setLoading(false)
          return
        }
        
        // Transform the data to match the expected format
        const transformedActors = actorsData.map(actor => {
          // Get the translation for the current locale
          const translation = actor.translations && actor.translations.length > 0 
            ? actor.translations[0] as ActorTranslation
            : null;
          
          return {
            id: actor.id,
            name: translation?.name || actor.slug,
            hebrew_name: locale === 'he' ? translation?.name || null : null,
            photo_url: actor.photo_url,
            slug: actor.slug
          } as Actor
        })
        
        setActors(transformedActors)
      } catch (error) {
        console.error('Error fetching actors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActors()
  }, [supabase, locale])

  return (
    <section className="py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Featured Actors</h2>
        <Button asChild variant="ghost">
          <Link href="/actors">View All</Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-full overflow-hidden">
        {loading ? (
          // Loading skeleton
          Array(6).fill(null).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-full mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
              </CardContent>
            </Card>
          ))
        ) : (
          // Actual actor cards
          actors.map((actor) => (
            <Card key={actor.id}>
              <Link href={`/actors/${actor.slug}`}>
                <CardContent className="p-4 hover:bg-accent/5 transition-colors">
                  {actor.photo_url ? (
                    <img
                      src={actor.photo_url}
                      alt={actor.name}
                      className="aspect-square object-cover rounded-full mb-4"
                      loading="lazy"
                    />
                  ) : (
                    <div className="aspect-square bg-muted rounded-full mb-4" />
                  )}
                  <h3 className="font-semibold text-center mb-1">
                    {actor.name}
                  </h3>
                  {actor.hebrew_name && actor.hebrew_name !== actor.name && (
                    <h4 className="text-sm text-muted-foreground text-center">
                      {actor.hebrew_name}
                    </h4>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))
        )}
      </div>
    </section>
  )
}