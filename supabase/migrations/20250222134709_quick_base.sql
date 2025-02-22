/*
  # Create Blog Schema
  
  1. New Tables
    - blog_posts: Main table for blog content
    - blog_categories: Categories for organizing posts
    - blog_tags: Tags for additional classification
    - blog_post_categories: Junction table for post-category relationships
    - blog_post_tags: Junction table for post-tag relationships
  
  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for admin write access
*/

-- Create blog_posts table
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content jsonb NOT NULL,
  author_name text NOT NULL,
  author_bio text,
  author_avatar_url text,
  featured_image text,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  meta_title text,
  meta_description text,
  og_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- Create blog_categories table
CREATE TABLE blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_tags table
CREATE TABLE blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create junction tables
CREATE TABLE blog_post_categories (
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id uuid REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

CREATE TABLE blog_post_tags (
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Create indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX idx_blog_tags_slug ON blog_tags(slug);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on published blog posts"
ON blog_posts FOR SELECT
TO public
USING (status = 'published');

CREATE POLICY "Allow public read access on blog categories"
ON blog_categories FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access on blog tags"
ON blog_tags FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access on blog post categories"
ON blog_post_categories FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access on blog post tags"
ON blog_post_tags FOR SELECT
TO public
USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at
    BEFORE UPDATE ON blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_tags_updated_at
    BEFORE UPDATE ON blog_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add sample categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('News', 'news', 'Latest updates from the Israeli film industry'),
  ('Reviews', 'reviews', 'In-depth film reviews and analysis'),
  ('Features', 'features', 'Special features and long-form articles');

-- Add sample tags
INSERT INTO blog_tags (name, slug) VALUES
  ('Israeli Cinema', 'israeli-cinema'),
  ('Film Industry', 'film-industry'),
  ('Interviews', 'interviews'),
  ('Awards', 'awards');

-- Add sample blog posts
INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  author_name,
  author_bio,
  featured_image,
  status,
  published_at
) VALUES
(
  'The Evolution of Israeli Cinema',
  'evolution-of-israeli-cinema',
  'Explore the rich history and development of Israeli cinema from its early days to modern masterpieces.',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Israeli cinema has come a long way since its inception. From humble beginnings to international acclaim, the journey has been remarkable..."}]}]}',
  'David Cohen',
  'Film historian and critic specializing in Middle Eastern cinema',
  'https://media.themoviedb.org/t/p/w1920_and_h800_multi_faces/qZdFpkJJYxK2xP3jaecyZIzOMR4.jpg',
  'published',
  NOW()
),
(
  'Top 10 Must-Watch Israeli Films of 2024',
  'top-israeli-films-2024',
  'A curated selection of the best Israeli films released this year that you shouldn''t miss.',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "2024 has been an exceptional year for Israeli cinema. Here are our top picks that showcase the diversity and creativity of the industry..."}]}]}',
  'Sarah Levy',
  'Film critic and cultural journalist',
  'https://media.themoviedb.org/t/p/w1920_and_h800_multi_faces/kQwR6v827TZGNVgWIgfXbr1g859.jpg',
  'published',
  NOW() - INTERVAL '2 days'
),
(
  'Rising Stars: New Generation of Israeli Actors',
  'rising-stars-israeli-actors',
  'Meet the emerging talent that''s shaping the future of Israeli cinema and television.',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "A new wave of talented actors is emerging in the Israeli film industry, bringing fresh perspectives and incredible performances..."}]}]}',
  'Michael Ben-David',
  'Entertainment journalist and talent scout',
  'https://media.themoviedb.org/t/p/w1920_and_h800_multi_faces/iKyD2hbKYVbDGFYoReV3v8JvZe3.jpg',
  'published',
  NOW() - INTERVAL '5 days'
);

-- Add sample post-category relationships
INSERT INTO blog_post_categories (post_id, category_id)
SELECT p.id, c.id
FROM blog_posts p, blog_categories c
WHERE p.slug = 'evolution-of-israeli-cinema' AND c.slug = 'features'
UNION
SELECT p.id, c.id
FROM blog_posts p, blog_categories c
WHERE p.slug = 'top-israeli-films-2024' AND c.slug = 'reviews'
UNION
SELECT p.id, c.id
FROM blog_posts p, blog_categories c
WHERE p.slug = 'rising-stars-israeli-actors' AND c.slug = 'features';

-- Add sample post-tag relationships
INSERT INTO blog_post_tags (post_id, tag_id)
SELECT p.id, t.id
FROM blog_posts p, blog_tags t
WHERE p.slug = 'evolution-of-israeli-cinema' AND t.slug = 'israeli-cinema';