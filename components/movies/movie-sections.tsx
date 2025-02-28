import { createClient } from '@supabase/supabase-js'
import { MovieSlider } from './movie-slider'
import { Suspense } from 'react'

interface Movie {
  id: string
  title: string
  hebrew_title: string | null
  release_date: string | null
  poster_url: string | null
  rating: number | null
  slug: string
}

interface Genre {
  id: string
  name: string
  slug: string
}

async function getMoviesData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const now = new Date().toISOString()

  try {
    // Fetch genres first
    const { data: genres, error: genresError } = await supabase
      .from('genres')
      .select('*')
      .order('name')

    if (genresError) {
      console.error('Error fetching genres:', genresError)
      return { latest: [], topRated: [], genreMovies: {} }
    }

    // Fetch latest and top rated in parallel
    const [latestRes, topRatedRes] = await Promise.all([
      // Latest releases (last 6 months)
      supabase
        .from('movies')
        .select('id, title, hebrew_title, release_date, poster_url, rating, slug')
        .lt('release_date', now)
        .gt('release_date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
        .order('release_date', { ascending: false })
        .limit(10),

      // Top rated movies
      supabase
        .from('movies')
        .select('id, title, hebrew_title, release_date, poster_url, rating, slug')
        .lt('release_date', now)
        .order('rating', { ascending: false })
        .limit(10)
    ])

    // Fetch movies for each genre
    const genreMovies: { [key: string]: { name: string, movies: Movie[] } } = {}
    
    await Promise.all(genres.map(async (genre) => {
      const { data: movieIds } = await supabase
        .from('movie_genres')
        .select('movie_id')
        .eq('genre_id', genre.id)
        .limit(10)

      if (movieIds && movieIds.length > 0) {
        const { data: movies } = await supabase
          .from('movies')
          .select('id, title, hebrew_title, release_date, poster_url, rating, slug')
          .in('id', movieIds.map(m => m.movie_id))
          .lt('release_date', now)
          .order('release_date', { ascending: false })

        if (movies && movies.length > 0) {
          genreMovies[genre.slug] = {
            name: genre.name,
            movies: movies
          }
        }
      }
    }))

    return {
      latest: latestRes.data || [],
      topRated: topRatedRes.data || [],
      genreMovies
    }
  } catch (error) {
    console.error('Error fetching movies:', error)
    return { latest: [], topRated: [], genreMovies: {} }
  }
}

export async function MovieSections() {
  const { latest, topRated, genreMovies } = await getMoviesData()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MovieSlider
        title="Latest Releases"
        movies={latest}
        loading={false}
        viewAllHref="/movies/latest"
      />
      
      <MovieSlider
        title="Top Rated"
        movies={topRated}
        loading={false}
        viewAllHref="/movies/top-rated"
      />
      
      {/* Genre-based movie sliders */}
      {Object.entries(genreMovies).map(([slug, { name, movies }]) => (
        <MovieSlider
          key={slug}
          title={name}
          movies={movies}
          loading={false}
          viewAllHref={`/genres/${slug}`}
        />
      ))}
    </Suspense>
  )
}
