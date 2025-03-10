export interface Genre {
  id: string
  slug: string
  name: string
}

export interface Theater {
  id: string
  name: string
  location: string
  slug: string
}

export interface Movie {
  id: string
  title: string
  original_title: string | null
  release_date: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string | null
  rating: number | null
  vote_count: number
  runtime: number | null
  genres: Genre[]
  slug: string
}
