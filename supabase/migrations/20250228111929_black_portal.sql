/*
  # Verify and update video records

  1. Changes
    - Update video records with proper Cloudflare IDs
    - Set status to 'ready' for existing videos
    - Add missing columns if needed

  2. Security
    - Maintains existing RLS policies
    - No destructive operations
*/

-- Update existing videos with Cloudflare IDs
UPDATE videos
SET 
  cloudflare_id = CASE 
    WHEN url LIKE '%61d7f8b199313079f90399d802466eb3%' THEN '61d7f8b199313079f90399d802466eb3'
    WHEN url LIKE '%8d4a9738ce0108e5b6db3d3aefcf56c7%' THEN '8d4a9738ce0108e5b6db3d3aefcf56c7'
    ELSE cloudflare_id
  END,
  cloudflare_status = 'ready'
WHERE type = 'trailer';

-- Add any missing columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'cloudflare_id') THEN
    ALTER TABLE videos ADD COLUMN cloudflare_id text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'cloudflare_status') THEN
    ALTER TABLE videos ADD COLUMN cloudflare_status text DEFAULT 'pending';
  END IF;
END $$;