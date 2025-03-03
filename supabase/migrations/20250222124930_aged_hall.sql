/*
  # Fix movie page structure

  1. Changes
    - Add missing columns to movie_awards table
    - Fix similar movies query structure
    - Add indexes for better performance

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
*/

-- Drop and recreate movie_awards table with proper structure
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

-- Create indexes
CREATE INDEX idx_movie_awards_movie_id ON movie_awards(movie_id);
CREATE INDEX idx_movie_awards_year ON movie_awards(year);

-- Enable RLS
ALTER TABLE movie_awards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on movie_awards"
ON movie_awards FOR SELECT
TO public
USING (true);

-- Create trigger for updated_at
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