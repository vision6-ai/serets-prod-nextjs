'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, Trash2, Film, X, Edit } from 'lucide-react'

interface Movie {
  id: string
  title: string
  release_date: string | null
  poster_url: string | null
}

interface MovieActor {
  id: string
  movie_id: string
  actor_id: string
  role: string | null
  movie: Movie
}

interface MovieAssociationsProps {
  actorId: string | undefined
  onError: (message: string) => void
}

export function MovieAssociations({ actorId, onError }: MovieAssociationsProps) {
  const [movieActors, setMovieActors] = useState<MovieActor[]>([])
  const [loading, setLoading] = useState(true)
  const [movies, setMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [role, setRole] = useState('')
  const [addingRole, setAddingRole] = useState(false)
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [updatedRole, setUpdatedRole] = useState('')
  const [updatingRole, setUpdatingRole] = useState(false)
  
  const supabase = createClientComponentClient()
  
  // Fetch existing movie associations for this actor
  useEffect(() => {
    if (!actorId) return
    
    const fetchMovieActors = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('movie_actors')
          .select(`
            id,
            movie_id,
            actor_id,
            role,
            movies:movie_id (
              id,
              movie_translations (
                title,
                poster_url,
                language_code
              ),
              release_date
            )
          `)
          .eq('actor_id', actorId)
        
        if (error) throw error
        
        // Process data to extract the movie title from translations
        const processedData = data.map((item: any) => {
          // Find the English translation or use the first available
          const englishTranslation = item.movies.movie_translations.find(
            (t: any) => t.language_code === 'en'
          ) || item.movies.movie_translations[0]
          
          return {
            id: item.id,
            movie_id: item.movie_id,
            actor_id: item.actor_id,
            role: item.role,
            movie: {
              id: item.movies.id,
              title: englishTranslation?.title || 'Untitled',
              release_date: item.movies.release_date,
              poster_url: englishTranslation?.poster_url
            }
          }
        })
        
        setMovieActors(processedData)
      } catch (err: any) {
        console.error('Error loading movie associations:', err)
        onError(err.message || 'Failed to load movie associations')
      } finally {
        setLoading(false)
      }
    }
    
    fetchMovieActors()
  }, [actorId, supabase])
  
  // Search for movies
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('movies')
        .select(`
          id,
          release_date,
          movie_translations (
            title,
            poster_url,
            language_code
          )
        `)
        .or(`movie_translations.title.ilike.%${searchQuery}%`)
        .limit(10)
      
      if (error) throw error
      
      // Process results
      const processedResults = data.map((movie: any) => {
        const englishTranslation = movie.movie_translations.find(
          (t: any) => t.language_code === 'en'
        ) || movie.movie_translations[0]
        
        return {
          id: movie.id,
          title: englishTranslation?.title || 'Untitled',
          release_date: movie.release_date,
          poster_url: englishTranslation?.poster_url
        }
      })
      
      setSearchResults(processedResults)
    } catch (err: any) {
      console.error('Error searching movies:', err)
      onError(err.message || 'Failed to search movies')
    }
  }
  
  // Add movie association
  const addMovieAssociation = async () => {
    if (!actorId || !selectedMovie) return
    
    setAddingRole(true)
    
    try {
      // Check if this association already exists
      const { data: existingAssoc, error: checkError } = await supabase
        .from('movie_actors')
        .select('id')
        .eq('actor_id', actorId)
        .eq('movie_id', selectedMovie.id)
        .maybeSingle()
      
      if (checkError) throw checkError
      
      if (existingAssoc) {
        throw new Error('This actor is already associated with this movie')
      }
      
      // Add the new association
      const { data, error } = await supabase
        .from('movie_actors')
        .insert({
          actor_id: actorId,
          movie_id: selectedMovie.id,
          role: role.trim() || null
        })
        .select()
      
      if (error) throw error
      
      // Add the new association to the state
      setMovieActors(prev => [
        ...prev,
        {
          id: data[0].id,
          movie_id: selectedMovie.id,
          actor_id: actorId,
          role: role.trim() || null,
          movie: selectedMovie
        }
      ])
      
      // Reset form
      setSelectedMovie(null)
      setRole('')
      setShowSearchModal(false)
    } catch (err: any) {
      console.error('Error adding movie association:', err)
      onError(err.message || 'Failed to add movie association')
    } finally {
      setAddingRole(false)
    }
  }
  
  // Remove movie association
  const removeMovieAssociation = async (id: string) => {
    const movieActor = movieActors.find(ma => ma.id === id)
    if (!movieActor) return
    
    if (!confirm(`Are you sure you want to remove the association with "${movieActor.movie.title}"${movieActor.role ? ` (Role: ${movieActor.role})` : ''}? This action cannot be undone.`)) return
    
    try {
      const { error } = await supabase
        .from('movie_actors')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Update state
      setMovieActors(prev => prev.filter(ma => ma.id !== id))
    } catch (err: any) {
      console.error('Error removing movie association:', err)
      onError(err.message || 'Failed to remove movie association')
    }
  }
  
  // Start editing a role
  const startEditRole = (movieActor: MovieActor) => {
    setEditingRole(movieActor.id)
    setUpdatedRole(movieActor.role || '')
  }
  
  // Update role
  const updateRole = async (id: string) => {
    setUpdatingRole(true)
    
    try {
      const { error } = await supabase
        .from('movie_actors')
        .update({ role: updatedRole.trim() || null })
        .eq('id', id)
      
      if (error) throw error
      
      // Update state
      setMovieActors(prev => prev.map(ma => 
        ma.id === id 
          ? { ...ma, role: updatedRole.trim() || null } 
          : ma
      ))
      
      // Reset editing state
      setEditingRole(null)
      setUpdatedRole('')
    } catch (err: any) {
      console.error('Error updating role:', err)
      onError(err.message || 'Failed to update role')
    } finally {
      setUpdatingRole(false)
    }
  }
  
  // Format release date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }
  
  if (!actorId) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-sm text-yellow-700">
          You must save the actor first before adding movie associations.
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          Movie Appearances
          {!loading && movieActors.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {movieActors.length}
            </span>
          )}
        </h3>
        <button
          type="button"
          onClick={() => setShowSearchModal(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Movie
        </button>
      </div>
      
      {loading ? (
        <div className="py-4 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
        </div>
      ) : movieActors.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center rounded-md">
          <Film className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No movies</h3>
          <p className="mt-1 text-sm text-gray-500">
            This actor doesn't appear in any movies yet. Add movies to increase visibility on the site.
          </p>
          <div className="mt-3 bg-blue-50 p-4 rounded-md text-blue-700 text-sm mx-auto max-w-md">
            <p>Tip: Actors with movie associations will appear on movie pages and in search results more prominently!</p>
          </div>
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="mt-3 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Movie
          </button>
        </div>
      ) : (
        <>
          {movieActors.length > 20 && (
            <div className="bg-yellow-50 p-4 rounded-md mb-4 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                This actor is associated with a large number of movies ({movieActors.length}). 
                Consider removing any incorrect associations to improve performance.
              </p>
            </div>
          )}
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Movie
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Release Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movieActors.map(ma => (
                  <tr key={ma.id} className="group hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded overflow-hidden">
                          {ma.movie.poster_url ? (
                            <img
                              src={ma.movie.poster_url}
                              alt={ma.movie.title}
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
                          <div className="text-sm font-medium text-gray-900">
                            {ma.movie.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ma.movie.release_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingRole === ma.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={updatedRole}
                            onChange={(e) => setUpdatedRole(e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full"
                            placeholder="Role name"
                          />
                          <button
                            type="button"
                            onClick={() => updateRole(ma.id)}
                            disabled={updatingRole}
                            className="text-blue-600 hover:text-blue-900"
                            title="Save"
                          >
                            {updatingRole ? '...' : '✓'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRole(null)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span>{ma.role || 'Unnamed Role'}</span>
                          <button
                            type="button"
                            onClick={() => startEditRole(ma)}
                            className="text-blue-600 hover:text-blue-900 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Edit role"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => removeMovieAssociation(ma.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                        {selectedMovie ? 'Add Role' : 'Add Movie'}
                      </h3>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowSearchModal(false)
                          setSelectedMovie(null)
                          setRole('')
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {!selectedMovie ? (
                      <>
                        <div className="mb-4">
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                              placeholder="Search for a movie..."
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleSearch()
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleSearch}
                              className="ml-3 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Search
                            </button>
                          </div>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto rounded-md border border-gray-200">
                          {searchResults.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                              {searchQuery.trim() ? 'No movies found' : 'Enter a search term to find movies'}
                            </div>
                          ) : (
                            <ul className="divide-y divide-gray-200">
                              {searchResults.map(movie => (
                                <li 
                                  key={movie.id}
                                  className="p-3 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => setSelectedMovie(movie)}
                                >
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded overflow-hidden">
                                      {movie.poster_url ? (
                                        <img
                                          src={movie.poster_url}
                                          alt={movie.title}
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
                                      <div className="text-sm font-medium text-gray-900">
                                        {movie.title}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {formatDate(movie.release_date)}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center mb-4">
                          <div className="flex-shrink-0 h-16 w-12 bg-gray-100 rounded overflow-hidden">
                            {selectedMovie.poster_url ? (
                              <img
                                src={selectedMovie.poster_url}
                                alt={selectedMovie.title}
                                className="h-16 w-12 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x64?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="h-16 w-12 flex items-center justify-center bg-gray-200">
                                <Film className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-lg font-medium text-gray-900">
                              {selectedMovie.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(selectedMovie.release_date)}
                            </div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                            Role (optional)
                          </label>
                          <input
                            type="text"
                            id="role"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="e.g. John Doe, Detective, etc."
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedMovie ? (
                  <button
                    type="button"
                    onClick={addMovieAssociation}
                    disabled={addingRole}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingRole ? 'Adding...' : 'Add Role'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSearchModal(false)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                )}
                {selectedMovie && (
                  <button
                    type="button"
                    onClick={() => setSelectedMovie(null)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Back
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 