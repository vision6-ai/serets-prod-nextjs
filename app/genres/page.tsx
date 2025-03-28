'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { SEO } from '@/components/seo'
import { supabase } from '@/lib/supabase'

interface Genre {
  name: string
  slug: string
}

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGenres() {
      try {
        // Use the new schema with translations
        const { data, error } = await supabase
          .from('genres')
          .select(`
            id, 
            slug,
            translations:genre_translations(name, language_code)
          `)
          .order('slug')

        if (error) throw error
        
        // Transform the data to match the expected format
        const transformedData = data?.map(genre => {
          // Find English translation
          const englishTranslation = genre.translations?.find(t => t.language_code === 'en')
          
          return {
            name: englishTranslation?.name || genre.slug,
            slug: genre.slug
          }
        }) || []
        
        setGenres(transformedData)
      } catch (error) {
        console.error('Error fetching genres:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGenres()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="Movie Genres - Israeli Cinema"
        description="Browse Israeli movies by genre. Find drama, comedy, documentary, and more."
        keywords={['Israeli movies', 'movie genres', 'Israeli cinema', 'Hebrew movies']}
      />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Movie Genres</h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 text-center">
                  <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {genres.map((genre) => (
              <Card key={genre.slug} className="hover-card">
                <Link href={`/genres/${genre.slug}`}>
                  <CardContent className="p-6 text-center hover:bg-accent/5 transition-colors">
                    <h2 className="text-xl font-semibold mb-2">{genre.name}</h2>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}