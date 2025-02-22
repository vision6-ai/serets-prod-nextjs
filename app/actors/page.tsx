'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { SEO } from '@/components/seo'

interface Actor {
  id: string
  name: string
  hebrew_name: string | null
  photo_url: string | null
  birth_date: string | null
}

export default function ActorsPage() {
  const [actors, setActors] = useState<Actor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActors() {
      try {
        const { data, error } = await supabase
          .from('actors')
          .select('*')
          .order('name')
        
        if (error) throw error
        setActors(data || [])
      } catch (error) {
        console.error('Error fetching actors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActors()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="Actors"
        description="Discover Israeli actors and their filmography. From rising stars to veteran performers of Israeli cinema."
        keywords={['Israeli actors', 'Israeli cinema', 'Hebrew actors', 'filmography']}
      />

      <h1 className="text-4xl font-bold mb-8">Actors</h1>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse loading-shimmer">
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-full mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {actors.map((actor) => (
            <Card key={actor.id} className="hover-card">
              <Link href={`/actors/${actor.slug}`}>
                <CardContent className="p-4 hover:bg-accent/5 transition-colors">
                  {actor.photo_url ? (
                    <img
                      src={actor.photo_url}
                      alt={actor.name}
                      className="aspect-square object-cover rounded-full mb-4"
                    />
                  ) : (
                    <div className="aspect-square bg-muted rounded-full mb-4" />
                  )}
                  <h3 className="font-semibold text-center mb-1">{actor.name}</h3>
                  {actor.hebrew_name && (
                    <h4 className="text-sm text-muted-foreground text-center">
                      {actor.hebrew_name}
                    </h4>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}