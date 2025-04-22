-- Set default visibility settings for all profiles
UPDATE profiles
SET is_watchlist_public = true
WHERE is_watchlist_public IS NULL;

UPDATE profiles
SET is_reviews_public = true
WHERE is_reviews_public IS NULL;

-- Add default constraints to ensure future profiles have these values set to true by default
ALTER TABLE profiles
ALTER COLUMN is_watchlist_public SET DEFAULT true;

ALTER TABLE profiles
ALTER COLUMN is_reviews_public SET DEFAULT true; 