export type Language = {
  code: string;
  name: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  is_default: boolean;
  is_active: boolean;
};

export type Movie = {
  id: string;
  slug: string;
  release_date: string | null;
  duration: number | null;
  rating: number | null;
  trailer_url: string | null;
  poster_url: string | null;
  created_at: string;
  updated_at: string;
};

export type MovieWithTranslations = Movie & {
  title: string;
  hebrew_title: string | null;
  synopsis: string | null;
};

export type MovieTranslation = {
  id: string;
  movie_id: string;
  language_code: string;
  title: string;
  synopsis: string | null;
  created_at: string;
  updated_at: string;
};

export type Actor = {
  id: string;
  slug: string;
  birth_date: string | null;
  birth_place: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ActorWithTranslations = Actor & {
  name: string;
  hebrew_name: string | null;
  biography: string | null;
};

export type ActorTranslation = {
  id: string;
  actor_id: string;
  language_code: string;
  name: string;
  biography: string | null;
  created_at: string;
  updated_at: string;
};

export type Genre = {
  id: string;
  slug: string;
};

export type GenreWithTranslations = Genre & {
  name: string;
  hebrew_name: string | null;
};

export type GenreTranslation = {
  id: string;
  genre_id: string;
  language_code: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Award = {
  id: string;
  year: number;
  category: string;
};

export type AwardWithTranslations = Award & {
  name: string;
  hebrew_name: string | null;
  description: string | null;
};

export type AwardTranslation = {
  id: string;
  award_id: string;
  language_code: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type SeoMeta = {
  id: string;
  content_type: string;
  content_id: string;
  og_image: string | null;
  created_at: string;
  updated_at: string;
};

export type SeoMetaTranslation = {
  id: string;
  seo_meta_id: string;
  language_code: string;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  keywords: string[] | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      movies: {
        Row: Movie;
        Insert: Omit<Movie, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Movie, 'id' | 'created_at' | 'updated_at'>>;
      };
      movie_translations: {
        Row: MovieTranslation;
        Insert: Omit<MovieTranslation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MovieTranslation, 'id' | 'created_at' | 'updated_at'>>;
      };
      actors: {
        Row: Actor;
        Insert: Omit<Actor, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Actor, 'id' | 'created_at' | 'updated_at'>>;
      };
      actor_translations: {
        Row: ActorTranslation;
        Insert: Omit<ActorTranslation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ActorTranslation, 'id' | 'created_at' | 'updated_at'>>;
      };
      genres: {
        Row: Genre;
        Insert: Omit<Genre, 'id'>;
        Update: Partial<Omit<Genre, 'id'>>;
      };
      genre_translations: {
        Row: GenreTranslation;
        Insert: Omit<GenreTranslation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<GenreTranslation, 'id' | 'created_at' | 'updated_at'>>;
      };
      awards: {
        Row: Award;
        Insert: Omit<Award, 'id'>;
        Update: Partial<Omit<Award, 'id'>>;
      };
      award_translations: {
        Row: AwardTranslation;
        Insert: Omit<AwardTranslation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AwardTranslation, 'id' | 'created_at' | 'updated_at'>>;
      };
      languages: {
        Row: Language;
        Insert: Language;
        Update: Partial<Language>;
      };
      seo_meta: {
        Row: SeoMeta;
        Insert: Omit<SeoMeta, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SeoMeta, 'id' | 'created_at' | 'updated_at'>>;
      };
      seo_meta_translations: {
        Row: SeoMetaTranslation;
        Insert: Omit<SeoMetaTranslation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SeoMetaTranslation, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      movies_with_translations: {
        Row: MovieWithTranslations;
      };
      actors_with_translations: {
        Row: ActorWithTranslations;
      };
      genres_with_translations: {
        Row: GenreWithTranslations;
      };
    };
  };
}; 