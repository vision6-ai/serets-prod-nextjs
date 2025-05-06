'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Calendar, 
  MapPin,
  Edit,
  Trash2,
  Globe,
  Film
} from 'lucide-react'

// Define types for the database responses
interface ActorTranslation {
  name: string | null
  biography: string | null
  language_code: string
}

interface ActorData {
  id: string
  slug: string
  birth_date: string | null
  birth_place: string | null
  photo_url: string | null
  themoviedb_id: string | null
  updated_at: string
  actor_translations: ActorTranslation[]
  movie_actors: { id: string }[]
}

// Define the processed actor interface
interface Actor {
  id: string
  slug: string
  birth_date: string | null
  birth_place: string | null
  photo_url: string | null
  themoviedb_id: string | null
  updated_at: string
  name: string
  name_he: string | null
  biography: string | null
  movieCount: number
}

type SortField = 'name' | 'updated_at' | 'birth_date' | 'movie_count'
type SortOrder = 'asc' | 'desc'

export default function ActorsPage() {
  const [actors, setActors] = useState<Actor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const perPage = 10
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchActors()
  }, [searchQuery, sortField, sortOrder, page])

  const fetchActors = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Calculate pagination range
      const from = (page - 1) * perPage
      const to = from + perPage - 1
      
      let query = supabase
        .from('actors')
        .select(`
          id, 
          slug, 
          birth_date,
          birth_place,
          photo_url,
          themoviedb_id,
          updated_at,
          actor_translations (
            name,
            biography,
            language_code
          ),
          movie_actors (
            id
          )
        `, { count: 'exact' })
      
      // Handle search
      if (searchQuery) {
        query = query.or(`actor_translations.name.ilike.%${searchQuery}%,actor_translations.biography.ilike.%${searchQuery}%`)
      }
      
      // Apply sorting logic
      if (sortField === 'name') {
        // Sort by name from actor_translations
        query = query.order('actor_translations(name)', { ascending: sortOrder === 'asc' })
      } else if (sortField === 'movie_count') {
        // For movie count sorting, we'll fetch all data and sort manually
        // because Supabase doesn't directly support ordering by count of joins
      } else {
        // Sort by other fields directly
        query = query.order(sortField, { ascending: sortOrder === 'asc' })
      }
      
      // Apply pagination
      query = query.range(from, to)
      
      const { data, count, error } = await query
      
      if (error) {
        throw error
      }
      
      // Transform the data to get main actor info with translations
      const processedActors = data?.map((actor: ActorData) => {
        // Get English and Hebrew translations if available
        const englishTranslation = actor.actor_translations.find((t: ActorTranslation) => t.language_code === 'en') || actor.actor_translations[0]
        const hebrewTranslation = actor.actor_translations.find((t: ActorTranslation) => t.language_code === 'he')
        
        return {
          id: actor.id,
          slug: actor.slug,
          birth_date: actor.birth_date,
          birth_place: actor.birth_place,
          photo_url: actor.photo_url,
          themoviedb_id: actor.themoviedb_id,
          updated_at: actor.updated_at,
          name: englishTranslation?.name || 'Unnamed',
          name_he: hebrewTranslation?.name || null,
          biography: englishTranslation?.biography || null,
          movieCount: actor.movie_actors.length,
        }
      }) || []
      
      // Manual sorting for movie count
      if (sortField === 'movie_count') {
        processedActors.sort((a, b) => {
          return sortOrder === 'asc' 
            ? a.movieCount - b.movieCount
            : b.movieCount - a.movieCount
        })
      }
      
      setActors(processedActors)
      setTotalCount(count || 0)
    } catch (err: any) {
      console.error('Error fetching actors:', err)
      setError(err.message || 'Failed to load actors')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this actor? This action cannot be undone.')) {
      return
    }
    
    setLoading(true)
    
    try {
      // Get the actor name for confirmation message
      const actorToDelete = actors.find(m => m.id === id)
      
      // Delete the actor
      const { error: deleteError } = await supabase
        .from('actors')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // Refresh the list
      fetchActors()
      
      alert(`Actor "${actorToDelete?.name || 'Unknown'}" has been deleted.`)
    } catch (err: any) {
      console.error('Error deleting actor:', err)
      setError(err.message || 'Failed to delete actor')
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getTotalPages = () => {
    return Math.ceil(totalCount / perPage)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Actors</h1>
        <Link 
          href="/dashboard/actors/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Actor
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <div className="w-full md:w-auto">
              <select
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortField(field as SortField)
                  setSortOrder(order as SortOrder)
                }}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="updated_at-desc">Recently Updated</option>
                <option value="updated_at-asc">Oldest Updated</option>
                <option value="birth_date-desc">Birth Date (Newest)</option>
                <option value="birth_date-asc">Birth Date (Oldest)</option>
                <option value="movie_count-desc">Movie Count (Highest)</option>
                <option value="movie_count-asc">Movie Count (Lowest)</option>
              </select>
            </div>
            
            <button
              onClick={() => fetchActors()}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <p className="mb-4">{error}</p>
            <button
              onClick={() => fetchActors()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : actors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No actors found</h3>
            <p className="mb-4">Try changing your search criteria</p>
            <Link 
              href="/dashboard/actors/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Actor
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actor
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Birth Date
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Birth Place
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    TMDB ID
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Movie Count
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {actors.map((actor) => (
                  <tr key={actor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full overflow-hidden">
                          {actor.photo_url ? (
                            <img
                              src={actor.photo_url}
                              alt={actor.name || 'Actor photo'}
                              className="h-10 w-10 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center bg-gray-200">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            {actor.name}
                            {actor.name_he && (
                              <span className="text-xs text-gray-500 flex items-center" title="Has Hebrew translation">
                                <Globe className="h-3 w-3 text-blue-500" />
                              </span>
                            )}
                            {actor.movieCount > 0 && (
                              <span className="text-xs text-gray-500 flex items-center" title={`Appears in ${actor.movieCount} movie${actor.movieCount > 1 ? 's' : ''}`}>
                                <Film className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-green-500 ml-1">{actor.movieCount}</span>
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {actor.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDate(actor.birth_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {actor.birth_place ? (
                          <>
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            {actor.birth_place}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {actor.themoviedb_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {actor.movieCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <Link 
                          href={`/dashboard/actors/${actor.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(actor.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && actors.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(getTotalPages(), page + 1))}
                disabled={page >= getTotalPages()}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{actors.length > 0 ? (page - 1) * perPage + 1 : 0}</span> to <span className="font-medium">{Math.min(page * perPage, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, getTotalPages()) }, (_, i) => {
                    // Logic to show pages around current page
                    let pageNum: number
                    const totalPages = getTotalPages()
                    
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setPage(Math.min(getTotalPages(), page + 1))}
                    disabled={page >= getTotalPages()}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 