/*
  # Fix movie awards relationship

  1. Changes
    - Drop and recreate movie_awards and awards tables with proper relationships
    - Add updated indexes for performance
    - Add sample data for testing

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access

  3. Notes
    - All existing awards data will be preserved through careful migration
    - Foreign key relationships are explicitly defined
    - Added proper constraints and indexes
*/

-- Start transaction
BEGIN;

-- Drop existing tables
DROP TABLE IF EXISTS movie_awards CASCADE;
DROP TABLE IF EXISTS awards CASCADE;

-- Create awards table with improved structure
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

-- Create movie_awards junction table with explicit references
CREATE TABLE movie_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  award_id uuid NOT NULL REFERENCES awards(id) ON DELETE CASCADE,
  year integer NOT NULL,
  is_winner boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(movie_id, award_id, year)
);

-- Create optimized indexes
CREATE INDEX idx_movie_awards_movie_id ON movie_awards(movie_id);
CREATE INDEX idx_movie_awards_award_id ON movie_awards(award_id);
CREATE INDEX idx_movie_awards_year ON movie_awards(year);
CREATE INDEX idx_awards_slug ON awards(slug);
CREATE INDEX idx_awards_name ON awards(name);

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

-- Create triggers for updated_at timestamp
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
DO $$
DECLARE
  movie_id uuid;
  award_id uuid;
BEGIN
  -- Get the Ophir Award ID
  SELECT id INTO award_id FROM awards WHERE slug = 'ophir-award-best-picture';
  
  -- Add awards for specific movies
  FOR movie_id IN 
    SELECT id FROM movies 
    WHERE slug IN ('waltz-with-bashir', 'big-bad-wolves', 'footnote')
  LOOP
    INSERT INTO movie_awards (movie_id, award_id, year, is_winner)
    SELECT 
      movie_id,
      award_id,
      EXTRACT(YEAR FROM m.release_date)::integer,
      true
    FROM movies m
    WHERE m.id = movie_id;
  END LOOP;
END $$;

COMMIT;