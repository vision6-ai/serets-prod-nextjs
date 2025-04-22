-- Add new columns to the profiles table to support public profile sharing
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_watchlist_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_reviews_public BOOLEAN DEFAULT true;

-- Create a function to generate a unique username from email if username is null
CREATE OR REPLACE FUNCTION generate_username_from_email()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- If username is already set, do nothing
  IF NEW.username IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Extract base username from email (before @)
  IF NEW.email IS NOT NULL THEN
    base_username := split_part(NEW.email, '@', 1);
    -- Remove special characters and spaces
    base_username := regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g');
  ELSE
    -- If no email, use 'user' as base
    base_username := 'user';
  END IF;
  
  -- Try the base username first
  final_username := base_username;
  
  -- Keep trying with increasing numbers until we find a unique username
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter;
  END LOOP;
  
  -- Set the username
  NEW.username := final_username;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate usernames when profiles are created
DROP TRIGGER IF EXISTS ensure_username_trigger ON profiles;
CREATE TRIGGER ensure_username_trigger
BEFORE INSERT OR UPDATE OF username ON profiles
FOR EACH ROW
WHEN (NEW.username IS NULL)
EXECUTE FUNCTION generate_username_from_email();

-- Backfill usernames for existing profiles
UPDATE profiles
SET username = NULL
WHERE username IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username); 