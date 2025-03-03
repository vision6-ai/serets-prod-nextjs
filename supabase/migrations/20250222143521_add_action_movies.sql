/*
  # Add Action Movies and Genre Relationships

  1. Purpose:
    - Add action movies to the database
    - Connect movies to the Action genre
*/

-- First, ensure we have the action genre
INSERT INTO genres (name, hebrew_name, slug)
SELECT 'Action', 'אקשן', 'action'
WHERE NOT EXISTS (
    SELECT 1 FROM genres WHERE slug = 'action'
);

-- Add some action movies if they don't exist
INSERT INTO movies (title, hebrew_title, slug, synopsis, release_date, duration, rating, poster_url)
SELECT * FROM (VALUES
    (
        'Desert Storm',
        'סופת מדבר',
        'desert-storm',
        'An elite unit must navigate through a dangerous desert mission while being pursued by enemy forces.',
        '2023-08-15',
        120,
        7.8,
        'https://example.com/posters/desert-storm.jpg'
    ),
    (
        'Night Watch',
        'שומר הלילה',
        'night-watch',
        'A former special forces operative takes on a night security job, only to uncover a massive conspiracy.',
        '2023-06-20',
        115,
        7.5,
        'https://example.com/posters/night-watch.jpg'
    ),
    (
        'Urban Combat',
        'קרב עירוני',
        'urban-combat',
        'When terrorists take over a building in Tel Aviv, one cop must fight his way to the top floor.',
        '2023-09-10',
        105,
        8.0,
        'https://example.com/posters/urban-combat.jpg'
    )
) AS new_movies (title, hebrew_title, slug, synopsis, release_date, duration, rating, poster_url)
WHERE NOT EXISTS (
    SELECT 1 FROM movies WHERE slug = new_movies.slug
);

-- Connect movies to the action genre
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.id, g.id
FROM movies m, genres g
WHERE g.slug = 'action'
AND m.slug IN ('desert-storm', 'night-watch', 'urban-combat', 'flight-risk')
AND NOT EXISTS (
    SELECT 1 FROM movie_genres mg 
    WHERE mg.movie_id = m.id AND mg.genre_id = g.id
);

-- Also add thriller as a secondary genre for some action movies
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.id, g.id
FROM movies m, genres g
WHERE g.slug = 'thriller'
AND m.slug IN ('night-watch', 'urban-combat')
AND NOT EXISTS (
    SELECT 1 FROM movie_genres mg 
    WHERE mg.movie_id = m.id AND mg.genre_id = g.id
);
