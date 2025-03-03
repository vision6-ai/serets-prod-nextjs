/*
  # Fix movie awards relationship and add indexes

  1. Changes
    - Add foreign key relationship between movie_awards and awards table
    - Add indexes for better query performance
    - Add missing columns to awards table
  
  2. Indexes
    - Add index on movie_awards(movie_id, year)
    - Add index on awards(name)
*/

-- Add missing columns to awards table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'awards' AND column_name = 'slug'
  ) THEN
    ALTER TABLE awards ADD COLUMN slug text UNIQUE;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movie_awards_movie_year ON movie_awards(movie_id, year);
CREATE INDEX IF NOT EXISTS idx_awards_name ON awards(name);

-- Fix the relationship between movie_awards and awards
ALTER TABLE movie_awards
DROP CONSTRAINT IF EXISTS movie_awards_award_id_fkey,
ADD CONSTRAINT movie_awards_award_id_fkey 
FOREIGN KEY (award_id) 
REFERENCES awards(id) 
ON DELETE CASCADE;