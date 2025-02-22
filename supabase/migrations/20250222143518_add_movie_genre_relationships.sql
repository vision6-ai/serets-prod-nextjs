/*
  # Add Movie-Genre Relationships

  1. Purpose:
    - Connect existing movies to genres
    - Ensure each movie has at least one genre
*/

-- Connect movies to genres
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.id, g.id
FROM movies m, genres g
WHERE 
  (m.slug = 'flight-risk' AND g.slug IN ('action', 'thriller'))
  OR (m.slug = 'love-in-tel-aviv' AND g.slug IN ('romance', 'comedy'))
  OR (m.slug = 'the-last-mission' AND g.slug IN ('war', 'drama'))
  OR (m.slug = 'waltz-with-bashir' AND g.slug IN ('documentary', 'war', 'drama'))
  OR (m.slug = 'big-bad-wolves' AND g.slug IN ('thriller', 'drama'))
  OR (m.slug = 'here-we-are' AND g.slug IN ('drama', 'family'))
  OR (m.slug = 'cinema-sabaya' AND g.slug IN ('drama'))
  OR (m.slug = 'image-of-victory' AND g.slug IN ('war', 'drama'));
