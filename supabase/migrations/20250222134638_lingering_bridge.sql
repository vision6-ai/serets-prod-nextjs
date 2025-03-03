/*
  # Update Blog Schema
  
  1. Changes
    - Add author fields directly to blog_posts table
    - Remove blog_authors table and related fields
    - Add indexes for better performance
  
  2. Security
    - Enable RLS
    - Add policies for public read access
*/

-- Drop existing blog_authors table and constraints
DROP TABLE IF EXISTS blog_authors CASCADE;

-- Modify blog_posts table to include author information
ALTER TABLE blog_posts
DROP COLUMN IF EXISTS author_id,
ADD COLUMN author_name text NOT NULL,
ADD COLUMN author_bio text,
ADD COLUMN author_avatar_url text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on published blog posts"
ON blog_posts FOR SELECT
TO public
USING (status = 'published');

-- Add sample blog posts
INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  author_name,
  author_bio,
  status,
  published_at
) VALUES
(
  'The Evolution of Israeli Cinema',
  'evolution-of-israeli-cinema',
  'Explore the rich history and development of Israeli cinema from its early days to modern masterpieces.',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Israeli cinema has come a long way..."}]}]}',
  'David Cohen',
  'Film historian and critic specializing in Middle Eastern cinema',
  'published',
  NOW()
),
(
  'Top 10 Must-Watch Israeli Films of 2024',
  'top-israeli-films-2024',
  'A curated selection of the best Israeli films released this year that you shouldn''t miss.',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "2024 has been an exceptional year for Israeli cinema..."}]}]}',
  'Sarah Levy',
  'Film critic and cultural journalist',
  'published',
  NOW() - INTERVAL '2 days'
),
(
  'Rising Stars: New Generation of Israeli Actors',
  'rising-stars-israeli-actors',
  'Meet the emerging talent that''s shaping the future of Israeli cinema and television.',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "A new wave of talented actors is emerging..."}]}]}',
  'Michael Ben-David',
  'Entertainment journalist and talent scout',
  'published',
  NOW() - INTERVAL '5 days'
);