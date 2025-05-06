'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { ActorForm } from '../_components/actor-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/utils'

interface ActorTranslation {
  language_code: string
  name: string | null
  biography: string | null
}

interface Actor {
  id?: string
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

export default function NewActorPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const initialData: Actor = {
    name: '',
    slug: '',
    birth_date: null,
    birth_place: null,
    photo_url: null,
    themoviedb_id: null,
    biography: null,
    name_he: null,
    biography_he: null,
    translations: {
      en: {
        language_code: 'en',
        name: '',
        biography: null
      },
      he: {
        language_code: 'he',
        name: null,
        biography: null
      }
    }
  }

  const handleSave = async (newActor: Actor) => {
    setLoading(true)
    setError(null)

    // Generate a slug if not provided
    if (!newActor.slug && newActor.name) {
      newActor.slug = slugify(newActor.name)
    }
    
    try {
      // Extract the translations
      const { 
        name, 
        name_he, 
        biography, 
        biography_he, 
        translations,
        ...baseActorData 
      } = newActor
      
      // Insert the actor base record
      const { data, error } = await supabase
        .from('actors')
        .insert(baseActorData)
        .select()
      
      if (error) {
        throw error
      }
      
      // Get the new actor ID
      const newActorId = data[0].id
      
      // Process all translations
      if (translations) {
        for (const langCode in translations) {
          const translation = translations[langCode]
          
          // Skip empty translations
          if (!translation.name) continue;
          
          const { error: translationError } = await supabase
            .from('actor_translations')
            .insert({
              actor_id: newActorId,
              language_code: langCode,
              name: translation.name,
              biography: translation.biography
            })
          
          if (translationError) {
            throw translationError
          }
        }
      } else {
        // Fallback to the old structure if translations object isn't available
        // Insert English translation
        const { error: enTranslationError } = await supabase
          .from('actor_translations')
          .insert({
            actor_id: newActorId,
            language_code: 'en',
            name: name,
            biography: biography
          })
        
        if (enTranslationError) {
          throw enTranslationError
        }
        
        // Insert Hebrew translation if provided
        if (name_he) {
          const { error: heTranslationError } = await supabase
            .from('actor_translations')
            .insert({
              actor_id: newActorId,
              language_code: 'he',
              name: name_he,
              biography: biography_he
            })
          
          if (heTranslationError) {
            throw heTranslationError
          }
        }
      }
      
      router.push('/dashboard/actors')
    } catch (err: any) {
      console.error('Error creating actor:', err)
      setError(err.message || 'Failed to create actor')
      setLoading(false)
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Add New Actor</h1>
      </div>

      {error && (
        <div className="bg-red-50 p-4 mb-6 rounded-md text-red-700">
          {error}
        </div>
      )}

      <ActorForm 
        initialData={initialData} 
        onSave={handleSave} 
        isLoading={loading}
        isNew
      />
    </div>
  )
} 