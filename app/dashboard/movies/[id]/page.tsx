'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { MovieForm } from '../_components/movie-form'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface MovieTranslation {
  language_code: string
  title: string | null
  synopsis: string | null
  poster_url: string | null
  trailer_url: string | null
  themoviedb_id: string | null
}

interface Movie {
  id: string
  title: string
  title_he: string | null
  slug: string
  poster_url: string | null
  release_date: string | null
  duration_minutes: number | null
  rating: number | null
  description: string | null
  description_he: string | null
  trailer_url: string | null
  content_rating: string | null
  status: 'published' | 'draft'
  original_title: string | null
  imdb_id: string | null
  themoviedb_id: string | null
  genre_ids: string[]
  translations?: Record<string, MovieTranslation>
}

export default function EditMoviePage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const movieId = params.id

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // Fetch the movie with join to movie_translations
        const { data: movieData, error: movieError } = await supabase
          .from('movies')
          .select(`
            id, 
            slug, 
            release_date, 
            rating, 
            duration,
            original_title,
            imdb_id,
            themoviedb_id,
            movie_translations (
              id,
              language_code,
              title, 
              synopsis,
              poster_url,
              trailer_url,
              themoviedb_id
            )
          `)
          .eq('id', movieId)
          .single()
        
        if (movieError) {
          throw movieError
        }
        
        // Fetch movie genres
        const { data: movieGenresData, error: genresError } = await supabase
          .from('movie_genres')
          .select('genre_id')
          .eq('movie_id', movieId)
        
        if (genresError) {
          throw genresError
        }
        
        // Organize translations by language code
        const translations: Record<string, MovieTranslation> = {}
        
        // Make sure we always have English and Hebrew records
        const defaultTranslation: MovieTranslation = {
          language_code: 'en',
          title: '',
          synopsis: null,
          poster_url: null,
          trailer_url: null,
          themoviedb_id: null
        }
        
        translations.en = { ...defaultTranslation }
        translations.he = { ...defaultTranslation, language_code: 'he' }
        
        // Fill in with actual data
        movieData.movie_translations.forEach((translation: any) => {
          translations[translation.language_code] = {
            language_code: translation.language_code,
            title: translation.title,
            synopsis: translation.synopsis,
            poster_url: translation.poster_url,
            trailer_url: translation.trailer_url,
            themoviedb_id: translation.themoviedb_id
          }
        })
        
        // Extract English and Hebrew for backward compatibility
        const englishTranslation = translations.en || defaultTranslation
        const hebrewTranslation = translations.he || { ...defaultTranslation, language_code: 'he' }

        // Combine data into expected format for MovieForm
        const fullMovie = {
          id: movieData.id,
          slug: movieData.slug,
          release_date: movieData.release_date,
          rating: movieData.rating,
          duration_minutes: movieData.duration, // Map duration field to duration_minutes
          content_rating: null, // Default to null since field doesn't exist in database
          status: 'published' as 'published', // Specify the type to match Movie interface
          original_title: movieData.original_title,
          imdb_id: movieData.imdb_id,
          themoviedb_id: movieData.themoviedb_id,
          // Translations - for backward compatibility
          title: englishTranslation.title || '',
          title_he: hebrewTranslation.title || null,
          description: englishTranslation.synopsis || null, // Map synopsis to description
          description_he: hebrewTranslation.synopsis || null, // Map synopsis to description_he
          poster_url: englishTranslation.poster_url || null,
          trailer_url: englishTranslation.trailer_url || null,
          // New translations structure
          translations: translations,
          // Genre IDs
          genre_ids: movieGenresData.map((mg: any) => mg.genre_id)
        }
        
        setMovie(fullMovie)
      } catch (err: any) {
        console.error('Error fetching movie:', err)
        setError(err.message || 'Failed to load movie')
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [movieId, supabase])

  const handleSave = async (updatedMovie: Partial<Movie>) => {
    setLoading(true)
    
    try {
      // Get the genre IDs
      const genreIds = updatedMovie.genre_ids || []
      const translations = updatedMovie.translations || {}
      
      // Prepare movie data for the movies table
      const { 
        genre_ids, 
        title, // English title from translations
        title_he, // Hebrew title from translations - not a field in the database
        description, // English synopsis from translations
        description_he, // Hebrew synopsis from translations - not a field in the database
        poster_url, // From translations
        trailer_url, // From translations
        status, // Remove status from data being sent to server - not a field in the database
        translations: translationsObj, 
        ...movieBaseData 
      } = updatedMovie as any
      
      // Map duration_minutes to duration field
      const movieData = {
        ...movieBaseData,
        duration: movieBaseData.duration_minutes,
      }
      delete movieData.duration_minutes
      delete movieData.status // Remove status field since it doesn't exist in database
      delete movieData.content_rating // Remove content_rating field since it doesn't exist in database
      
      // Update the base movie
      const { error: updateError } = await supabase
        .from('movies')
        .update(movieData)
        .eq('id', movieId)
      
      if (updateError) {
        throw updateError
      }
      
      // Process all translations
      for (const langCode in translations) {
        const translation = translations[langCode]
        const { error: translationError } = await supabase
          .from('movie_translations')
          .upsert(
            {
              movie_id: movieId,
              language_code: langCode,
              title: translation.title, // Maps to title (en) or title_he (he) in the UI
              synopsis: translation.synopsis, // Maps to description (en) or description_he (he) in the UI
              poster_url: translation.poster_url, // Maps to poster_url in the UI
              trailer_url: translation.trailer_url, // Maps to trailer_url in the UI
              themoviedb_id: translation.themoviedb_id
            },
            { onConflict: 'movie_id,language_code' }
          )
        
        if (translationError) {
          throw translationError
        }
      }
      
      // Delete existing genre associations
      const { error: deleteError } = await supabase
        .from('movie_genres')
        .delete()
        .eq('movie_id', movieId)
      
      if (deleteError) {
        throw deleteError
      }
      
      // Add new genre associations
      if (genreIds.length > 0) {
        const genreAssociations = genreIds.map(genreId => ({
          movie_id: movieId,
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
      console.error('Error updating movie:', err)
      setError(err.message || 'Failed to update movie')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-lg text-gray-600">Loading movie information...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg">
        <h1 className="text-xl font-bold text-red-800 mb-4">Error</h1>
        <p className="text-red-700 mb-4">{error}</p>
        <div className="flex space-x-4">
          <Link 
            href="/dashboard/movies"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Movies
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h1 className="text-xl font-bold text-yellow-800 mb-4">Movie Not Found</h1>
        <p className="text-yellow-700 mb-4">
          The movie you're trying to edit doesn't exist or has been deleted.
        </p>
        <Link 
          href="/dashboard/movies"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center inline-flex"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Movies
        </Link>
      </div>
    )
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Movie</h1>
      </div>

      <MovieForm 
        initialData={movie} 
        onSave={handleSave} 
        isLoading={loading}
      />
    </div>
  )
} 