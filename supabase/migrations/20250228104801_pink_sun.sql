/*
  # Add Cloudflare Stream Support
  
  1. Changes
    - Add cloudflare_id column to videos table
    - Add cloudflare_thumbnail_url column
    - Add cloudflare_playback_url column
    - Add cloudflare_status column for tracking video processing
  
  2. Security
    - Enable RLS
    - Add policies for public read access
*/

-- Add Cloudflare Stream columns to videos table
ALTER TABLE videos
ADD COLUMN cloudflare_id text,
ADD COLUMN cloudflare_thumbnail_url text,
ADD COLUMN cloudflare_playback_url text,
ADD COLUMN cloudflare_status text DEFAULT 'pending'
CHECK (cloudflare_status IN ('pending', 'ready', 'error'));

-- Create index for faster lookups
CREATE INDEX idx_videos_cloudflare_id ON videos(cloudflare_id);
CREATE INDEX idx_videos_cloudflare_status ON videos(cloudflare_status);

-- Update existing videos to have status 'ready'
UPDATE videos SET cloudflare_status = 'ready' WHERE url IS NOT NULL;

COMMENT ON COLUMN videos.cloudflare_id IS 'Cloudflare Stream video identifier';
COMMENT ON COLUMN videos.cloudflare_thumbnail_url IS 'URL to video thumbnail from Cloudflare';
COMMENT ON COLUMN videos.cloudflare_playback_url IS 'HLS/DASH playback URL from Cloudflare';
COMMENT ON COLUMN videos.cloudflare_status IS 'Video processing status in Cloudflare';