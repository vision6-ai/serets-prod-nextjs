'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  FilmIcon,
  Image as ImageIcon,
  Tag
} from 'lucide-react'
import { slugify } from '@/lib/utils'

interface Genre {
  id: string
  name: string
  slug: string
}

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
  // Base movie fields
  slug: string
  release_date: string | null
  duration_minutes: number | null
  rating: number | null
  content_rating: string | null // UI-only field, not stored in database
  status: 'published' | 'draft' // UI-only field, not stored in database
  original_title: string | null
  imdb_id: string | null
  themoviedb_id: string | null
  
  // Translation fields - we'll keep these for backward compatibility
  // but use the translations object for the actual form
  title: string // English title from translations
  title_he?: string | null // Hebrew title from translations, not stored directly in movies table
  description: string | null // English synopsis from translations 
  description_he?: string | null // Hebrew synopsis from translations, not stored directly
  poster_url: string | null // From translations
  trailer_url: string | null // From translations
  
  // Relationships
  genre_ids?: string[]
}

interface MovieFormProps {
  initialData: Movie
  onSave: (movie: Movie) => void
  isLoading: boolean
  isNew?: boolean
}

export function MovieForm({ initialData, onSave, isLoading, isNew = false }: MovieFormProps) {
  const [formData, setFormData] = useState<Movie>(initialData)
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialData.genre_ids || [])
  const [tabActive, setTabActive] = useState<'details' | 'media' | 'translations'>('details')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [slugModified, setSlugModified] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<string>('en')
  
  // Store translations in a more flexible format
  const [translations, setTranslations] = useState<Record<string, MovieTranslation>>({
    en: {
      language_code: 'en',
      title: initialData.title || null,
      synopsis: initialData.description || null,
      poster_url: initialData.poster_url || null,
      trailer_url: initialData.trailer_url || null,
      themoviedb_id: initialData.themoviedb_id || null
    },
    he: {
      language_code: 'he',
      title: initialData.title_he || null,
      synopsis: initialData.description_he || null,
      poster_url: initialData.poster_url || null, // Share poster and trailer
      trailer_url: initialData.trailer_url || null,
      themoviedb_id: initialData.themoviedb_id || null
    }
  })
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchGenres()
  }, [])

  const fetchGenres = async () => {
    try {
      const { data, error } = await supabase
        .from('genres')
        .select('id, name, slug')
        .order('name', { ascending: true })
      
      if (error) {
        throw error
      }
      
      setGenres(data || [])
    } catch (err) {
      console.error('Error fetching genres:', err)
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
        title: 'title',
        synopsis: 'description',
        poster_url: 'poster_url',
        trailer_url: 'trailer_url'
      }
      
      if (fieldMapping[name]) {
        setFormData(prev => ({
          ...prev,
          [fieldMapping[name]]: value
        }))
      }
    }
    
    // Also keep title_he and description_he synced
    if (currentLanguage === 'he') {
      const fieldMapping: Record<string, string> = {
        title: 'title_he',
        synopsis: 'description_he'
      }
      
      if (fieldMapping[name]) {
        setFormData(prev => ({
          ...prev,
          [fieldMapping[name]]: value
        }))
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'rating' || name === 'duration_minutes') {
      // Handle numeric inputs
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : parseFloat(value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    // Auto-generate slug from title if slug hasn't been manually modified
    if (name === 'title' && !slugModified) {
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
    if (formData.title) {
      setFormData(prev => ({
        ...prev,
        slug: slugify(formData.title)
      }))
    }
  }

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId)
      } else {
        return [...prev, genreId]
      }
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Ensure English title exists (required)
    if (!translations.en.title?.trim()) {
      newErrors.title = 'English title is required'
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    }
    
    // Validate release date format
    if (formData.release_date && !/^\d{4}-\d{2}-\d{2}$/.test(formData.release_date)) {
      newErrors.release_date = 'Please use YYYY-MM-DD format'
    }
    
    setErrors(newErrors)
    
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Prepare data for submission
      // Make sure formData has the latest translation values
      const movieData = {
        ...formData,
        title: translations.en.title || '',
        description: translations.en.synopsis,
        title_he: translations.he.title,
        description_he: translations.he.synopsis,
        poster_url: translations.en.poster_url,
        trailer_url: translations.en.trailer_url,
        genre_ids: selectedGenres,
        // Include all translations for the API to process
        translations: translations
      }
      
      onSave(movieData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex-1">
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Movie Title"
                className={`w-full text-xl font-semibold border ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md px-4 py-2`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
            <div className="flex justify-end space-x-2">
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className="border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  placeholder="movie-url-slug"
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
              onClick={() => setTabActive('media')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                tabActive === 'media'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Genres
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
          </nav>
        </div>

        <div className="p-6">
          {tabActive === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="original_title" className="block text-sm font-medium text-gray-700 mb-1">
                    Original Title
                  </label>
                  <input
                    type="text"
                    id="original_title"
                    name="original_title"
                    value={formData.original_title || ''}
                    onChange={handleChange}
                    placeholder="Original title in source language"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="release_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Release Date
                  </label>
                  <input
                    type="date"
                    id="release_date"
                    name="release_date"
                    value={formData.release_date || ''}
                    onChange={handleChange}
                    className={`block w-full border ${errors.release_date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md shadow-sm py-2 px-3`}
                  />
                  {errors.release_date && <p className="mt-1 text-sm text-red-600">{errors.release_date}</p>}
                </div>
                
                <div>
                  <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration_minutes"
                    name="duration_minutes"
                    min="1"
                    value={formData.duration_minutes || ''}
                    onChange={handleChange}
                    placeholder="e.g. 120"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (0-10)
                  </label>
                  <input
                    type="number"
                    id="rating"
                    name="rating"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.rating || ''}
                    onChange={handleChange}
                    placeholder="e.g. 8.5"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="content_rating" className="block text-sm font-medium text-gray-700 mb-1">
                    Content Rating
                  </label>
                  <select
                    id="content_rating"
                    name="content_rating"
                    value={formData.content_rating || ''}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select content rating --</option>
                    <option value="G">G (General Audiences)</option>
                    <option value="PG">PG (Parental Guidance Suggested)</option>
                    <option value="PG-13">PG-13 (Parents Strongly Cautioned)</option>
                    <option value="R">R (Restricted)</option>
                    <option value="NC-17">NC-17 (Adults Only)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="imdb_id" className="block text-sm font-medium text-gray-700 mb-1">
                    IMDB ID
                  </label>
                  <input
                    type="text"
                    id="imdb_id"
                    name="imdb_id"
                    value={formData.imdb_id || ''}
                    onChange={handleChange}
                    placeholder="e.g. tt1234567"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="themoviedb_id" className="block text-sm font-medium text-gray-700 mb-1">
                    TheMovieDB ID (Global)
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
              
              <div className="border p-4 rounded-md bg-gray-50">
                <h3 className="font-medium text-sm text-gray-700 mb-2">External API Integration</h3>
                <p className="text-sm text-gray-600 mb-4">
                  If you have entered an IMDB ID or TMDB ID, you can use these buttons to fetch additional data from external APIs.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={!formData.imdb_id && !formData.themoviedb_id}
                    onClick={() => {
                      alert('In the actual implementation, this would fetch movie data from external APIs.')
                    }}
                  >
                    Fetch Movie Data
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {tabActive === 'media' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Genres
                  </label>
                  <span className="text-xs text-gray-500">
                    {selectedGenres.length} selected
                  </span>
                </div>
                
                <div className="p-4 border border-gray-300 rounded-md bg-white h-48 overflow-y-auto">
                  {genres.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Loading genres...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {genres.map((genre) => (
                        <div key={genre.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`genre-${genre.id}`}
                            checked={selectedGenres.includes(genre.id)}
                            onChange={() => handleGenreToggle(genre.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`genre-${genre.id}`} className="ml-2 block text-sm text-gray-900">
                            {genre.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
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
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title {currentLanguage === 'en' ? '(English)' : '(Hebrew)'}
                  {currentLanguage === 'en' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={translations[currentLanguage]?.title || ''}
                  onChange={handleTranslationChange}
                  placeholder={currentLanguage === 'en' ? "Movie title in English" : "שם הסרט בעברית"}
                  dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}
                  className={`block w-full border ${
                    errors.title && currentLanguage === 'en'
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } rounded-md shadow-sm py-2 px-3`}
                />
                {errors.title && currentLanguage === 'en' && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="synopsis" className="block text-sm font-medium text-gray-700 mb-1">
                  Synopsis {currentLanguage === 'en' ? '(English)' : '(Hebrew)'}
                </label>
                <textarea
                  id="synopsis"
                  name="synopsis"
                  rows={5}
                  value={translations[currentLanguage]?.synopsis || ''}
                  onChange={handleTranslationChange}
                  placeholder={currentLanguage === 'en' ? "Movie synopsis in English" : "תקציר הסרט בעברית"}
                  dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="poster_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Poster URL
                </label>
                <input
                  type="text"
                  id="poster_url"
                  name="poster_url"
                  value={translations[currentLanguage]?.poster_url || ''}
                  onChange={handleTranslationChange}
                  placeholder="https://example.com/poster.jpg"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {translations[currentLanguage]?.poster_url && (
                  <div className="mt-2">
                    <div className="relative w-32 h-48 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={translations[currentLanguage]?.poster_url || ''} 
                        alt="Poster" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=Invalid+Image';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="trailer_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Trailer URL
                </label>
                <input
                  type="text"
                  id="trailer_url"
                  name="trailer_url"
                  value={translations[currentLanguage]?.trailer_url || ''}
                  onChange={handleTranslationChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="themoviedb_id" className="block text-sm font-medium text-gray-700 mb-1">
                  TheMovieDB ID (Language Specific)
                </label>
                <input
                  type="text"
                  id="themoviedb_id"
                  name="themoviedb_id"
                  value={translations[currentLanguage]?.themoviedb_id || ''}
                  onChange={handleTranslationChange}
                  placeholder="e.g. 12345"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  This ID can be specific to the current language.
                </p>
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
                      disabled={!translations.en.title}
                      onClick={() => {
                        // Simulate translation (in a real app, this would call a translation API)
                        if (translations.en.title) {
                          alert(`In the actual implementation, this would translate the title to ${currentLanguage === 'he' ? 'Hebrew' : currentLanguage} using an API call.`)
                        }
                      }}
                    >
                      Translate Title
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={!translations.en.synopsis}
                      onClick={() => {
                        // Simulate translation (in a real app, this would call a translation API)
                        if (translations.en.synopsis) {
                          alert(`In the actual implementation, this would translate the synopsis to ${currentLanguage === 'he' ? 'Hebrew' : currentLanguage} using an API call.`)
                        }
                      }}
                    >
                      Translate Synopsis
                    </button>
                  </div>
                </div>
              )}
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
        >
          {isLoading ? 'Saving...' : 'Save Movie'}
        </button>
      </div>
    </form>
  )
} 