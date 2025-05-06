'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { ActorForm } from '../_components/actor-form'
import { ArrowLeft, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ActorTranslation {
  language_code: string
  name: string | null
  biography: string | null
}

interface Actor {
  id: string
  slug: string
  birth_date: string | null
  birth_place: string | null
  photo_url: string | null
  themoviedb_id: string | null
  name: string
  name_he?: string | null
  biography: string | null
  biography_he?: string | null
  translations?: Record<string, ActorTranslation>
}

export default function EditActorPage({ params }: { params: { id: string } }) {
  const [actor, setActor] = useState<Actor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const actorId = params.id

  useEffect(() => {
    const fetchActor = async () => {
      try {
        // Fetch the actor with join to actor_translations
        const { data: actorData, error: actorError } = await supabase
          .from('actors')
          .select(`
            id, 
            slug, 
            birth_date,
            birth_place,
            photo_url,
            themoviedb_id,
            actor_translations (
              id,
              language_code,
              name,
              biography
            )
          `)
          .eq('id', actorId)
          .single()
        
        if (actorError) {
          throw actorError
        }
        
        // Organize translations by language code
        const translations: Record<string, ActorTranslation> = {}
        
        // Make sure we always have English and Hebrew records
        const defaultTranslation: ActorTranslation = {
          language_code: 'en',
          name: '',
          biography: null
        }
        
        translations.en = { ...defaultTranslation }
        translations.he = { ...defaultTranslation, language_code: 'he' }
        
        // Fill in with actual data
        actorData.actor_translations.forEach((translation: any) => {
          translations[translation.language_code] = {
            language_code: translation.language_code,
            name: translation.name,
            biography: translation.biography
          }
        })
        
        // Extract English and Hebrew for backward compatibility
        const englishTranslation = translations.en || defaultTranslation
        const hebrewTranslation = translations.he || { ...defaultTranslation, language_code: 'he' }

        // Combine data into expected format for ActorForm
        const fullActor = {
          id: actorData.id,
          slug: actorData.slug,
          birth_date: actorData.birth_date,
          birth_place: actorData.birth_place,
          photo_url: actorData.photo_url,
          themoviedb_id: actorData.themoviedb_id,
          // Translations - for backward compatibility
          name: englishTranslation.name || '',
          name_he: hebrewTranslation.name || null,
          biography: englishTranslation.biography || null,
          biography_he: hebrewTranslation.biography || null,
          // New translations structure
          translations: translations
        }
        
        setActor(fullActor)
      } catch (err: any) {
        console.error('Error fetching actor:', err)
        setError(err.message || 'Failed to load actor')
      } finally {
        setLoading(false)
      }
    }

    fetchActor()
  }, [actorId, supabase])

  const handleSave = async (updatedActor: Partial<Actor>) => {
    setLoading(true)
    
    try {
      const translations = updatedActor.translations || {}
      
      // Prepare actor data for the actors table
      const { 
        name, 
        name_he, 
        biography, 
        biography_he, 
        translations: translationsObj, 
        ...actorBaseData 
      } = updatedActor as any
      
      // Update the base actor
      const { error: updateError } = await supabase
        .from('actors')
        .update(actorBaseData)
        .eq('id', actorId)
      
      if (updateError) {
        throw updateError
      }
      
      // Process all translations
      for (const langCode in translations) {
        const translation = translations[langCode]
        const { error: translationError } = await supabase
          .from('actor_translations')
          .upsert(
            {
              actor_id: actorId,
              language_code: langCode,
              name: translation.name,
              biography: translation.biography
            },
            { onConflict: 'actor_id,language_code' }
          )
        
        if (translationError) {
          throw translationError
        }
      }
      
      router.push('/dashboard/actors')
    } catch (err: any) {
      console.error('Error updating actor:', err)
      setError(err.message || 'Failed to update actor')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-lg text-gray-600">Loading actor information...</p>
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
            href="/dashboard/actors"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Actors
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

  if (!actor) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h1 className="text-xl font-bold text-yellow-800 mb-4">Actor Not Found</h1>
        <p className="text-yellow-700 mb-4">
          The actor you're trying to edit doesn't exist or has been deleted.
        </p>
        <Link 
          href="/dashboard/actors"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center inline-flex"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Actors
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard/actors"
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Actor</h1>
        
        <div className="flex-1"></div>
        
        {actor.slug && (
          <Link
            href={`/${actor.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Site
          </Link>
        )}
      </div>

      <ActorForm 
        initialData={actor} 
        onSave={handleSave} 
        isLoading={loading}
      />
    </div>
  )
} 