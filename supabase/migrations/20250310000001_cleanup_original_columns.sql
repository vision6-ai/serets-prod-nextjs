/*
  # Cleanup Original Language Columns

  This migration removes the original language-specific columns after the application
  has been updated to use the new translation tables. This should only be applied
  after verifying that the application is fully using the new translation tables.
*/

-- Note: This migration should only be applied after the application has been updated
-- to use the new translation tables and views.

-- Drop original language columns from movies table
ALTER TABLE movies 
  DROP COLUMN IF EXISTS title,
  DROP COLUMN IF EXISTS hebrew_title,
  DROP COLUMN IF EXISTS synopsis;

-- Drop original language columns from actors table
ALTER TABLE actors 
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS hebrew_name,
  DROP COLUMN IF EXISTS biography;

-- Drop original language columns from genres table
ALTER TABLE genres 
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS hebrew_name;

-- Drop original language columns from awards table
ALTER TABLE awards 
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS hebrew_name,
  DROP COLUMN IF EXISTS description;

-- Update the views to ensure they still work after columns are dropped
CREATE OR REPLACE VIEW movies_with_translations AS
SELECT 
  m.id,
  m.slug,
  m.release_date,
  m.duration,
  m.rating,
  m.trailer_url,
  m.poster_url,
  m.created_at,
  m.updated_at,
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
  a.id,
  a.slug,
  a.birth_date,
  a.birth_place,
  a.photo_url,
  a.created_at,
  a.updated_at,
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
  g.id,
  g.slug,
  en_trans.name,
  he_trans.name as hebrew_name
FROM 
  genres g
LEFT JOIN 
  genre_translations en_trans ON g.id = en_trans.genre_id AND en_trans.language_code = 'en'
LEFT JOIN 
  genre_translations he_trans ON g.id = he_trans.genre_id AND he_trans.language_code = 'he'; 