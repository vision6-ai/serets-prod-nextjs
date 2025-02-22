/*
  # Add videos table

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `movie_id` (uuid, foreign key to movies)
      - `title` (text)
      - `url` (text)
      - `type` (text)
      - `language` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `videos` table
    - Add policy for public read access
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

-- Create indexes
CREATE INDEX idx_videos_movie_id ON videos(movie_id);
CREATE INDEX idx_videos_type ON videos(type);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on videos"
ON videos FOR SELECT
TO public
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add sample data
INSERT INTO videos (movie_id, title, url, type, language)
SELECT 
  m.id,
  'Official Trailer',
  'https://www.youtube.com/embed/dQw4w9WgXcQ', -- Placeholder URL
  'trailer',
  'Hebrew'
FROM movies m
WHERE m.slug IN ('waltz-with-bashir', 'big-bad-wolves', 'footnote');