export interface Movie {
  id: string
  title: string
  hebrew_title: string | null
  synopsis?: string | null
  release_date?: string | null
  duration?: number | null
  rating?: number | null
  poster_url: string | null
  slug: string
  bigger_movie_id?: string | null;
}
