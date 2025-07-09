export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      genres: {
        Row: {
          created_at: string | null
          id: number
          name_en: string
          name_he: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: number
          name_en: string
          name_he?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name_en?: string
          name_he?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      israeli_watch_providers: {
        Row: {
          available_from: string | null
          available_until: string | null
          created_at: string | null
          currency: string | null
          deep_link_url: string | null
          display_priority: number | null
          id: string
          justwatch_url: string | null
          logo_path: string | null
          movie_id: string | null
          price_ils: number | null
          provider_id: number
          provider_name: string
          provider_type: string
          updated_at: string | null
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          currency?: string | null
          deep_link_url?: string | null
          display_priority?: number | null
          id?: string
          justwatch_url?: string | null
          logo_path?: string | null
          movie_id?: string | null
          price_ils?: number | null
          provider_id: number
          provider_name: string
          provider_type: string
          updated_at?: string | null
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          currency?: string | null
          deep_link_url?: string | null
          display_priority?: number | null
          id?: string
          justwatch_url?: string | null
          logo_path?: string | null
          movie_id?: string | null
          price_ils?: number | null
          provider_id?: number
          provider_name?: string
          provider_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "israeli_watch_providers_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "connected_movies_with_showtimes"
            referencedColumns: ["movie_id"]
          },
          {
            foreignKeyName: "israeli_watch_providers_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "israeli_movies_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "israeli_watch_providers_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "israeli_watch_providers_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "showtime_movie_status"
            referencedColumns: ["movie_id"]
          },
        ]
      }
      movie_collection_members: {
        Row: {
          collection_id: number
          movie_id: string
          part_number: number | null
        }
        Insert: {
          collection_id: number
          movie_id: string
          part_number?: number | null
        }
        Update: {
          collection_id?: number
          movie_id?: string
          part_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "movie_collection_members_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "movie_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_collection_members_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "connected_movies_with_showtimes"
            referencedColumns: ["movie_id"]
          },
          {
            foreignKeyName: "movie_collection_members_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "israeli_movies_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_collection_members_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_collection_members_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "showtime_movie_status"
            referencedColumns: ["movie_id"]
          },
        ]
      }
      movie_collections: {
        Row: {
          backdrop_path: string | null
          created_at: string | null
          id: number
          name_en: string
          name_he: string | null
          overview_en: string | null
          overview_he: string | null
          poster_path: string | null
          updated_at: string | null
        }
        Insert: {
          backdrop_path?: string | null
          created_at?: string | null
          id: number
          name_en: string
          name_he?: string | null
          overview_en?: string | null
          overview_he?: string | null
          poster_path?: string | null
          updated_at?: string | null
        }
        Update: {
          backdrop_path?: string | null
          created_at?: string | null
          id?: number
          name_en?: string
          name_he?: string | null
          overview_en?: string | null
          overview_he?: string | null
          poster_path?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      movie_credits: {
        Row: {
          character_name: string | null
          created_at: string | null
          credit_order: number | null
          credit_type: string
          department: string | null
          id: string
          job: string | null
          movie_id: string | null
          person_id: string | null
        }
        Insert: {
          character_name?: string | null
          created_at?: string | null
          credit_order?: number | null
          credit_type: string
          department?: string | null
          id?: string
          job?: string | null
          movie_id?: string | null
          person_id?: string | null
        }
        Update: {
          character_name?: string | null
          created_at?: string | null
          credit_order?: number | null
          credit_type?: string
          department?: string | null
          id?: string
          job?: string | null
          movie_id?: string | null
          person_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movie_credits_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "connected_movies_with_showtimes"
            referencedColumns: ["movie_id"]
          },
          {
            foreignKeyName: "movie_credits_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "israeli_movies_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_credits_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_credits_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "showtime_movie_status"
            referencedColumns: ["movie_id"]
          },
          {
            foreignKeyName: "movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      movie_genres: {
        Row: {
          created_at: string | null
          genre_id: number
          movie_id: string
        }
        Insert: {
          created_at?: string | null
          genre_id: number
          movie_id: string
        }
        Update: {
          created_at?: string | null
          genre_id?: number
          movie_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_genres_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "connected_movies_with_showtimes"
            referencedColumns: ["movie_id"]
          },
          {
            foreignKeyName: "movie_genres_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "israeli_movies_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_genres_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_genres_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "showtime_movie_status"
            referencedColumns: ["movie_id"]
          },
        ]
      }
      movie_videos: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          id: string
          language_code: string | null
          movie_id: string | null
          name: string
          official: boolean | null
          published_at: string | null
          site: string
          size: number | null
          video_key: string
          video_type: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          language_code?: string | null
          movie_id?: string | null
          name: string
          official?: boolean | null
          published_at?: string | null
          site: string
          size?: number | null
          video_key: string
          video_type: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          language_code?: string | null
          movie_id?: string | null
          name?: string
          official?: boolean | null
          published_at?: string | null
          site?: string
          size?: number | null
          video_key?: string
          video_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_videos_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "connected_movies_with_showtimes"
            referencedColumns: ["movie_id"]
          },
          {
            foreignKeyName: "movie_videos_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "israeli_movies_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_videos_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_videos_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "showtime_movie_status"
            referencedColumns: ["movie_id"]
          },
        ]
      }
      movies: {
        Row: {
          adult: boolean | null
          backdrop_path: string | null
          budget: number | null
          countit_pid: string | null
          created_at: string | null
          id: string
          imdb_id: string | null
          israeli_rating: string | null
          israeli_release_date: string | null
          keywords_en: string[] | null
          keywords_he: string[] | null
          original_title: string | null
          overview_en: string | null
          overview_he: string | null
          popularity: number | null
          poster_path_en: string | null
          poster_path_he: string | null
          release_date: string | null
          revenue: number | null
          runtime: number | null
          slug: string | null
          status: string | null
          synced_at: string | null
          tagline_en: string | null
          tagline_he: string | null
          title_en: string | null
          title_he: string | null
          tmdb_id: number | null
          translation_quality: number | null
          updated_at: string | null
          vote_average: number | null
          vote_count: number | null
        }
        Insert: {
          adult?: boolean | null
          backdrop_path?: string | null
          budget?: number | null
          countit_pid?: string | null
          created_at?: string | null
          id?: string
          imdb_id?: string | null
          israeli_rating?: string | null
          israeli_release_date?: string | null
          keywords_en?: string[] | null
          keywords_he?: string[] | null
          original_title?: string | null
          overview_en?: string | null
          overview_he?: string | null
          popularity?: number | null
          poster_path_en?: string | null
          poster_path_he?: string | null
          release_date?: string | null
          revenue?: number | null
          runtime?: number | null
          slug?: string | null
          status?: string | null
          synced_at?: string | null
          tagline_en?: string | null
          tagline_he?: string | null
          title_en?: string | null
          title_he?: string | null
          tmdb_id?: number | null
          translation_quality?: number | null
          updated_at?: string | null
          vote_average?: number | null
          vote_count?: number | null
        }
        Update: {
          adult?: boolean | null
          backdrop_path?: string | null
          budget?: number | null
          countit_pid?: string | null
          created_at?: string | null
          id?: string
          imdb_id?: string | null
          israeli_rating?: string | null
          israeli_release_date?: string | null
          keywords_en?: string[] | null
          keywords_he?: string[] | null
          original_title?: string | null
          overview_en?: string | null
          overview_he?: string | null
          popularity?: number | null
          poster_path_en?: string | null
          poster_path_he?: string | null
          release_date?: string | null
          revenue?: number | null
          runtime?: number | null
          slug?: string | null
          status?: string | null
          synced_at?: string | null
          tagline_en?: string | null
          tagline_he?: string | null
          title_en?: string | null
          title_he?: string | null
          tmdb_id?: number | null
          translation_quality?: number | null
          updated_at?: string | null
          vote_average?: number | null
          vote_count?: number | null
        }
        Relationships: []
      }
      people: {
        Row: {
          also_known_as: string[] | null
          biography_en: string | null
          biography_he: string | null
          birthday: string | null
          created_at: string | null
          deathday: string | null
          gender: number | null
          id: string
          known_for_department: string | null
          name_en: string | null
          name_he: string | null
          place_of_birth: string | null
          popularity: number | null
          profile_path: string | null
          slug: string | null
          synced_at: string | null
          tmdb_id: number
          updated_at: string | null
        }
        Insert: {
          also_known_as?: string[] | null
          biography_en?: string | null
          biography_he?: string | null
          birthday?: string | null
          created_at?: string | null
          deathday?: string | null
          gender?: number | null
          id?: string
          known_for_department?: string | null
          name_en?: string | null
          name_he?: string | null
          place_of_birth?: string | null
          popularity?: number | null
          profile_path?: string | null
          slug?: string | null
          synced_at?: string | null
          tmdb_id: number
          updated_at?: string | null
        }
        Update: {
          also_known_as?: string[] | null
          biography_en?: string | null
          biography_he?: string | null
          birthday?: string | null
          created_at?: string | null
          deathday?: string | null
          gender?: number | null
          id?: string
          known_for_department?: string | null
          name_en?: string | null
          name_he?: string | null
          place_of_birth?: string | null
          popularity?: number | null
          profile_path?: string | null
          slug?: string | null
          synced_at?: string | null
          tmdb_id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      showtimes: {
        Row: {
          availableseats: number | null
          banner: string | null
          chain: string
          cinema: string
          city: string
          day: string
          deeplink: string | null
          genres: string | null
          id: number
          imdbid: string | null
          lastupdate: string | null
          movie_english: string | null
          movie_name: string
          moviepid: string
          showtime_pid: number
          time: string
        }
        Insert: {
          availableseats?: number | null
          banner?: string | null
          chain: string
          cinema: string
          city: string
          day: string
          deeplink?: string | null
          genres?: string | null
          id?: never
          imdbid?: string | null
          lastupdate?: string | null
          movie_english?: string | null
          movie_name: string
          moviepid: string
          showtime_pid: number
          time: string
        }
        Update: {
          availableseats?: number | null
          banner?: string | null
          chain?: string
          cinema?: string
          city?: string
          day?: string
          deeplink?: string | null
          genres?: string | null
          id?: never
          imdbid?: string | null
          lastupdate?: string | null
          movie_english?: string | null
          movie_name?: string
          moviepid?: string
          showtime_pid?: number
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_showtimes_theaters_chain_cinema"
            columns: ["chain", "cinema"]
            isOneToOne: false
            referencedRelation: "theaters"
            referencedColumns: ["chain", "name"]
          },
        ]
      }
      sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          details: Json | null
          duration_ms: number | null
          error: string | null
          id: string
          job_type: string
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          details?: Json | null
          duration_ms?: number | null
          error?: string | null
          id?: string
          job_type: string
          started_at?: string
          status: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          details?: Json | null
          duration_ms?: number | null
          error?: string | null
          id?: string
          job_type?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      theaters: {
        Row: {
          chain: string
          cinemaid: number
          city: string
          competitionarea: string | null
          externaltheaterid: number | null
          extracinemaid: string | null
          id: number
          lastupdate: string | null
          location: string | null
          name: string
          name_he: string
        }
        Insert: {
          chain: string
          cinemaid: number
          city: string
          competitionarea?: string | null
          externaltheaterid?: number | null
          extracinemaid?: string | null
          id?: never
          lastupdate?: string | null
          location?: string | null
          name: string
          name_he: string
        }
        Update: {
          chain?: string
          cinemaid?: number
          city?: string
          competitionarea?: string | null
          externaltheaterid?: number | null
          extracinemaid?: string | null
          id?: never
          lastupdate?: string | null
          location?: string | null
          name?: string
          name_he?: string
        }
        Relationships: []
      }
    }
    Views: {
      connected_movies_with_showtimes: {
        Row: {
          chains: string | null
          cinema_chains_count: number | null
          cinemas_count: number | null
          cities: string | null
          cities_count: number | null
          countit_pid: string | null
          earliest_showtime: string | null
          imdb_id: string | null
          israeli_release_date: string | null
          latest_showtime: string | null
          latest_showtime_update: string | null
          movie_created_at: string | null
          movie_id: string | null
          movie_updated_at: string | null
          original_title: string | null
          release_date: string | null
          runtime: number | null
          showtime_english_names: string | null
          showtime_movie_names: string | null
          title_en: string | null
          title_he: string | null
          tmdb_id: number | null
          total_showtimes: number | null
          vote_average: number | null
        }
        Relationships: []
      }
      database_schema_info: {
        Row: {
          purpose: string | null
          table_name: unknown | null
          table_size: string | null
        }
        Relationships: []
      }
      israeli_movies_availability: {
        Row: {
          id: string | null
          israeli_release_date: string | null
          purchase_providers: string[] | null
          rental_providers: string[] | null
          streaming_providers: string[] | null
          title_en: string | null
          title_he: string | null
        }
        Relationships: []
      }
      movie_showtime_connection_summary: {
        Row: {
          category: string | null
          count: number | null
          total_showtimes: number | null
        }
        Relationships: []
      }
      showtime_movie_status: {
        Row: {
          chain: string | null
          cinema: string | null
          city: string | null
          connection_status: string | null
          movie_created_at: string | null
          movie_id: string | null
          movie_original_title: string | null
          movie_title_en: string | null
          movie_title_he: string | null
          movie_updated_at: string | null
          moviepid: string | null
          showtime_date: string | null
          showtime_id: number | null
          showtime_last_update: string | null
          showtime_movie_english: string | null
          showtime_movie_name: string | null
          showtime_pid: number | null
          showtime_time: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_showtimes_theaters_chain_cinema"
            columns: ["chain", "cinema"]
            isOneToOne: false
            referencedRelation: "theaters"
            referencedColumns: ["chain", "name"]
          },
        ]
      }
      showtime_orphan_summary: {
        Row: {
          chains: string | null
          cinema_chains_count: number | null
          cities_count: number | null
          earliest_showtime: string | null
          latest_showtime: string | null
          movie_english: string | null
          movie_name: string | null
          moviepid: string | null
          orphaned_showtime_count: number | null
        }
        Relationships: []
      }
      sync_job_summary: {
        Row: {
          avg_duration_ms: number | null
          count: number | null
          job_type: string | null
          last_run: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_movie_keywords: {
        Args: {
          p_movie_id: string
          p_keywords_en: string[]
          p_keywords_he: string[]
        }
        Returns: undefined
      }
      cleanup_old_sync_jobs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      trigger_movie_sync: {
        Args: { p_tmdb_id: number }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const