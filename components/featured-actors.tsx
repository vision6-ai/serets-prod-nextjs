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
  id: string
  actor_id: string
  language_code: string
  name: string
  biography: string | null
}

export function FeaturedActors() {
  const [actors, setActors] = useState<Actor[]>([])
  const [loading, setLoading] = useState(true)
  const locale = useLocale() as string
  const supabase = createClient()

  useEffect(() => {
    async function fetchActors() {
      try {
        // Get actors from the base table
        const { data: actorsData, error } = await supabase
          .from('actors')
          .select('*')
          .limit(6)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        if (!actorsData || actorsData.length === 0) {
          setActors([])
          return
        }
        
        // Get translations for each actor
        const actorIds = actorsData.map(actor => actor.id)
        
        // Get translations for the current locale
        const { data: currentLocaleTranslations } = await supabase
          .from('actor_translations')
          .select('*')
          .in('actor_id', actorIds)
          .eq('language_code', locale)
        
        // Create a map of translations by actor_id
        const translationsByActorId: Record<string, ActorTranslation> = {}
        
        // Add current locale translations to the map
        if (currentLocaleTranslations) {
          for (const translation of currentLocaleTranslations) {
            translationsByActorId[translation.actor_id] = translation as ActorTranslation
          }
        }
        
        // If we don't have translations for all actors in the current locale and it's not English,
        // get English translations for the missing actors
        if (locale !== 'en') {
          const missingActorIds = actorIds.filter(id => !translationsByActorId[id])
          
          if (missingActorIds.length > 0) {
            const { data: englishTranslations } = await supabase
              .from('actor_translations')
              .select('*')
              .in('actor_id', missingActorIds)
              .eq('language_code', 'en')
            
            // Add English translations to the map
            if (englishTranslations) {
              for (const translation of englishTranslations) {
                if (!translationsByActorId[translation.actor_id]) {
                  translationsByActorId[translation.actor_id] = translation as ActorTranslation
                }
              }
            }
          }
        }
        
        // Combine actor data with translations
        const actorsWithTranslations = actorsData.map(actor => {
          const translation = translationsByActorId[actor.id]
          
          return {
            ...actor,
            name: translation?.name || actor.name,
            hebrew_name: locale === 'he' ? translation?.name : actor.hebrew_name
          }
        })
        
        setActors(actorsWithTranslations)
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
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
                  {actor.hebrew_name && (
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