'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Save, 
  User
} from 'lucide-react'
import { slugify } from '@/lib/utils'
import { MovieAssociations } from './movie-associations'

interface ActorTranslation {
  language_code: string
  name: string | null
  biography: string | null
}

interface Actor {
  id?: string
  // Base fields
  slug: string
  birth_date: string | null
  birth_place: string | null
  photo_url: string | null
  themoviedb_id: string | null
  
  // Translation fields - for backward compatibility
  name: string
  name_he?: string | null
  biography: string | null
  biography_he?: string | null
  
  // Translations object for flexibility
  translations?: Record<string, ActorTranslation>
}

interface ActorFormProps {
  initialData: Actor
  onSave: (actor: Actor) => void
  isLoading: boolean
  isNew?: boolean
}

export function ActorForm({ initialData, onSave, isLoading, isNew = false }: ActorFormProps) {
  const [formData, setFormData] = useState<Actor>(initialData)
  const [tabActive, setTabActive] = useState<'details' | 'translations' | 'movies'>('details')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [slugModified, setSlugModified] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<string>('en')
  const [formError, setFormError] = useState<string | null>(null)
  
  // Store translations in a more flexible format
  const [translations, setTranslations] = useState<Record<string, ActorTranslation>>({
    en: {
      language_code: 'en',
      name: initialData.name || null,
      biography: initialData.biography || null
    },
    he: {
      language_code: 'he',
      name: initialData.name_he || null,
      biography: initialData.biography_he || null
    }
  })
  
  const supabase = createClientComponentClient()

  // Add keyboard shortcut to save with Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+S or Command+S (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault() // Prevent browser save dialog
        if (!isLoading) {
          handleSubmit(new Event('submit') as any)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isLoading])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-generate slug from name if slug hasn't been manually modified
    if (name === 'name' && !slugModified) {
      setFormData(prev => ({
        ...prev,
        slug: slugify(value)
      }))
    }
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      slug: value
    }))
    setSlugModified(true)
  }

  const generateSlug = () => {
    if (formData.name) {
      setFormData(prev => ({
        ...prev,
        slug: slugify(formData.name)
      }))
    }
  }
  
  const handleTranslationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTranslations(prev => ({
      ...prev,
      [currentLanguage]: {
        ...prev[currentLanguage],
        [name]: value
      }
    }))
    
    // Keep the main formData in sync for English fields which we use for basic validation
    if (currentLanguage === 'en') {
      const fieldMapping: Record<string, string> = {
        name: 'name',
        biography: 'biography'
      }
      
      if (fieldMapping[name]) {
        setFormData(prev => ({
          ...prev,
          [fieldMapping[name]]: value
        }))
      }
    }
    
    // Also keep name_he and biography_he synced
    if (currentLanguage === 'he') {
      const fieldMapping: Record<string, string> = {
        name: 'name_he',
        biography: 'biography_he'
      }
      
      if (fieldMapping[name]) {
        setFormData(prev => ({
          ...prev,
          [fieldMapping[name]]: value
        }))
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Ensure English name exists (required)
    if (!translations.en.name?.trim()) {
      newErrors.name = 'English name is required'
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    }
    
    // Validate birth date format
    if (formData.birth_date && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birth_date)) {
      newErrors.birth_date = 'Please use YYYY-MM-DD format'
    }
    
    setErrors(newErrors)
    
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Prepare data for submission
      // Make sure formData has the latest translation values
      const actorData = {
        ...formData,
        name: translations.en.name || '',
        biography: translations.en.biography,
        name_he: translations.he.name,
        biography_he: translations.he.biography,
        translations: translations
      }
      
      onSave(actorData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700 mb-4">
          {formError}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex-1">
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Actor Name"
                className={`w-full text-xl font-semibold border ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md px-4 py-2`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Save (Ctrl+S)"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="actor-url-slug"
                  className={`flex-1 border ${errors.slug ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md px-3 py-1.5 text-sm`}
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Generate
                </button>
              </div>
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              type="button"
              onClick={() => setTabActive('details')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                tabActive === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => setTabActive('translations')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                tabActive === 'translations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Translations
            </button>
            <button
              type="button"
              onClick={() => setTabActive('movies')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                tabActive === 'movies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Movies
            </button>
          </nav>
        </div>

        <div className="p-6">
          {tabActive === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    id="birth_date"
                    name="birth_date"
                    value={formData.birth_date || ''}
                    onChange={handleChange}
                    className={`block w-full border ${errors.birth_date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md shadow-sm py-2 px-3`}
                  />
                  {errors.birth_date && <p className="mt-1 text-sm text-red-600">{errors.birth_date}</p>}
                </div>
                
                <div>
                  <label htmlFor="birth_place" className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Place
                  </label>
                  <input
                    type="text"
                    id="birth_place"
                    name="birth_place"
                    value={formData.birth_place || ''}
                    onChange={handleChange}
                    placeholder="e.g. Los Angeles, California, USA"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="photo_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Photo URL
                  </label>
                  <input
                    type="text"
                    id="photo_url"
                    name="photo_url"
                    value={formData.photo_url || ''}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="themoviedb_id" className="block text-sm font-medium text-gray-700 mb-1">
                    TheMovieDB ID
                  </label>
                  <input
                    type="text"
                    id="themoviedb_id"
                    name="themoviedb_id"
                    value={formData.themoviedb_id || ''}
                    onChange={handleChange}
                    placeholder="e.g. 12345"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {formData.photo_url && (
                <div className="mt-2">
                  <p className="block text-sm font-medium text-gray-700 mb-2">Photo Preview</p>
                  <div className="relative w-40 h-40 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={formData.photo_url} 
                      alt="Actor" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="border p-4 rounded-md bg-gray-50">
                <h3 className="font-medium text-sm text-gray-700 mb-2">External API Integration</h3>
                <p className="text-sm text-gray-600 mb-4">
                  If you have entered a TMDB ID, you can fetch actor data from external APIs.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={!formData.themoviedb_id}
                    onClick={() => {
                      alert('In the actual implementation, this would fetch actor data from external APIs.')
                    }}
                  >
                    Fetch Actor Data
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {tabActive === 'translations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Translations</h3>
                <div className="inline-flex items-center shadow-sm border border-gray-300 rounded-md">
                  <button
                    type="button"
                    onClick={() => setCurrentLanguage('en')}
                    className={`px-4 py-2 text-sm font-medium ${
                      currentLanguage === 'en'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } rounded-l-md`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentLanguage('he')}
                    className={`px-4 py-2 text-sm font-medium ${
                      currentLanguage === 'he'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } rounded-r-md`}
                  >
                    Hebrew
                  </button>
                </div>
              </div>
              
              {currentLanguage === 'he' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    You are editing Hebrew translations. Make sure the text is written right-to-left.
                  </p>
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name {currentLanguage === 'en' ? '(English)' : '(Hebrew)'}
                  {currentLanguage === 'en' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={translations[currentLanguage]?.name || ''}
                  onChange={handleTranslationChange}
                  placeholder={currentLanguage === 'en' ? "Actor name in English" : "שם השחקן בעברית"}
                  dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}
                  className={`block w-full border ${
                    errors.name && currentLanguage === 'en'
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } rounded-md shadow-sm py-2 px-3`}
                />
                {errors.name && currentLanguage === 'en' && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-1">
                  Biography {currentLanguage === 'en' ? '(English)' : '(Hebrew)'}
                </label>
                <textarea
                  id="biography"
                  name="biography"
                  rows={10}
                  value={translations[currentLanguage]?.biography || ''}
                  onChange={handleTranslationChange}
                  placeholder={currentLanguage === 'en' ? "Actor biography in English" : "ביוגרפיה של השחקן בעברית"}
                  dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {currentLanguage !== 'en' && (
                <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">Translation Tools</h3>
                  <p className="text-sm text-blue-600 mb-4">
                    You can use these buttons to automatically translate content from English to {currentLanguage === 'he' ? 'Hebrew' : currentLanguage}.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={!translations.en.name}
                      onClick={() => {
                        // Simulate translation (in a real app, this would call a translation API)
                        if (translations.en.name) {
                          alert(`In the actual implementation, this would translate the name to ${currentLanguage === 'he' ? 'Hebrew' : currentLanguage} using an API call.`)
                        }
                      }}
                    >
                      Translate Name
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={!translations.en.biography}
                      onClick={() => {
                        // Simulate translation (in a real app, this would call a translation API)
                        if (translations.en.biography) {
                          alert(`In the actual implementation, this would translate the biography to ${currentLanguage === 'he' ? 'Hebrew' : currentLanguage} using an API call.`)
                        }
                      }}
                    >
                      Translate Biography
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {tabActive === 'movies' && (
            <div className="space-y-6">
              <MovieAssociations 
                actorId={formData.id} 
                onError={(message) => setFormError(message)}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save (Ctrl+S)"
        >
          {isLoading ? 'Saving...' : 'Save Actor'}
        </button>
      </div>
    </form>
  )
} 