export interface Movie {
  id: string;
  title: string;
  hebrew_title: string | null;
  poster_url: string | null;
  slug: string;
}

export interface Video {
  id: string;
  title: string;
  cloudflare_id: string;
  language: string | null;
  movies: Movie;
}

export interface Trailer {
  id: string;
  title: string;
  cloudflare_id: string;
  language: string | null;
  movies: Movie;
} 