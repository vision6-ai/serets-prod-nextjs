-- Create sync_queue table for managing data synchronization
CREATE TABLE IF NOT EXISTS sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'movie', 'actor', etc.
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'sync', 'delete', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS sync_queue_type_idx ON sync_queue(type);
CREATE INDEX IF NOT EXISTS sync_queue_created_at_idx ON sync_queue(created_at);

-- Modify the existing call_sync_search function to use the sync_queue table
CREATE OR REPLACE FUNCTION call_sync_search()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Determine the type and action based on the operation
  DECLARE
    v_type text;
    v_id uuid;
  BEGIN
    IF TG_TABLE_NAME = 'movies' OR TG_TABLE_NAME = 'movie_translations' THEN
      v_type := 'movie';
      v_id := CASE 
        WHEN TG_TABLE_NAME = 'movies' THEN OLD.id
        ELSE OLD.movie_id
      END;
    ELSE
      v_type := 'actor';
      v_id := CASE 
        WHEN TG_TABLE_NAME = 'actors' THEN OLD.id
        ELSE OLD.actor_id
      END;
    END IF;

    -- Insert into sync_queue instead of directly calling the Edge Function
    INSERT INTO sync_queue (type, entity_id, action)
    VALUES (
      v_type,
      v_id,
      CASE TG_OP
        WHEN 'DELETE' THEN 'delete'
        ELSE 'sync'
      END
    );
    
    RETURN NEW;
  END;
END;
$$; 