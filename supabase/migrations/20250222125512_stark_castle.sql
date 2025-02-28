/*
  # Fix Database Tables

  1. Videos Table
    - Create videos table for storing movie trailers and clips
    - Add proper indexes and RLS policies
    - Include sample data for existing movies

  2. Movie Awards
    - Fix movie awards query structure
    - Add proper indexes and constraints
*/

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  type text NOT NULL DEFAULT 'trailer',
  language text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for videos
CREATE INDEX idx_videos_movie_id ON videos(movie_id);
CREATE INDEX idx_videos_type ON videos(type);

-- Enable RLS for videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies for videos
CREATE POLICY "Allow public read access on videos"
ON videos FOR SELECT
TO public
USING (true);

-- Create trigger for videos updated_at
CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add sample videos data
INSERT INTO videos (movie_id, title, url, type, language)
SELECT 
  m.id,
  CASE 
    WHEN m.slug = 'waltz-with-bashir' THEN 'Waltz with Bashir - Official Trailer'
    WHEN m.slug = 'big-bad-wolves' THEN 'Big Bad Wolves - Official Trailer'
    WHEN m.slug = 'footnote' THEN 'Footnote - Official Trailer'
    WHEN m.slug = 'image-of-victory' THEN 'Image of Victory - Official Trailer'
    WHEN m.slug = 'here-we-are' THEN 'Here We Are - Official Trailer'
    WHEN m.slug = 'cinema-sabaya' THEN 'Cinema Sabaya - Official Trailer'
    ELSE m.title || ' - Official Trailer'
  END,
  CASE 
    WHEN m.slug = 'waltz-with-bashir' THEN 'https://www.youtube.com/embed/ylzO9vbEpPg'
    WHEN m.slug = 'big-bad-wolves' THEN 'https://www.youtube.com/embed/GsfzhiW5l8c'
    WHEN m.slug = 'footnote' THEN 'https://www.youtube.com/embed/Vy9LKLzzXZc'
    WHEN m.slug = 'image-of-victory' THEN 'https://www.youtube.com/embed/Y9X2HvPUqRY'
    WHEN m.slug = 'here-we-are' THEN 'https://www.youtube.com/embed/KNXxrGJVqDc'
    WHEN m.slug = 'cinema-sabaya' THEN 'https://www.youtube.com/embed/8EuV7cFJ_BE'
    ELSE 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  END,
  'trailer',
  CASE 
    WHEN m.hebrew_title IS NOT NULL THEN 'Hebrew'
    ELSE 'English'
  END
FROM movies m;

-- Fix movie awards query
DROP TABLE IF EXISTS movie_awards CASCADE;

CREATE TABLE movie_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  year integer NOT NULL,
  is_winner boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for movie awards
CREATE INDEX idx_movie_awards_movie_id ON movie_awards(movie_id);
CREATE INDEX idx_movie_awards_year ON movie_awards(year);

-- Enable RLS for movie awards
ALTER TABLE movie_awards ENABLE ROW LEVEL SECURITY;

-- Create policies for movie awards
CREATE POLICY "Allow public read access on movie_awards"
ON movie_awards FOR SELECT
TO public
USING (true);

-- Create trigger for movie awards updated_at
CREATE TRIGGER update_movie_awards_updated_at
    BEFORE UPDATE ON movie_awards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add sample awards data
INSERT INTO movie_awards (movie_id, name, category, year, is_winner)
SELECT 
  m.id,
  'Ophir Award',
  'Best Picture',
  EXTRACT(YEAR FROM m.release_date)::integer,
  true
FROM movies m
WHERE m.slug IN ('waltz-with-bashir', 'big-bad-wolves', 'footnote');