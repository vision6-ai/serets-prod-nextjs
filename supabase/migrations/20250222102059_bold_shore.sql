/*
  # Add Sample Data

  1. Sample Data Added:
    - Movies with Hebrew titles
    - Actors with biographies
    - Movie-Actor relationships
    - Genres
    - Movie-Genre relationships
    - Awards

  2. Purpose:
    - Provide initial content for testing
    - Demonstrate relationships between tables
    - Test bilingual support (English/Hebrew)
*/

-- Add sample genres
INSERT INTO genres (name, hebrew_name, slug) VALUES
  ('Drama', 'דרמה', 'drama'),
  ('Comedy', 'קומדיה', 'comedy'),
  ('Documentary', 'דוקומנטרי', 'documentary'),
  ('Thriller', 'מתח', 'thriller');

-- Add sample actors
INSERT INTO actors (name, hebrew_name, slug, biography, birth_date, birth_place, photo_url) VALUES
  (
    'Gal Gadot',
    'גל גדות',
    'gal-gadot',
    'Gal Gadot is an Israeli actress and model. She was crowned Miss Israel in 2004. She is known for portraying Wonder Woman in the DC Extended Universe.',
    '1985-04-30',
    'Petah Tikva, Israel',
    'https://example.com/photos/gal-gadot.jpg'
  ),
  (
    'Lior Ashkenazi',
    'ליאור אשכנזי',
    'lior-ashkenazi',
    'Lior Ashkenazi is an Israeli actor. He is one of Israel''s most acclaimed actors, known for his roles in Walk on Water and Big Bad Wolves.',
    '1969-12-28',
    'Ramat Gan, Israel',
    'https://example.com/photos/lior-ashkenazi.jpg'
  );

-- Add sample movies
INSERT INTO movies (title, hebrew_title, slug, synopsis, release_date, duration, rating, trailer_url, poster_url) VALUES
  (
    'Waltz with Bashir',
    'ואלס עם באשיר',
    'waltz-with-bashir',
    'An Israeli film director interviews fellow veterans of the 1982 invasion of Lebanon to reconstruct his own memories of his term of service in that conflict.',
    '2008-05-15',
    90,
    8.0,
    'https://example.com/trailers/waltz-with-bashir.mp4',
    'https://example.com/posters/waltz-with-bashir.jpg'
  ),
  (
    'Big Bad Wolves',
    'זאבים רעים',
    'big-bad-wolves',
    'A series of brutal murders puts the lives of three men on a collision course: The father of the latest victim now out for revenge, a vigilante police detective operating outside the boundaries of law, and the main suspect in the killings.',
    '2013-08-21',
    110,
    7.6,
    'https://example.com/trailers/big-bad-wolves.mp4',
    'https://example.com/posters/big-bad-wolves.jpg'
  );

-- Add movie-actor relationships
INSERT INTO movie_actors (movie_id, actor_id, role) 
SELECT m.id, a.id, 'Lead Actor'
FROM movies m, actors a
WHERE m.slug = 'big-bad-wolves' AND a.slug = 'lior-ashkenazi';

-- Add movie-genre relationships
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.id, g.id
FROM movies m, genres g
WHERE m.slug = 'waltz-with-bashir' AND g.slug = 'documentary'
UNION
SELECT m.id, g.id
FROM movies m, genres g
WHERE m.slug = 'big-bad-wolves' AND g.slug = 'thriller';

-- Add sample awards
INSERT INTO awards (name, hebrew_name, year, category, description) VALUES
  (
    'Ophir Award',
    'פרס אופיר',
    2013,
    'Best Actor',
    'The Ophir Award is an award for excellence in film, presented annually by the Israeli Academy of Film and Television'
  );

-- Add actor awards
INSERT INTO actor_awards (actor_id, award_id, year, is_winner)
SELECT a.id, aw.id, 2013, true
FROM actors a, awards aw
WHERE a.slug = 'lior-ashkenazi' AND aw.name = 'Ophir Award';

-- Add SEO metadata
INSERT INTO seo_meta (content_type, content_id, meta_title, meta_description, keywords)
SELECT 
  'movie',
  m.id,
  m.title || ' (' || m.hebrew_title || ') - Israeli Movie Hub',
  'Watch ' || m.title || ', a critically acclaimed Israeli film. Full movie details, cast, and reviews.',
  ARRAY['Israeli movies', 'Israeli cinema', m.title, m.hebrew_title]
FROM movies m
WHERE m.slug IN ('waltz-with-bashir', 'big-bad-wolves');