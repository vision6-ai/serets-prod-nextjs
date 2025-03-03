/*
  # Fix movie awards tables and relationships

  1. Changes
    - Drop and recreate movie_awards table with proper constraints
    - Add sample awards data
    - Add sample movie awards data
  
  2. Security
    - Enable RLS on awards table
    - Add policies for public read access
*/

-- Recreate awards table
DROP TABLE IF EXISTS movie_awards;
DROP TABLE IF EXISTS awards;

CREATE TABLE awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hebrew_name text,
  slug text UNIQUE NOT NULL,
  year integer NOT NULL,
  category text NOT NULL,
  description text
);

-- Recreate movie_awards table with proper constraints
CREATE TABLE movie_awards (
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  award_id uuid REFERENCES awards(id) ON DELETE CASCADE,
  year integer NOT NULL,
  is_winner boolean DEFAULT false,
  PRIMARY KEY (movie_id, award_id, year)
);

-- Create indexes
CREATE INDEX idx_movie_awards_movie_year ON movie_awards(movie_id, year);
CREATE INDEX idx_awards_name ON awards(name);
CREATE INDEX idx_awards_slug ON awards(slug);

-- Enable RLS
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_awards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on awards"
ON awards FOR SELECT TO public
USING (true);

CREATE POLICY "Allow public read access on movie_awards"
ON movie_awards FOR SELECT TO public
USING (true);

-- Add sample awards
INSERT INTO awards (name, hebrew_name, slug, year, category, description) VALUES
  (
    'Ophir Award',
    'פרס אופיר',
    'ophir-award-best-picture',
    2023,
    'Best Picture',
    'The Israeli Academy of Film and Television''s highest honor for motion pictures'
  ),
  (
    'Jerusalem Film Festival Award',
    'פרס פסטיבל הקולנוע ירושלים',
    'jerusalem-film-festival-best-israeli-feature',
    2023,
    'Best Israeli Feature',
    'Top prize at the Jerusalem Film Festival'
  );

-- Add sample movie awards (will only work if movies exist)
INSERT INTO movie_awards (movie_id, award_id, year, is_winner)
SELECT 
  m.id,
  a.id,
  2023,
  true
FROM 
  movies m,
  awards a
WHERE 
  m.slug = 'waltz-with-bashir' 
  AND a.slug = 'ophir-award-best-picture';