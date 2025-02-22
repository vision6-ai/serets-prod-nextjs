/*
  # Add Movie-Genre Relationships

  1. Purpose:
    - Connect existing movies to genres
    - Ensure each movie has at least one genre
    - Add more sample movies with genre relationships
*/

-- Add more movies first
INSERT INTO movies (title, hebrew_title, slug, synopsis, release_date, duration, rating, poster_url) VALUES
  (
    'Flight Risk',
    'טיסה מסוכנת',
    'flight-risk',
    'A thrilling action movie about a dangerous flight mission.',
    '2023-08-15',
    115,
    7.5,
    'https://example.com/posters/flight-risk.jpg'
  ),
  (
    'Love in Tel Aviv',
    'אהבה בתל אביב',
    'love-in-tel-aviv',
    'A romantic comedy set in the vibrant city of Tel Aviv.',
    '2023-06-20',
    98,
    8.0,
    'https://example.com/posters/love-in-tel-aviv.jpg'
  ),
  (
    'The Last Mission',
    'המשימה האחרונה',
    'the-last-mission',
    'A war drama about a group of soldiers on their final mission.',
    '2023-09-10',
    135,
    8.2,
    'https://example.com/posters/the-last-mission.jpg'
  );

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

-- Add SEO metadata for new movies
INSERT INTO seo_meta (content_type, content_id, meta_title, meta_description, keywords)
SELECT 
  'movie',
  m.id,
  m.title || ' (' || m.hebrew_title || ') - Israeli Movie Hub',
  'Watch ' || m.title || ', a powerful Israeli film from ' || EXTRACT(YEAR FROM m.release_date) || '. Full movie details, cast, and reviews.',
  ARRAY['Israeli movies', 'Israeli cinema', m.title, m.hebrew_title, EXTRACT(YEAR FROM m.release_date)::text || ' movies']
FROM movies m
WHERE m.slug IN ('flight-risk', 'love-in-tel-aviv', 'the-last-mission');
