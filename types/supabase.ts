export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      actors: {
        Row: {
          id: string
          name: string
          hebrew_name: string | null
          bio: string | null
          photo_url: string | null
          tmdb_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          hebrew_name?: string | null
          bio?: string | null
          photo_url?: string | null
          tmdb_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          hebrew_name?: string | null
          bio?: string | null
          photo_url?: string | null
          tmdb_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      genres: {
        Row: {
          id: string
          name: string
          hebrew_name: string | null
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          hebrew_name?: string | null
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          hebrew_name?: string | null
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      movie_actors: {
        Row: {
          id: string
          movie_id: string
          actor_id: string
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          movie_id: string
          actor_id: string
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          movie_id?: string
          actor_id?: string
          role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      movie_genres: {
        Row: {
          id: string
          movie_id: string
          genre_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          movie_id: string
          genre_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          movie_id?: string
          genre_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      movies: {
        Row: {
          id: string
          title: string
          hebrew_title: string | null
          description: string | null
          poster_url: string | null
          release_date: string | null
          runtime: number | null
          tmdb_id: number | null
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          hebrew_title?: string | null
          description?: string | null
          poster_url?: string | null
          release_date?: string | null
          runtime?: number | null
          tmdb_id?: number | null
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          hebrew_title?: string | null
          description?: string | null
          poster_url?: string | null
          release_date?: string | null
          runtime?: number | null
          tmdb_id?: number | null
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      trailers: {
        Row: {
          id: string
          title: string
          cloudflare_id: string
          cloudflare_status: string
          language: string | null
          movie_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          cloudflare_id: string
          cloudflare_status: string
          language?: string | null
          movie_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          cloudflare_id?: string
          cloudflare_status?: string
          language?: string | null
          movie_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_watchlist: {
        Row: {
          id: string
          user_id: string
          movie_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          movie_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          movie_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
