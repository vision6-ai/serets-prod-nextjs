/*
  # Add video trailers support

  1. Changes
    - Add `videos` table to store multiple trailers per movie
    - Add RLS policies for public read access
    - Add indexes for better performance

  2. Security
    - Enable RLS on videos table
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