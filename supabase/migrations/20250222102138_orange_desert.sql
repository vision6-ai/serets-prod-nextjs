/*
  # Add More Recent Israeli Movies and Actors

  1. New Content Added:
    - Recent Israeli movies (2020-2024)
    - Contemporary Israeli actors
    - Additional genres
    - More movie-actor relationships
    - Awards from recent years

  2. Purpose:
    - Expand the sample dataset with current content
    - Add more variety to test filtering and search
    - Include recent award winners
*/

-- Add more genres
INSERT INTO genres (name, hebrew_name, slug) VALUES
  ('Action', 'אקשן', 'action'),
  ('Romance', 'רומנטיקה', 'romance'),
  ('War', 'מלחמה', 'war'),
  ('Family', 'משפחה', 'family');

-- Add more actors
INSERT INTO actors (name, hebrew_name, slug, biography, birth_date, birth_place, photo_url) VALUES
  (
    'Shira Haas',
    'שירה האס',
    'shira-haas',
    'Shira Haas is an Israeli actress. She gained international recognition for her role in the Netflix miniseries Unorthodox, for which she received an Emmy Award nomination.',
    '1995-05-11',
    'Tel Aviv, Israel',
    'https://example.com/photos/shira-haas.jpg'
  ),
  (
    'Moshe Ivgy',
    'משה איבגי',
    'moshe-ivgy',
    'Moshe Ivgy is a veteran Israeli actor known for his diverse roles in both drama and comedy. He has won multiple Israeli Academy Awards.',
    '1953-11-29',
    'Casablanca, Morocco',
    'https://example.com/photos/moshe-ivgy.jpg'
  );

-- Add recent movies
INSERT INTO movies (title, hebrew_title, slug, synopsis, release_date, duration, rating, trailer_url, poster_url) VALUES
  (
    'Image of Victory',
    'תמונת ניצחון',
    'image-of-victory',
    'Set in 1948, this war drama tells the story of an Egyptian filmmaker tasked with documenting a raid on an isolated Israeli kibbutz, leading to unexpected consequences.',
    '2021-07-08',
    128,
    7.2,
    'https://example.com/trailers/image-of-victory.mp4',
    'https://example.com/posters/image-of-victory.jpg'
  ),
  (
    'Here We Are',
    'הנה אנחנו',
    'here-we-are',
    'A touching drama about a father who refuses to let his autistic son move into a specialized home, and instead takes him on a road trip across Israel.',
    '2020-09-10',
    94,
    7.8,
    'https://example.com/trailers/here-we-are.mp4',
    'https://example.com/posters/here-we-are.jpg'
  ),
  (
    'Cinema Sabaya',
    'סינמה סבאיא',
    'cinema-sabaya',
    'Nine women of different backgrounds attend a video workshop at a community center, learning about filmmaking and themselves.',
    '2022-07-21',
    91,
    7.5,
    'https://example.com/trailers/cinema-sabaya.mp4',
    'https://example.com/posters/cinema-sabaya.jpg'
  );

-- Add movie-actor relationships
INSERT INTO movie_actors (movie_id, actor_id, role) 
SELECT m.id, a.id, 'Supporting Actor'
FROM movies m, actors a
WHERE m.slug = 'here-we-are' AND a.slug = 'lior-ashkenazi'
UNION
SELECT m.id, a.id, 'Lead Actress'
FROM movies m, actors a
WHERE m.slug = 'cinema-sabaya' AND a.slug = 'shira-haas';

-- Add movie-genre relationships
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.id, g.id
FROM movies m, genres g
WHERE m.slug = 'image-of-victory' AND g.slug = 'war'
UNION
SELECT m.id, g.id
FROM movies m, genres g
WHERE m.slug = 'here-we-are' AND g.slug = 'drama'
UNION
SELECT m.id, g.id
FROM movies m, genres g
WHERE m.slug = 'cinema-sabaya' AND g.slug = 'drama';

-- Add recent awards
INSERT INTO awards (name, hebrew_name, year, category, description) VALUES
  (
    'Israeli Academy Award',
    'פרס אופיר',
    2022,
    'Best Picture',
    'The highest honor in Israeli cinema, awarded annually by the Israeli Academy of Film and Television'
  ),
  (
    'Jerusalem Film Festival Award',
    'פרס פסטיבל הקולנוע ירושלים',
    2021,
    'Best Israeli Feature',
    'Prestigious award given at the Jerusalem Film Festival to outstanding Israeli films'
  );

-- Add movie awards
INSERT INTO movie_awards (movie_id, award_id, year, is_winner)
SELECT m.id, a.id, 2022, true
FROM movies m, awards a
WHERE m.slug = 'cinema-sabaya' AND a.name = 'Israeli Academy Award';

-- Add SEO metadata for new movies
INSERT INTO seo_meta (content_type, content_id, meta_title, meta_description, keywords)
SELECT 
  'movie',
  m.id,
  m.title || ' (' || m.hebrew_title || ') - Israeli Movie Hub',
  'Watch ' || m.title || ', a powerful Israeli film from ' || EXTRACT(YEAR FROM m.release_date) || '. Full movie details, cast, and reviews.',
  ARRAY['Israeli movies', 'Israeli cinema', m.title, m.hebrew_title, EXTRACT(YEAR FROM m.release_date)::text || ' movies']
FROM movies m
WHERE m.slug IN ('image-of-victory', 'here-we-are', 'cinema-sabaya');