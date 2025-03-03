/*
  # Fix awards tables and relationships

  1. Changes
    - Drop and recreate awards and movie_awards tables
    - Add proper constraints and indexes
    - Add sample data
  
  2. Security
    - Enable RLS
    - Add policies for public read access
*/

-- Drop existing tables to ensure clean slate
DROP TABLE IF EXISTS movie_awards CASCADE;
DROP TABLE IF EXISTS awards CASCADE;

-- Create awards table
CREATE TABLE awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hebrew_name text,
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create movie_awards junction table
CREATE TABLE movie_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  award_id uuid REFERENCES awards(id) ON DELETE CASCADE,
  year integer NOT NULL,
  is_winner boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(movie_id, award_id, year)
);

-- Create indexes for better performance
CREATE INDEX idx_movie_awards_movie_id ON movie_awards(movie_id);
CREATE INDEX idx_movie_awards_award_id ON movie_awards(award_id);
CREATE INDEX idx_movie_awards_year ON movie_awards(year);
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

-- Create trigger for updated_at
CREATE TRIGGER update_awards_updated_at
    BEFORE UPDATE ON awards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movie_awards_updated_at
    BEFORE UPDATE ON movie_awards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add sample awards
INSERT INTO awards (name, hebrew_name, slug, category, description) VALUES
  (
    'Ophir Award',
    'פרס אופיר',
    'ophir-award-best-picture',
    'Best Picture',
    'The Israeli Academy of Film and Television''s highest honor for motion pictures'
  ),
  (
    'Jerusalem Film Festival Award',
    'פרס פסטיבל הקולנוע ירושלים',
    'jerusalem-film-festival-best-israeli-feature',
    'Best Israeli Feature',
    'Top prize at the Jerusalem Film Festival'
  ),
  (
    'Israeli Film Academy Award',
    'פרס האקדמיה הישראלית לקולנוע',
    'israeli-film-academy-best-director',
    'Best Director',
    'Annual award for excellence in film directing'
  );

-- Add sample movie awards
INSERT INTO movie_awards (movie_id, award_id, year, is_winner)
SELECT 
  m.id,
  a.id,
  EXTRACT(YEAR FROM m.release_date),
  true
FROM 
  movies m
  CROSS JOIN awards a
WHERE 
  m.slug IN ('waltz-with-bashir', 'big-bad-wolves')
  AND a.slug = 'ophir-award-best-picture';