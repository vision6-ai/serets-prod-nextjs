export interface Theater {
  id: string
  name: string
  slug: string
  location: string
  address: string
  phone: string | null
  email: string | null
  website: string | null
  description: string | null
  amenities: string[]
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface TheaterMovie {
  id: string
  theater_id: string
  movie_id: string
  active_status: boolean
  showtimes: Showtime[]
  start_date: string
  end_date: string
  format: string[]
  language: string
  subtitles: string | null
  created_at: string
  updated_at: string
}

export interface Showtime {
  id: string
  time: string
  date: string
  available_seats: number
  total_seats: number
  price: number
  hall: string
  format: string
}

export interface Movie {
  id: string
  title: string
  hebrew_title: string | null
  synopsis: string | null
  release_date: string | null
  duration: number | null
  rating: number | null
  poster_url: string | null
  slug: string
  genres?: { name: string; slug: string }[]
}