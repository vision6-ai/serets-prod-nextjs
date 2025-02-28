/*
  # Initial Database Schema for Israeli Movie Hub

  1. New Tables
    - `movies`: Store movie information
    - `actors`: Store actor information
    - `movie_actors`: Junction table for movie-actor relationships
    - `genres`: Movie genres
    - `movie_genres`: Junction table for movie-genre relationships
    - `reviews`: User reviews for movies
    - `watchlists`: User watchlists
    - `seo_meta`: SEO metadata for content
    - `awards`: Awards information
    - `actor_awards`: Junction table for actor-award relationships
    - `movie_awards`: Junction table for movie-award relationships

  2. Security
    - Enable RLS on all tables
    - Public read access for most tables
    - Authenticated user access for reviews and watchlists
    - Proper policies for data access control

  3. Performance
    - Indexes on frequently queried columns
    - Proper foreign key constraints
    - Timestamp handling for created/updated
*/

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  hebrew_title text,
  slug text UNIQUE NOT NULL,
  synopsis text,
  release_date date,
  duration integer,
  rating decimal(3,1),
  trailer_url text,
  poster_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create actors table
CREATE TABLE IF NOT EXISTS actors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hebrew_name text,
  slug text UNIQUE NOT NULL,
  biography text,
  birth_date date,
  birth_place text,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create movie_actors junction table
CREATE TABLE IF NOT EXISTS movie_actors (
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES actors(id) ON DELETE CASCADE,
  role text NOT NULL,
  PRIMARY KEY (movie_id, actor_id)
);

-- Create genres table
CREATE TABLE IF NOT EXISTS genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  hebrew_name text,
  slug text UNIQUE NOT NULL
);

-- Create movie_genres junction table
CREATE TABLE IF NOT EXISTS movie_genres (
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  genre_id uuid REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, genre_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 10),
  content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(movie_id, user_id)
);

-- Create watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Create seo_meta table
CREATE TABLE IF NOT EXISTS seo_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL, -- 'movie', 'actor', 'genre'
  content_id uuid NOT NULL,
  meta_title text,
  meta_description text,
  og_title text,
  og_description text,
  og_image text,
  keywords text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id)
);

-- Create awards table
CREATE TABLE IF NOT EXISTS awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hebrew_name text,
  year integer NOT NULL,
  category text NOT NULL,
  description text
);

-- Create actor_awards junction table
CREATE TABLE IF NOT EXISTS actor_awards (
  actor_id uuid REFERENCES actors(id) ON DELETE CASCADE,
  award_id uuid REFERENCES awards(id) ON DELETE CASCADE,
  year integer NOT NULL,
  is_winner boolean DEFAULT false,
  PRIMARY KEY (actor_id, award_id, year)
);

-- Create movie_awards junction table
CREATE TABLE IF NOT EXISTS movie_awards (
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  award_id uuid REFERENCES awards(id) ON DELETE CASCADE,
  year integer NOT NULL,
  is_winner boolean DEFAULT false,
  PRIMARY KEY (movie_id, award_id, year)
);

-- Enable Row Level Security
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE actor_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_awards ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on movies" ON movies FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on actors" ON actors FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on movie_actors" ON movie_actors FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on genres" ON genres FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on movie_genres" ON movie_genres FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on reviews" ON reviews FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on awards" ON awards FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on actor_awards" ON actor_awards FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on movie_awards" ON movie_awards FOR SELECT TO public USING (true);

-- Create policies for authenticated user access
CREATE POLICY "Allow authenticated users to create reviews" ON reviews FOR INSERT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own reviews" ON reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own reviews" ON reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to manage watchlist" ON watchlists FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_slug ON movies(slug);
CREATE INDEX IF NOT EXISTS idx_actors_slug ON actors(slug);
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date);
CREATE INDEX IF NOT EXISTS idx_movies_rating ON movies(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON reviews(movie_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_movie_id ON watchlists(movie_id);
CREATE INDEX IF NOT EXISTS idx_seo_meta_content ON seo_meta(content_type, content_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_movies_updated_at
    BEFORE UPDATE ON movies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actors_updated_at
    BEFORE UPDATE ON actors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_meta_updated_at
    BEFORE UPDATE ON seo_meta
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();