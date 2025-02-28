/*
  # Connect All Movies to Appropriate Genres

  1. Purpose:
    - Ensure all movies are connected to appropriate genres
    - Create comprehensive movie-genre relationships
*/

-- Connect movies to their primary and secondary genres
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.id, g.id
FROM movies m, genres g
WHERE 
  -- Drama movies
  (g.slug = 'drama' AND m.slug IN (
    'waltz-with-bashir',
    'here-we-are',
    'cinema-sabaya',
    'big-bad-wolves',
    'love-in-tel-aviv'
  ))
  OR
  -- Action movies
  (g.slug = 'action' AND m.slug IN (
    'flight-risk',
    'the-last-mission',
    'desert-storm',
    'night-watch',
    'urban-combat'
  ))
  OR
  -- Thriller movies
  (g.slug = 'thriller' AND m.slug IN (
    'flight-risk',
    'big-bad-wolves',
    'night-watch',
    'urban-combat'
  ))
  OR
  -- War movies
  (g.slug = 'war' AND m.slug IN (
    'waltz-with-bashir',
    'the-last-mission',
    'image-of-victory'
  ))
  OR
  -- Documentary movies
  (g.slug = 'documentary' AND m.slug IN (
    'waltz-with-bashir',
    'cinema-sabaya'
  ))
  OR
  -- Romance movies
  (g.slug = 'romance' AND m.slug IN (
    'love-in-tel-aviv',
    'companion'
  ))
  OR
  -- Family movies
  (g.slug = 'family' AND m.slug IN (
    'here-we-are',
    'companion'
  ))
AND NOT EXISTS (
    SELECT 1 FROM movie_genres mg 
    WHERE mg.movie_id = m.id AND mg.genre_id = g.id
);
