-- Create a table for logging actor enrichment process
CREATE TABLE IF NOT EXISTS enrich_actor_logs (
  id UUID PRIMARY KEY,
  total_movies INTEGER NOT NULL DEFAULT 0,
  total_actors_created INTEGER NOT NULL DEFAULT 0,
  total_translations_created INTEGER NOT NULL DEFAULT 0,
  total_links_created INTEGER NOT NULL DEFAULT 0,
  total_ai_translations INTEGER NOT NULL DEFAULT 0,
  error_messages TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Add comments for better documentation
COMMENT ON TABLE enrich_actor_logs IS 'Logs for the actor enrichment process from TMDB';
COMMENT ON COLUMN enrich_actor_logs.id IS 'Unique identifier for each run';
COMMENT ON COLUMN enrich_actor_logs.total_movies IS 'Number of movies processed';
COMMENT ON COLUMN enrich_actor_logs.total_actors_created IS 'Number of actors created';
COMMENT ON COLUMN enrich_actor_logs.total_translations_created IS 'Number of translations created';
COMMENT ON COLUMN enrich_actor_logs.total_links_created IS 'Number of movie-actor links created';
COMMENT ON COLUMN enrich_actor_logs.total_ai_translations IS 'Number of AI-generated Hebrew translations';
COMMENT ON COLUMN enrich_actor_logs.error_messages IS 'Pipe-separated list of error messages';

-- Check if actors table exists and create it if not
CREATE TABLE IF NOT EXISTS actors (
  id UUID PRIMARY KEY,
  themoviedb_id INTEGER UNIQUE,
  birth_date DATE,
  birth_place TEXT,
  photo_url TEXT,
  slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Add slug field to actors table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'actors' AND column_name = 'slug'
  ) THEN
    ALTER TABLE actors ADD COLUMN slug TEXT;
  END IF;
END
$$;

-- Ensure slug is unique
CREATE UNIQUE INDEX IF NOT EXISTS actors_slug_idx ON actors (slug) WHERE slug IS NOT NULL;

-- Add comments for actors table
COMMENT ON TABLE actors IS 'Actors information from TMDB';
COMMENT ON COLUMN actors.id IS 'Unique identifier for each actor';
COMMENT ON COLUMN actors.themoviedb_id IS 'TMDB ID for the actor';
COMMENT ON COLUMN actors.birth_date IS 'Actor birth date';
COMMENT ON COLUMN actors.birth_place IS 'Actor birth place';
COMMENT ON COLUMN actors.photo_url IS 'URL to actor photo';
COMMENT ON COLUMN actors.slug IS 'URL-friendly version of actor name for SEO';

-- RLS policy - only allow admins to access logs table
ALTER TABLE enrich_actor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins full access to logs" 
  ON enrich_actor_logs
  USING (auth.uid() IN (
    SELECT auth.uid FROM auth.users WHERE auth.email() IN (
      SELECT email FROM admin_list
    )
  )); 