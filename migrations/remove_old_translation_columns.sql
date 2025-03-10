-- Remove old translation columns from actors table
ALTER TABLE actors
DROP COLUMN IF EXISTS hebrew_name;

-- Remove old translation columns from genres table
ALTER TABLE genres
DROP COLUMN IF EXISTS hebrew_name;

-- Remove old translation columns from movies table
ALTER TABLE movies
DROP COLUMN IF EXISTS hebrew_title;

-- Note: This migration only removes the old columns
-- The translation tables (movie_translations, actor_translations, genre_translations) remain unchanged
