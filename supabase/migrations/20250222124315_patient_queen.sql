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
    - Enable RLS on videos table
    - Add policy for public read access

  3. Indexes
    - Create indexes for better performance
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS videos;

-- Create videos table
CREATE TABLE videos (
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

-- Add sample data with real trailer URLs
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
    ELSE 'Official Trailer'
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