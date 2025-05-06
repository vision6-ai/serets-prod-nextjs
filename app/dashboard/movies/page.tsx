'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Film, 
  Star, 
  CalendarDays,
  Edit,
  Trash2,
  Globe
} from 'lucide-react'

// Define types for the database responses
interface MovieTranslation {
  title: string | null
  synopsis: string | null
  poster_url: string | null
  language_code: string
  trailer_url: string | null
  themoviedb_id: string | null
}

interface GenreInfo {
  id: string;
  name: string;
  genre_name: string;
}

interface MovieGenre {
  genres: GenreInfo;
}

interface MovieData {
  id: string
  slug: string
  release_date: string | null
  rating: number | null
  duration: number | null
  updated_at: string
  original_title: string | null
  imdb_id: string | null
  themoviedb_id: string | null
  movie_translations: MovieTranslation[]
  movie_genres: MovieGenre[]
}

// Define the processed movie interface
interface Movie {
  id: string
  slug: string
  poster_url: string | null
  trailer_url: string | null
  release_date: string | null
  rating: number | null
  duration: number | null
  updated_at: string
  title: string
  title_he: string | null
  synopsis: string | null
  genres: string[]
  original_title: string | null
  imdb_id: string | null
  themoviedb_id: string | null
  status: string // We'll derive this since we don't have it in the database
}

