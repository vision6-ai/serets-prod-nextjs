'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  FilmIcon,
  Image as ImageIcon
} from 'lucide-react'
import { slugify } from '@/lib/utils'

interface Movie {
  id: string
  title: string
  slug: string
  release_date: string | null
  rating: number | null
}

interface BlogPost {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string | null
  status: 'published' | 'draft' | 'archived'
  author_name: string
  author_bio: string | null
  author_avatar_url: string | null
  published_at: string | null
  movie_id: string | null
  rating: number | null
  meta_title: string | null
  meta_description: string | null
  pros: string[] | null
  cons: string[] | null
}

interface BlogPostFormProps {
  initialData: BlogPost
  onSave: (post: BlogPost) => void
  isLoading: boolean
  isNew?: boolean
}

export function BlogPostForm({ initialData, onSave, isLoading, isNew = false }: BlogPostFormProps) {
  const [formData, setFormData] = useState<BlogPost>(initialData)
  const [movies, setMovies] = useState<Movie[]>([])
  const [tabActive, setTabActive] = useState<'content' | 'seo' | 'movie'>('content')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [slugModified, setSlugModified] = useState(false)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('id, title, slug, release_date, rating')
        .order('title', { ascending: true })
      
      if (error) {
        throw error
      }
      
      setMovies(data || [])
    } catch (err) {
      console.error('Error fetching movies:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

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

  const handleProsChange = (index: number, value: string) => {
    const updatedPros = [...(formData.pros || [])]
    updatedPros[index] = value
    
    setFormData(prev => ({
      ...prev,
      pros: updatedPros
    }))
  }

  const handleConsChange = (index: number, value: string) => {
    const updatedCons = [...(formData.cons || [])]
    updatedCons[index] = value
    
    setFormData(prev => ({
      ...prev,
      cons: updatedCons
    }))
  }

  const addPro = () => {
    setFormData(prev => ({
      ...prev,
      pros: [...(prev.pros || []), '']
    }))
  }

  const addCon = () => {
    setFormData(prev => ({
      ...prev,
      cons: [...(prev.cons || []), '']
    }))
  }

  const removePro = (index: number) => {
    const updatedPros = [...(formData.pros || [])]
    updatedPros.splice(index, 1)
    
    setFormData(prev => ({
      ...prev,
      pros: updatedPros
    }))
  }

  const removeCon = (index: number) => {
    const updatedCons = [...(formData.cons || [])]
    updatedCons.splice(index, 1)
    
    setFormData(prev => ({
      ...prev,
      cons: updatedCons
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    }
    
    if (!formData.author_name.trim()) {
      newErrors.author_name = 'Author name is required'
    }
    
    setErrors(newErrors)
    
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Set publish date if published
      let updatedData = { ...formData }
      
      if (updatedData.status === 'published' && !updatedData.published_at) {
        updatedData.published_at = new Date().toISOString()
      }
      
      // Clean up empty arrays
      if (updatedData.pros && updatedData.pros.length === 0) {
        updatedData.pros = null
      }
      
      if (updatedData.cons && updatedData.cons.length === 0) {
        updatedData.cons = null
      }

      // Remove empty strings from pros and cons
      if (updatedData.pros) {
        updatedData.pros = updatedData.pros.filter(pro => pro.trim() !== '')
      }
      
      if (updatedData.cons) {
        updatedData.cons = updatedData.cons.filter(con => con.trim() !== '')
      }
      
      onSave(updatedData)
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
                placeholder="Post Title"
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
                <option value="archived">Archived</option>
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
                  placeholder="post-url-slug"
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
              onClick={() => setTabActive('content')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                tabActive === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content
            </button>
            <button
              type="button"
              onClick={() => setTabActive('movie')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                tabActive === 'movie'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Movie & Rating
            </button>
            <button
              type="button"
              onClick={() => setTabActive('seo')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                tabActive === 'seo'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              SEO & Meta
            </button>
          </nav>
        </div>

        <div className="p-6">
          {tabActive === 'content' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  rows={3}
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Brief summary of the post (used in listings and SEO)"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={12}
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your post content here (Markdown supported)"
                  className={`block w-full border ${errors.content ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md shadow-sm py-2 px-3`}
                />
                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
              </div>
              
              <div>
                <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    id="featured_image"
                    name="featured_image"
                    value={formData.featured_image || ''}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {formData.featured_image && (
                  <div className="mt-2">
                    <div className="relative w-40 h-24 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={formData.featured_image} 
                        alt="Featured" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Invalid+Image';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  id="author_name"
                  name="author_name"
                  value={formData.author_name}
                  onChange={handleChange}
                  placeholder="Author Name"
                  className={`block w-full border ${errors.author_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md shadow-sm py-2 px-3`}
                />
                {errors.author_name && <p className="mt-1 text-sm text-red-600">{errors.author_name}</p>}
              </div>
              
              <div>
                <label htmlFor="author_bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Author Bio
                </label>
                <textarea
                  id="author_bio"
                  name="author_bio"
                  rows={2}
                  value={formData.author_bio || ''}
                  onChange={handleChange}
                  placeholder="Brief author biography"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="author_avatar_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Author Avatar URL
                </label>
                <input
                  type="text"
                  id="author_avatar_url"
                  name="author_avatar_url"
                  value={formData.author_avatar_url || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
          
          {tabActive === 'movie' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="movie_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Related Movie
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    id="movie_id"
                    name="movie_id"
                    value={formData.movie_id || ''}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select a movie --</option>
                    {movies.map((movie) => (
                      <option key={movie.id} value={movie.id}>
                        {movie.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                {formData.movie_id && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FilmIcon className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {movies.find(m => m.id === formData.movie_id)?.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {movies.find(m => m.id === formData.movie_id)?.release_date 
                            ? new Date(movies.find(m => m.id === formData.movie_id)?.release_date as string).getFullYear() 
                            : 'Unknown year'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                  placeholder="Movie rating (e.g. 8.5)"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Pros
                  </label>
                  <button
                    type="button"
                    onClick={addPro}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Pro
                  </button>
                </div>
                
                {(formData.pros || []).length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No pros added yet</p>
                ) : (
                  <div className="space-y-2">
                    {(formData.pros || []).map((pro, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={pro}
                          onChange={(e) => handleProsChange(index, e.target.value)}
                          placeholder="Add a positive point"
                          className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removePro(index)}
                          className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Cons
                  </label>
                  <button
                    type="button"
                    onClick={addCon}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Con
                  </button>
                </div>
                
                {(formData.cons || []).length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No cons added yet</p>
                ) : (
                  <div className="space-y-2">
                    {(formData.cons || []).map((con, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={con}
                          onChange={(e) => handleConsChange(index, e.target.value)}
                          placeholder="Add a negative point"
                          className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeCon(index)}
                          className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {tabActive === 'seo' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="meta_title"
                  name="meta_title"
                  value={formData.meta_title || ''}
                  onChange={handleChange}
                  placeholder="Custom meta title (leave blank to use post title)"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {(formData.meta_title || formData.title || '').length}/60 characters (recommended max: 60)
                </p>
              </div>
              
              <div>
                <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  id="meta_description"
                  name="meta_description"
                  rows={3}
                  value={formData.meta_description || ''}
                  onChange={handleChange}
                  placeholder="Custom meta description (leave blank to use post excerpt)"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {(formData.meta_description || formData.excerpt || '').length}/160 characters (recommended max: 160)
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">SEO Preview</h3>
                <div className="p-4 border border-gray-300 rounded-md bg-white">
                  <p className="text-blue-600 text-xl truncate hover:underline cursor-pointer">
                    {formData.meta_title || formData.title || 'Post Title'}
                  </p>
                  <p className="text-green-600 text-sm truncate">
                    {`${window?.location.origin}/blog/${formData.slug || 'post-slug'}`}
                  </p>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {formData.meta_description || formData.excerpt || 'Post description will appear here.'}
                  </p>
                </div>
              </div>
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
          {isLoading ? 'Saving...' : 'Save Blog Post'}
        </button>
      </div>
    </form>
  )
} 