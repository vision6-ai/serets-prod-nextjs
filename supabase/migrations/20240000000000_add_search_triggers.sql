-- Create function to call Edge Function
CREATE OR REPLACE FUNCTION call_sync_search()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Determine the type and action based on the operation
  DECLARE
    v_type text;
    v_action text;
    v_id text;
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

    v_action := CASE TG_OP
      WHEN 'DELETE' THEN 'delete'
      ELSE 'sync'
    END;

    -- Call the Edge Function
    PERFORM
      net.http_post(
        url := CURRENT_SETTING('app.edge_function_url') || '/sync-search',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || CURRENT_SETTING('app.edge_function_key')
        ),
        body := jsonb_build_object(
          'type', v_type,
          'id', v_id,
          'action', v_action
        )
      );
    
    RETURN NEW;
  END;
END;
$$;

-- Trigger for movies table
CREATE TRIGGER sync_movie_search
AFTER INSERT OR UPDATE OR DELETE ON movies
FOR EACH ROW
EXECUTE FUNCTION call_sync_search();

-- Trigger for movie_translations table
CREATE TRIGGER sync_movie_translation_search
AFTER INSERT OR UPDATE OR DELETE ON movie_translations
FOR EACH ROW
EXECUTE FUNCTION call_sync_search();

-- Trigger for actors table
CREATE TRIGGER sync_actor_search
AFTER INSERT OR UPDATE OR DELETE ON actors
FOR EACH ROW
EXECUTE FUNCTION call_sync_search();

-- Trigger for actor_translations table
CREATE TRIGGER sync_actor_translation_search
AFTER INSERT OR UPDATE OR DELETE ON actor_translations
FOR EACH ROW
EXECUTE FUNCTION call_sync_search();
