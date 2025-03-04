'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'

interface Actor {
  id: string
  name: string
  hebrew_name: string | null
  photo_url: string | null
  slug: string
}

export function FeaturedActors() {
  const [actors, setActors] = useState<Actor[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchActors() {
      try {
        const { data, error } = await supabase
          .from('actors')
          .select('*')
          .limit(6)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setActors(data || [])
      } catch (error) {
        console.error('Error fetching actors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActors()
  }, [supabase])

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