/*
  # Add Cloudflare Stream Integration
  
  1. New Columns
    - cloudflare_id (text) - Cloudflare Stream video identifier
    - cloudflare_status (text) - Video processing status
    - cloudflare_thumbnail_url (text) - Thumbnail URL
    - cloudflare_playback_url (text) - HLS/DASH playback URL
  
  2. Indexes
    - idx_videos_cloudflare_id
    - idx_videos_cloudflare_status
*/

-- Add Cloudflare Stream columns to videos table
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS cloudflare_id text,
ADD COLUMN IF NOT EXISTS cloudflare_thumbnail_url text,
ADD COLUMN IF NOT EXISTS cloudflare_playback_url text,
ADD COLUMN IF NOT EXISTS cloudflare_status text DEFAULT 'pending'
CHECK (cloudflare_status IN ('pending', 'ready', 'error'));

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_videos_cloudflare_id ON videos(cloudflare_id);
CREATE INDEX IF NOT EXISTS idx_videos_cloudflare_status ON videos(cloudflare_status);

-- Update existing videos to have status 'ready'
UPDATE videos 
SET cloudflare_status = 'ready',
    cloudflare_id = CASE 
      WHEN url LIKE '%videodelivery.net/%' THEN 
        substring(url from 'videodelivery\.net/([^/]+)')
      ELSE NULL
    END
WHERE url IS NOT NULL;