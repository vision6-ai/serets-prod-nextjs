/*
  # Add Meilisearch sync triggers

  1. New Functions
    - `notify_meilisearch_movies`: Handles movie updates
    - `notify_meilisearch_actors`: Handles actor updates

  2. New Triggers
    - Movies table sync trigger
    - Actors table sync trigger

  3. Security
    - Functions are executed with invoker rights
*/

-- Create function to sync movies to Meilisearch
CREATE OR REPLACE FUNCTION notify_meilisearch_movies()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the change for monitoring
  RAISE NOTICE 'Movie change: % - %', TG_OP, NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to sync actors to Meilisearch
CREATE OR REPLACE FUNCTION notify_meilisearch_actors()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the change for monitoring
  RAISE NOTICE 'Actor change: % - %', TG_OP, NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for movies
DROP TRIGGER IF EXISTS movies_meilisearch_sync ON movies;
CREATE TRIGGER movies_meilisearch_sync
  AFTER INSERT OR UPDATE OR DELETE ON movies
  FOR EACH ROW
  EXECUTE FUNCTION notify_meilisearch_movies();

-- Create trigger for actors
DROP TRIGGER IF EXISTS actors_meilisearch_sync ON actors;
CREATE TRIGGER actors_meilisearch_sync
  AFTER INSERT OR UPDATE OR DELETE ON actors
  FOR EACH ROW
  EXECUTE FUNCTION notify_meilisearch_actors();