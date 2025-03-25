-- Create a table for logging actor enrichment process
CREATE TABLE IF NOT EXISTS enrich_actor_logs (
  id UUID PRIMARY KEY,
  total_movies INTEGER NOT NULL DEFAULT 0,
  total_actors_created INTEGER NOT NULL DEFAULT 0,
  total_translations_created INTEGER NOT NULL DEFAULT 0,
  total_links_created INTEGER NOT NULL DEFAULT 0,
  error_messages TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Add comments for better documentation
COMMENT ON TABLE enrich_actor_logs IS 'Logs for the actor enrichment process from TMDB';
COMMENT ON COLUMN enrich_actor_logs.id IS 'Unique identifier for each run';
COMMENT ON COLUMN enrich_actor_logs.total_movies IS 'Number of movies processed';
COMMENT ON COLUMN enrich_actor_logs.total_actors_created IS 'Number of actors created';
COMMENT ON COLUMN enrich_actor_logs.total_translations_created IS 'Number of translations created';
COMMENT ON COLUMN enrich_actor_logs.total_links_created IS 'Number of movie-actor links created';
COMMENT ON COLUMN enrich_actor_logs.error_messages IS 'Pipe-separated list of error messages';

-- RLS policy - only allow admins to access this table
ALTER TABLE enrich_actor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins full access to logs" 
  ON enrich_actor_logs
  USING (auth.uid() IN (
    SELECT auth.uid FROM auth.users WHERE auth.email() IN (
      SELECT email FROM admin_list
    )
  )); 