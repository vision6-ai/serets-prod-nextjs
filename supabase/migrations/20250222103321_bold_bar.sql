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

-- Temporarily store existing awards data
CREATE TEMPORARY TABLE temp_awards AS
SELECT * FROM awards;

CREATE TEMPORARY TABLE temp_movie_awards AS
SELECT * FROM movie_awards;

-- Drop existing tables
DROP TABLE IF EXISTS movie_awards CASCADE;
DROP TABLE IF EXISTS awards CASCADE;

-- Recreate awards table with improved structure
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

-- Recreate movie_awards junction table with explicit references
CREATE TABLE movie_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid NOT NULL,
  award_id uuid NOT NULL,
  year integer NOT NULL,
  is_winner boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT fk_award FOREIGN KEY (award_id) REFERENCES awards(id) ON DELETE CASCADE,
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

-- Restore awards data
INSERT INTO awards (
  id, name, hebrew_name, slug, category, description, 
  created_at, updated_at
)
SELECT 
  id, name, hebrew_name, slug, category, description,
  created_at, updated_at
FROM temp_awards;

-- Restore movie awards data
INSERT INTO movie_awards (
  id, movie_id, award_id, year, is_winner,
  created_at, updated_at
)
SELECT 
  id, movie_id, award_id, year, is_winner,
  created_at, updated_at
FROM temp_movie_awards;

-- Drop temporary tables
DROP TABLE temp_awards;
DROP TABLE temp_movie_awards;

-- Add sample awards if none exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM awards LIMIT 1) THEN
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
      EXTRACT(YEAR FROM m.release_date)::integer,
      true
    FROM 
      movies m
      CROSS JOIN awards a
    WHERE 
      m.slug IN ('waltz-with-bashir', 'big-bad-wolves', 'footnote')
      AND a.slug = 'ophir-award-best-picture';
  END IF;
END $$;

COMMIT;