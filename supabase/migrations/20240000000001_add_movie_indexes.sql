-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies (release_date DESC);
CREATE INDEX IF NOT EXISTS idx_movies_rating ON movies (rating DESC);
CREATE INDEX IF NOT EXISTS idx_movie_translations_language_code ON movie_translations (language_code);
CREATE INDEX IF NOT EXISTS idx_movie_translations_movie_id_language ON movie_translations (movie_id, language_code);

-- Add indexes for the movie_genres join table
CREATE INDEX IF NOT EXISTS idx_movie_genres_movie_id ON movie_genres (movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_genres_genre_id ON movie_genres (genre_id);

-- Add a composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_movies_release_date_rating ON movies (release_date DESC, rating DESC);

-- Add index for the slug since we use it in URLs
CREATE INDEX IF NOT EXISTS idx_movies_slug ON movies (slug);
