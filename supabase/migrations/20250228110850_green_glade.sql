/*
  # Create videos table for Cloudflare Stream integration

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `movie_id` (uuid, foreign key to movies)
      - `title` (text)
      - `type` (text) - e.g., 'trailer', 'clip', etc.
      - `language` (text)
      - `cloudflare_id` (text) - Cloudflare Stream video ID
      - `cloudflare_status` (text) - Video processing status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for public read access
    - Add indexes for performance

  3. Relationships
    - Foreign key to movies table
*/

-- Create videos table
CREATE TABLE videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'trailer',
  language text,
  cloudflare_id text,
  cloudflare_status text DEFAULT 'pending'
    CHECK (cloudflare_status IN ('pending', 'ready', 'error')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_videos_movie_id ON videos(movie_id);
CREATE INDEX idx_videos_type ON videos(type);
CREATE INDEX idx_videos_cloudflare_id ON videos(cloudflare_id);
CREATE INDEX idx_videos_cloudflare_status ON videos(cloudflare_status);

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

-- Add sample data for testing
INSERT INTO videos (movie_id, title, type, language, cloudflare_id, cloudflare_status)
SELECT 
  m.id,
  m.title || ' - Official Trailer',
  'trailer',
  CASE WHEN m.hebrew_title IS NOT NULL THEN 'Hebrew' ELSE 'English' END,
  '31c9291def39e0029dc71f654d655346', -- Test video ID
  'ready'
FROM movies m
WHERE m.slug IN ('waltz-with-bashir', 'big-bad-wolves', 'footnote')
LIMIT 3;