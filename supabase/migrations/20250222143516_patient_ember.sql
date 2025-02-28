/*
  # Add movie-genre relationships

  1. Changes
    - Add relationships between existing movies and genres
    - Ensures each movie has at least one genre
  
  2. Data
    - Links movies to appropriate genres based on their content
*/

-- Add movie-genre relationships
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.id, g.id
FROM movies m, genres g
WHERE m.slug = 'waltz-with-bashir' AND g.slug IN ('documentary', 'war')
UNION
SELECT m.id, g.id
FROM movies m, genres g
WHERE m.slug = 'big-bad-wolves' AND g.slug IN ('thriller', 'drama')
UNION
SELECT m.id, g.id
FROM movies m, genres g
WHERE m.slug = 'footnote' AND g.slug IN ('drama')
UNION
SELECT m.id, g.id
FROM movies m, genres g
WHERE m.slug = 'image-of-victory' AND g.slug IN ('drama', 'war')
UNION
SELECT m.id, g.id
FROM movies m, genres g
WHERE m.slug = 'here-we-are' AND g.slug IN ('drama', 'family')
UNION
SELECT m.id, g.id
FROM movies m, genres g
WHERE m.slug = 'cinema-sabaya' AND g.slug IN ('drama', 'documentary');