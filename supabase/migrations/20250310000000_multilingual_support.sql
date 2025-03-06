/*
  # Multi-Language Support Migration

  This migration adds support for multiple languages in the database by:
  1. Creating translation tables for movies, actors, and genres
  2. Migrating existing Hebrew content to the new translation tables
  3. Setting up appropriate indexes and relationships
  4. Maintaining backward compatibility during the transition
*/

-- Create languages table to store supported languages
CREATE TABLE IF NOT EXISTS languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'ltr',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);

-- Insert default languages
INSERT INTO languages (code, name, native_name, direction, is_default, is_active)
VALUES 
  ('en', 'English', 'English', 'ltr', true, true),
  ('he', 'Hebrew', 'עברית', 'rtl', false, true);

-- Create movie_translations table
CREATE TABLE IF NOT EXISTS movie_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  language_code TEXT REFERENCES languages(code) ON DELETE CASCADE,
  title TEXT NOT NULL,
  synopsis TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(movie_id, language_code)
);

-- Create actor_translations table
CREATE TABLE IF NOT EXISTS actor_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES actors(id) ON DELETE CASCADE,
  language_code TEXT REFERENCES languages(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  biography TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(actor_id, language_code)
);

-- Create genre_translations table
CREATE TABLE IF NOT EXISTS genre_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
  language_code TEXT REFERENCES languages(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(genre_id, language_code)
);

-- Create award_translations table
CREATE TABLE IF NOT EXISTS award_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id UUID REFERENCES awards(id) ON DELETE CASCADE,
  language_code TEXT REFERENCES languages(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(award_id, language_code)
);

-- Create seo_meta_translations table
CREATE TABLE IF NOT EXISTS seo_meta_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seo_meta_id UUID REFERENCES seo_meta(id) ON DELETE CASCADE,
  language_code TEXT REFERENCES languages(code) ON DELETE CASCADE,
  meta_title TEXT,
  meta_description TEXT,
  og_title TEXT,
  og_description TEXT,
  keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(seo_meta_id, language_code)
);

-- Migrate existing Hebrew titles to movie_translations
INSERT INTO movie_translations (movie_id, language_code, title, synopsis)
SELECT 
  id, 
  'he', 
  hebrew_title, 
  synopsis
FROM movies
WHERE hebrew_title IS NOT NULL;

-- Migrate existing English titles to movie_translations
INSERT INTO movie_translations (movie_id, language_code, title, synopsis)
SELECT 
  id, 
  'en', 
  title, 
  synopsis
FROM movies;

-- Migrate existing Hebrew names to actor_translations
INSERT INTO actor_translations (actor_id, language_code, name, biography)
SELECT 
  id, 
  'he', 
  hebrew_name, 
  biography
FROM actors
WHERE hebrew_name IS NOT NULL;

-- Migrate existing English names to actor_translations
INSERT INTO actor_translations (actor_id, language_code, name, biography)
SELECT 
  id, 
  'en', 
  name, 
  biography
FROM actors;

-- Migrate existing Hebrew genre names to genre_translations
INSERT INTO genre_translations (genre_id, language_code, name)
SELECT 
  id, 
  'he', 
  hebrew_name
FROM genres
WHERE hebrew_name IS NOT NULL;

-- Migrate existing English genre names to genre_translations
INSERT INTO genre_translations (genre_id, language_code, name)
SELECT 
  id, 
  'en', 
  name
FROM genres;

-- Migrate existing Hebrew award names to award_translations
INSERT INTO award_translations (award_id, language_code, name, description)
SELECT 
  id, 
  'he', 
  hebrew_name, 
  description
FROM awards
WHERE hebrew_name IS NOT NULL;

-- Migrate existing English award names to award_translations
INSERT INTO award_translations (award_id, language_code, name, description)
SELECT 
  id, 
  'en', 
  name, 
  description
FROM awards;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movie_translations_movie_id ON movie_translations(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_translations_language ON movie_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_actor_translations_actor_id ON actor_translations(actor_id);
CREATE INDEX IF NOT EXISTS idx_actor_translations_language ON actor_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_genre_translations_genre_id ON genre_translations(genre_id);
CREATE INDEX IF NOT EXISTS idx_genre_translations_language ON genre_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_award_translations_award_id ON award_translations(award_id);
CREATE INDEX IF NOT EXISTS idx_award_translations_language ON award_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_seo_meta_translations_seo_meta_id ON seo_meta_translations(seo_meta_id);
CREATE INDEX IF NOT EXISTS idx_seo_meta_translations_language ON seo_meta_translations(language_code);

-- Enable Row Level Security
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE actor_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_meta_translations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on languages" ON languages FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on movie_translations" ON movie_translations FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on actor_translations" ON actor_translations FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on genre_translations" ON genre_translations FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on award_translations" ON award_translations FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on seo_meta_translations" ON seo_meta_translations FOR SELECT TO public USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_movie_translations_updated_at
    BEFORE UPDATE ON movie_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actor_translations_updated_at
    BEFORE UPDATE ON actor_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genre_translations_updated_at
    BEFORE UPDATE ON genre_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_award_translations_updated_at
    BEFORE UPDATE ON award_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_meta_translations_updated_at
    BEFORE UPDATE ON seo_meta_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create views for backward compatibility
CREATE OR REPLACE VIEW movies_with_translations AS
SELECT 
  m.*,
  en_trans.title,
  he_trans.title as hebrew_title,
  en_trans.synopsis
FROM 
  movies m
LEFT JOIN 
  movie_translations en_trans ON m.id = en_trans.movie_id AND en_trans.language_code = 'en'
LEFT JOIN 
  movie_translations he_trans ON m.id = he_trans.movie_id AND he_trans.language_code = 'he';

CREATE OR REPLACE VIEW actors_with_translations AS
SELECT 
  a.*,
  en_trans.name,
  he_trans.name as hebrew_name,
  en_trans.biography
FROM 
  actors a
LEFT JOIN 
  actor_translations en_trans ON a.id = en_trans.actor_id AND en_trans.language_code = 'en'
LEFT JOIN 
  actor_translations he_trans ON a.id = he_trans.actor_id AND he_trans.language_code = 'he';

CREATE OR REPLACE VIEW genres_with_translations AS
SELECT 
  g.*,
  en_trans.name,
  he_trans.name as hebrew_name
FROM 
  genres g
LEFT JOIN 
  genre_translations en_trans ON g.id = en_trans.genre_id AND en_trans.language_code = 'en'
LEFT JOIN 
  genre_translations he_trans ON g.id = he_trans.genre_id AND he_trans.language_code = 'he';

-- Note: We're not dropping the original columns yet to maintain backward compatibility
-- This will be done in a future migration after the application is updated 