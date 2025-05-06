'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { MovieForm } from '../_components/movie-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/utils'

interface MovieTranslation {
  language_code: string
  title: string | null
  synopsis: string | null
  poster_url: string | null
  trailer_url: string | null
  themoviedb_id: string | null
}

interface Movie {
  id?: string
  title: string
  title_he?: string | null
  slug: string
  poster_url: string | null
  release_date: string | null
  duration_minutes: number | null
  rating: number | null
  description: string | null
  description_he?: string | null
  trailer_url: string | null
  content_rating: string | null
  status: 'published' | 'draft'
  original_title: string | null
  imdb_id: string | null
  themoviedb_id: string | null
  genre_ids?: string[]
  translations?: Record<string, MovieTranslation>
}

export default function NewMoviePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const initialData: Movie = {
    title: '',
    slug: '',
    poster_url: null,
    release_date: null,
    duration_minutes: null,
    rating: null,
    description: null,
    title_he: null,
    description_he: null,
    trailer_url: null,
    content_rating: null,
    status: 'draft',
    original_title: null,
    imdb_id: null,
    themoviedb_id: null,
    genre_ids: [],
    translations: {
      en: {
        language_code: 'en',
        title: '',
        synopsis: null,
        poster_url: null,
        trailer_url: null,
        themoviedb_id: null
      },
      he: {
        language_code: 'he',
        title: null,
        synopsis: null,
        poster_url: null,
        trailer_url: null,
        themoviedb_id: null
      }
    }
  }

  const handleSave = async (newMovie: Movie) => {
    setLoading(true)
    setError(null)

    // Generate a slug if not provided
    if (!newMovie.slug && newMovie.title) {
      newMovie.slug = slugify(newMovie.title)
    }
    
    try {
      // Extract the multilingual content and genre IDs
      const { 
        title, // English title from translations
        title_he, // Hebrew title from translations - not a field in the database
        description, // English synopsis from translations
        description_he, // Hebrew synopsis from translations - not a field in the database
        poster_url, // From translations
        trailer_url, // From translations
        genre_ids, 
        translations,
        status, // Not a field in the database
        ...baseMovieData 
      } = newMovie
      
      // Prepare the base movie data with duration mapped correctly
      const movieData = {
        ...baseMovieData,
        duration: baseMovieData.duration_minutes
      }
      delete (movieData as any).duration_minutes
      delete (movieData as any).status // Remove status field since it doesn't exist in database
      delete (movieData as any).content_rating // Remove content_rating field since it doesn't exist in database
      
      // Insert the movie base record
      const { data, error } = await supabase
        .from('movies')
        .insert(movieData)
        .select()
      
      if (error) {
        throw error
      }
      
      // Get the new movie ID
      const newMovieId = data[0].id
      
      // Process all translations
      if (translations) {
        for (const langCode in translations) {
          const translation = translations[langCode]
          
          // Skip empty translations
          if (!translation.title && !translation.synopsis) continue;
          
          const { error: translationError } = await supabase
            .from('movie_translations')
            .insert({
              movie_id: newMovieId,
              language_code: langCode,
              title: translation.title,
              synopsis: translation.synopsis,
              poster_url: translation.poster_url,
              trailer_url: translation.trailer_url,
              themoviedb_id: translation.themoviedb_id
            })
          
          if (translationError) {
            throw translationError
          }
        }
      } else {
        // Fallback to the old structure if translations object isn't available
        // Insert English translation
        const { error: enTranslationError } = await supabase
          .from('movie_translations')
          .insert({
            movie_id: newMovieId,
            language_code: 'en',
            title: title,
            synopsis: description,
            poster_url: poster_url,
            trailer_url: trailer_url
          })
        
        if (enTranslationError) {
          throw enTranslationError
        }
        
        // Insert Hebrew translation if provided
        if (title_he || description_he) {
          const { error: heTranslationError } = await supabase
            .from('movie_translations')
            .insert({
              movie_id: newMovieId,
              language_code: 'he',
              title: title_he,
              synopsis: description_he,
              poster_url: poster_url, // Same poster for both languages
              trailer_url: trailer_url // Same trailer for both languages
            })
          
          if (heTranslationError) {
            throw heTranslationError
          }
        }
      }
      
      // Add genre associations
      if (genre_ids && genre_ids.length > 0) {
        const genreAssociations = genre_ids.map(genreId => ({
          movie_id: newMovieId,
          genre_id: genreId
        }))
        
        const { error: insertError } = await supabase
          .from('movie_genres')
          .insert(genreAssociations)
        
        if (insertError) {
          throw insertError
        }
      }
      
      router.push('/dashboard/movies')
    } catch (err: any) {
      console.error('Error creating movie:', err)
      setError(err.message || 'Failed to create movie')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard/movies"
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Movie</h1>
      </div>

      {error && (
        <div className="bg-red-50 p-4 mb-6 rounded-md text-red-700">
          {error}
        </div>
      )}

      <MovieForm 
        initialData={initialData} 
        onSave={handleSave} 
        isLoading={loading}
        isNew
      />
    </div>
  )
} 