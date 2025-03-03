/*
  # Fix RLS Policies with CHECK Expressions

  1. Changes
    - Drop existing policies
    - Create new policies with proper CHECK expressions for INSERT operations
    - Add missing policies for SEO meta table

  2. Security
    - Maintain public read access
    - Add proper CHECK expressions for INSERT policies
    - Ensure proper user validation for authenticated operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access on movies" ON movies;
DROP POLICY IF EXISTS "Allow public read access on actors" ON actors;
DROP POLICY IF EXISTS "Allow public read access on movie_actors" ON movie_actors;
DROP POLICY IF EXISTS "Allow public read access on genres" ON genres;
DROP POLICY IF EXISTS "Allow public read access on movie_genres" ON movie_genres;
DROP POLICY IF EXISTS "Allow public read access on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public read access on awards" ON awards;
DROP POLICY IF EXISTS "Allow public read access on actor_awards" ON actor_awards;
DROP POLICY IF EXISTS "Allow public read access on movie_awards" ON movie_awards;
DROP POLICY IF EXISTS "Allow authenticated users to create reviews" ON reviews;
DROP POLICY IF EXISTS "Allow users to update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Allow users to delete their own reviews" ON reviews;
DROP POLICY IF EXISTS "Allow authenticated users to manage watchlist" ON watchlists;

-- Recreate policies with proper CHECK expressions

-- Movies policies
CREATE POLICY "Allow public read access on movies"
ON movies FOR SELECT
TO public
USING (true);

-- Actors policies
CREATE POLICY "Allow public read access on actors"
ON actors FOR SELECT
TO public
USING (true);

-- Movie actors policies
CREATE POLICY "Allow public read access on movie_actors"
ON movie_actors FOR SELECT
TO public
USING (true);

-- Genres policies
CREATE POLICY "Allow public read access on genres"
ON genres FOR SELECT
TO public
USING (true);

-- Movie genres policies
CREATE POLICY "Allow public read access on movie_genres"
ON movie_genres FOR SELECT
TO public
USING (true);

-- Reviews policies
CREATE POLICY "Allow public read access on reviews"
ON reviews FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to create reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own reviews"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own reviews"
ON reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Watchlist policies
CREATE POLICY "Allow users to manage their watchlist"
ON watchlists FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to add to watchlist"
ON watchlists FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to remove from watchlist"
ON watchlists FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Awards policies
CREATE POLICY "Allow public read access on awards"
ON awards FOR SELECT
TO public
USING (true);

-- Actor awards policies
CREATE POLICY "Allow public read access on actor_awards"
ON actor_awards FOR SELECT
TO public
USING (true);

-- Movie awards policies
CREATE POLICY "Allow public read access on movie_awards"
ON movie_awards FOR SELECT
TO public
USING (true);

-- SEO meta policies
CREATE POLICY "Allow public read access on seo_meta"
ON seo_meta FOR SELECT
TO public
USING (true);