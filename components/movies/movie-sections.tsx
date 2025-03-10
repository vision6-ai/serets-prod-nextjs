import { createClient } from '@supabase/supabase-js'
import { Locale } from '@/config/i18n'
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

interface MovieTranslation {
  title: string;
  synopsis: string | null;
  poster_url: string | null;
  trailer_url: string | null;
  language_code: string;
}

async function getMoviesData(locale: string = 'en') {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const now = new Date().toISOString()

  try {
    // Fetch genres with translations
    const { data: genresData, error: genresError } = await supabase
      .from('genres')
      .select(`
        id, 
        slug,
        translations:genre_translations(name)
      `)
      .eq('translations.language_code', locale)
      .order('slug')

    if (genresError) {
      console.error('Error fetching genres:', genresError)
      return { latest: [], topRated: [], genres: [], genreMovies: {} }
    }

    // Transform genres data
    const genres = genresData?.map(genre => ({
      id: genre.id,
      slug: genre.slug,
      name: genre.translations && genre.translations.length > 0 
        ? genre.translations[0].name 
        : genre.slug // Fallback to slug if no translation
    })) || []

    // Fetch latest and top rated in parallel
    const [latestRes, topRatedRes] = await Promise.all([
      // Latest releases (last 6 months)
      supabase
        .from('movies')
        .select(`
          id,
          slug,
          release_date,
          rating,
          translations:movie_translations!inner(
            title,
            poster_url,
            language_code
          )
        `)
        .lt('release_date', now)
        .gt('release_date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
        .eq('translations.language_code', locale)
        .order('release_date', { ascending: false })
        .limit(10),

      // Top rated movies
      supabase
        .from('movies')
        .select(`
          id,
          slug,
          release_date,
          rating,
          translations:movie_translations!inner(
            title,
            poster_url,
            language_code
          )
        `)
        .lt('release_date', now)
        .gt('rating', 7)
        .eq('translations.language_code', locale)
        .order('rating', { ascending: false })
        .limit(10)
    ])

    // Transform movie data
    const transformMovieData = (movieData: any) => {
      const translation = movieData.translations && movieData.translations.length > 0 
        ? movieData.translations[0] as MovieTranslation
        : null;
      
      return {
        id: movieData.id,
        title: translation?.title || movieData.slug,
        hebrew_title: translation?.title || movieData.slug, // Using same title as fallback
        release_date: movieData.release_date,
        poster_url: translation?.poster_url || null,
        rating: movieData.rating,
        slug: movieData.slug,
      }
    }

    const latest = (latestRes.data || []).map(transformMovieData)
    const topRated = (topRatedRes.data || []).map(transformMovieData)

    // Get movies for each genre (limit to 5 genres to avoid too many queries)
    const genreMovies: Record<string, Movie[]> = {}
    
    for (const genre of genres.slice(0, 5)) {
      // Get movie IDs for this genre
      const { data: movieGenres } = await supabase
        .from('movie_genres')
        .select('movie_id')
        .eq('genre_id', genre.id)
        .limit(10)
      
      if (movieGenres && movieGenres.length > 0) {
        const movieIds = movieGenres.map(mg => mg.movie_id)
        
        // Get the actual movies
        const { data: genreMoviesData } = await supabase
          .from('movies')
          .select(`
            id,
            slug,
            release_date,
            rating,
            translations:movie_translations!inner(
              title,
              poster_url,
              language_code
            )
          `)
          .in('id', movieIds)
          .eq('translations.language_code', locale)
          .order('release_date', { ascending: false })
          .limit(10)
        
        genreMovies[genre.id] = (genreMoviesData || []).map(transformMovieData)
      } else {
        genreMovies[genre.id] = []
      }
    }

    return { latest, topRated, genres, genreMovies }
  } catch (error) {
    console.error('Error fetching movies data:', error)
    return { latest: [], topRated: [], genres: [], genreMovies: {} }
  }
}

export async function MovieSections({ locale }: { locale: Locale }) {
  const { latest, topRated, genres, genreMovies } = await getMoviesData(locale)

  return (
    <div className="space-y-12">
      <MovieSlider title="Latest Releases" movies={latest} locale={locale} />
      <MovieSlider title="Top Rated" movies={topRated} locale={locale} />
      
      {genres.map(genre => (
        genreMovies[genre.id]?.length > 0 && (
          <MovieSlider 
            key={genre.id}
            title={genre.name}
            movies={genreMovies[genre.id] || []}
            viewAllHref={`/genres/${genre.slug}`}
            locale={locale}
          />
        )
      )).slice(0, 5)}
    </div>
  )
}
