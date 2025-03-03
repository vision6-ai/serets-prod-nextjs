/*
  # Add Movie-Genre Relationships

  1. Purpose:
    - Connect movies to their respective genres
    - Ensure Action genre has associated movies
    - Add relationships for other genres
*/

-- First, let's get the genre IDs
DO $$
DECLARE
    action_id uuid;
    drama_id uuid;
    thriller_id uuid;
    war_id uuid;
BEGIN
    -- Get genre IDs
    SELECT id INTO action_id FROM genres WHERE slug = 'action';
    SELECT id INTO drama_id FROM genres WHERE slug = 'drama';
    SELECT id INTO thriller_id FROM genres WHERE slug = 'thriller';
    SELECT id INTO war_id FROM genres WHERE slug = 'war';

    -- Add movie-genre relationships
    INSERT INTO movie_genres (movie_id, genre_id)
    SELECT m.id, action_id
    FROM movies m
    WHERE m.slug IN ('flight-risk', 'the-last-mission')
    AND NOT EXISTS (
        SELECT 1 FROM movie_genres mg 
        WHERE mg.movie_id = m.id AND mg.genre_id = action_id
    );

    -- Add thriller genre relationships
    INSERT INTO movie_genres (movie_id, genre_id)
    SELECT m.id, thriller_id
    FROM movies m
    WHERE m.slug IN ('flight-risk', 'big-bad-wolves')
    AND NOT EXISTS (
        SELECT 1 FROM movie_genres mg 
        WHERE mg.movie_id = m.id AND mg.genre_id = thriller_id
    );

    -- Add drama genre relationships
    INSERT INTO movie_genres (movie_id, genre_id)
    SELECT m.id, drama_id
    FROM movies m
    WHERE m.slug IN ('waltz-with-bashir', 'here-we-are', 'cinema-sabaya')
    AND NOT EXISTS (
        SELECT 1 FROM movie_genres mg 
        WHERE mg.movie_id = m.id AND mg.genre_id = drama_id
    );

    -- Add war genre relationships
    INSERT INTO movie_genres (movie_id, genre_id)
    SELECT m.id, war_id
    FROM movies m
    WHERE m.slug IN ('waltz-with-bashir', 'the-last-mission', 'image-of-victory')
    AND NOT EXISTS (
        SELECT 1 FROM movie_genres mg 
        WHERE mg.movie_id = m.id AND mg.genre_id = war_id
    );

END $$;