type SortField = 'title' | 'updated_at' | 'release_date' | 'rating'
type SortOrder = 'asc' | 'desc'

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const perPage = 10
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchMovies()
  }, [searchQuery, sortField, sortOrder])

  useEffect(() => {
    // Apply status filter and pagination in memory after data is loaded
    if (movies.length) {
      let filtered = [...movies];
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(movie => movie.status === statusFilter);
      }
      
      setFilteredMovies(filtered);
      setTotalCount(filtered.length);
    }
  }, [movies, statusFilter]);

  // Calculate current page items
  const currentPageItems = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    return filteredMovies.slice(startIndex, startIndex + perPage);
  }, [filteredMovies, page, perPage]);

  const fetchMovies = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('movies')
        .select(`
          id, 
          slug, 
          release_date, 
          rating, 
          duration,
          updated_at,
          original_title,
          imdb_id,
          themoviedb_id,
          movie_translations (
            title, 
            synopsis,
            poster_url,
            language_code,
            trailer_url,
            themoviedb_id
          )
        `, { count: 'exact' })
      
      // Apply filtering logic
      // Note: Since status doesn't exist in the movies table, we can't filter by it directly
      
      // Handle search
      if (searchQuery) {
        query = query.or(`movie_translations.title.ilike.%${searchQuery}%,movie_translations.synopsis.ilike.%${searchQuery}%,original_title.ilike.%${searchQuery}%`)
      }
      
      // Apply sorting logic
      if (sortField === 'title') {
        // Don't try to sort directly on the relationship - we'll sort the results in memory instead
        query = query.order('updated_at', { ascending: false }) // Default sort to ensure we get consistent results
      } else {
        // Sort by other fields directly
        query = query.order(sortField, { ascending: sortOrder === 'asc' })
      }
      
      const { data, count, error } = await query
      
      if (error) {
        throw error
      }
      
      // Now fetch genres separately for each movie to avoid the join issue
      const processedMovies = await Promise.all(data?.map(async (movie: any) => {
        // Get English title (default) and Hebrew title if available
        const englishTranslation = movie.movie_translations.find((t: MovieTranslation) => t.language_code === 'en') || movie.movie_translations[0]
        const hebrewTranslation = movie.movie_translations.find((t: MovieTranslation) => t.language_code === 'he')
        
        // Fetch genres separately for each movie
        let genres: string[] = [];
        try {
          // First attempt: Direct query with a simple join
          const { data: genreData, error: genreError } = await supabase
            .from('movie_genres')
            .select(`
              genres (
                name,
                genre_name
              )
            `)
            .eq('movie_id', movie.id);
            
          if (!genreError && genreData) {
            genres = genreData
              .map((mg: any) => mg.genres?.genre_name || mg.genres?.name)
              .filter(Boolean);
          } else if (genreError) {
            // Second attempt: Use a simpler query as fallback
            console.log('Falling back to simpler genre query due to error:', genreError.message);
            
            const { data: fallbackData } = await supabase
              .from('movie_genres')
              .select('genre_id')
              .eq('movie_id', movie.id);
              
            if (fallbackData && fallbackData.length > 0) {
              // Get genre ids
              const genreIds = fallbackData.map(mg => mg.genre_id);
              
              // Fetch genre names separately
              const { data: genreNames } = await supabase
                .from('genres')
                .select('name, genre_name')
                .in('id', genreIds);
                
              if (genreNames) {
                genres = genreNames
                  .map(g => g.genre_name || g.name)
                  .filter(Boolean);
              }
            }
          }
        } catch (err) {
          console.error('Error fetching genres for movie:', movie.id, err);
        }
        
        // Derive status (since we don't have it in the database)
        // For example, we can consider movies with translations as "published"
        const hasTranslations = movie.movie_translations && movie.movie_translations.length > 0;
        const status = hasTranslations ? 'published' : 'draft';
        
        return {
          id: movie.id,
          slug: movie.slug,
          release_date: movie.release_date,
          rating: movie.rating,
          duration: movie.duration,
          updated_at: movie.updated_at,
          title: englishTranslation?.title || 'Untitled',
          title_he: hebrewTranslation?.title || null,
          synopsis: englishTranslation?.synopsis || null,
          poster_url: englishTranslation?.poster_url || null,
          trailer_url: englishTranslation?.trailer_url || null,
          genres,
          original_title: movie.original_title,
          imdb_id: movie.imdb_id,
          themoviedb_id: movie.themoviedb_id,
          status
        }
      })) || []
      
      // Manual sorting for title
      if (sortField === 'title') {
        processedMovies.sort((a, b) => {
          // Handle empty titles by putting them at the end
          if (!a.title && !b.title) return 0;
          if (!a.title) return sortOrder === 'asc' ? 1 : -1;
          if (!b.title) return sortOrder === 'asc' ? -1 : 1;
          
          const titleA = a.title.toLowerCase();
          const titleB = b.title.toLowerCase();
          return sortOrder === 'asc' 
            ? titleA.localeCompare(titleB)
            : titleB.localeCompare(titleA);
        });
      }
      
      setMovies(processedMovies)
      setTotalCount(count || 0)
    } catch (err: any) {
      console.error('Error fetching movies:', err)
      setError(err.message || 'Failed to load movies')
      
      // Additional logging and user-friendly messages for specific database errors
      if (typeof err.message === 'string') {
        // Handle specific error types with clear messages
        if (err.message.includes('related order')) {
          console.error('This is likely an issue with sorting on nested fields. Try refreshing or using a different sort option.')
        } else if (err.message.includes('does not exist')) {
          // For column does not exist errors
          const columnMatch = err.message.match(/column\s+([^\s]+)\s+does not exist/);
          if (columnMatch && columnMatch[1]) {
            console.error(`Database schema error: Column "${columnMatch[1]}" does not exist. Please check your database schema.`);
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
      return
    }
    
    setLoading(true)
    
    try {
      // Get the movie title for confirmation message
      const movieToDelete = movies.find(m => m.id === id)
      
      // Delete the movie
      const { error: deleteError } = await supabase
        .from('movies')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // Refresh the list
      fetchMovies()
      
      alert(`Movie "${movieToDelete?.title || 'Unknown'}" has been deleted.`)
    } catch (err: any) {
      console.error('Error deleting movie:', err)
      setError(err.message || 'Failed to delete movie')
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTotalPages = () => {
    return Math.ceil(totalCount / perPage)
  }

  const resetMoviesView = () => {
    setStatusFilter('all');
    setSortField('updated_at');
    setSortOrder('desc');
    setSearchQuery('');
    setError(null);
    setPage(1);
    setFilteredMovies(movies);
    fetchMovies();
  }

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Movies</h1>
        <Link 
          href="/dashboard/movies/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Movie
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
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <div className="w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            
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
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="updated_at-desc">Recently Updated</option>
                <option value="updated_at-asc">Oldest Updated</option>
                <option value="release_date-desc">Newest Release</option>
                <option value="release_date-asc">Oldest Release</option>
                <option value="rating-desc">Rating (High to Low)</option>
                <option value="rating-asc">Rating (Low to High)</option>
              </select>
            </div>
            
            <button
              onClick={() => fetchMovies()}
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
            {typeof error === 'string' && (
              <>
                {error.includes('related order') && (
                  <p className="mb-4 text-sm">This is likely an issue with sorting. Try using a different sort option or refreshing the page.</p>
                )}
                {error.includes('does not exist') && (
                  <p className="mb-4 text-sm">There seems to be a database schema mismatch. Please try resetting or contact your administrator.</p>
                )}
              </>
            )}
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => fetchMovies()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={resetMoviesView}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Reset Sorting
              </button>
            </div>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Film className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No movies found</h3>
            <p className="mb-4">Try changing your search or filter criteria</p>
            <Link 
              href="/dashboard/movies/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Movie
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
                    Movie
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Release Date
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Duration
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rating
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Genres
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPageItems.map((movie) => (
                  <tr key={movie.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded overflow-hidden">
                          {movie.poster_url ? (
                            <img
                              src={movie.poster_url}
                              alt={movie.title || 'Movie poster'}
                              className="h-10 w-10 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center bg-gray-200">
                              <Film className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            {movie.title}
                            {movie.title_he && (
                              <span className="text-xs text-gray-500 flex items-center" title="Has Hebrew translation">
                                <Globe className="h-3 w-3 text-blue-500" />
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {movie.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDate(movie.release_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movie.duration ? `${movie.duration} min` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(movie.status)}`}>
                        {movie.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {movie.genres && movie.genres.length > 0 ? (
                          movie.genres.slice(0, 3).map((genre, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {genre}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No genres</span>
                        )}
                        {movie.genres && movie.genres.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            +{movie.genres.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <Link 
                          href={`/dashboard/movies/${movie.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(movie.id)}
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
        {!loading && filteredMovies.length > 0 && (
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
                  Showing <span className="font-medium">{currentPageItems.length > 0 ? (page - 1) * perPage + 1 : 0}</span> to <span className="font-medium">{Math.min(page * perPage, totalCount)}</span> of{' '}
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