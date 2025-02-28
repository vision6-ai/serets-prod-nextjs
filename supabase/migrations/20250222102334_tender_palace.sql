/*
  # Set up Meilisearch integration

  1. Create Functions
    - Create functions to sync data with Meilisearch
    - Handle movie and actor updates

  2. Create Triggers
    - Add triggers for automatic syncing
    - Handle inserts, updates, and deletes
*/

-- Create a function to notify Meilisearch of changes
CREATE OR REPLACE FUNCTION notify_meilisearch()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called by triggers
  -- In a production environment, you would implement actual Meilisearch sync logic here
  -- For now, we'll just log the change
  RAISE NOTICE 'Meilisearch sync: % on % - %', TG_OP, TG_TABLE_NAME, NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for movies
CREATE TRIGGER movies_meilisearch_sync
  AFTER INSERT OR UPDATE OR DELETE ON movies
  FOR EACH ROW
  EXECUTE FUNCTION notify_meilisearch();

-- Create triggers for actors
CREATE TRIGGER actors_meilisearch_sync
  AFTER INSERT OR UPDATE OR DELETE ON actors
  FOR EACH ROW
  EXECUTE FUNCTION notify_meilisearch();