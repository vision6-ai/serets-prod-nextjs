-- Enable RLS
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE actors ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on movies"
ON movies FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow public read access on genres"
ON genres FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow public read access on movie_genres"
ON movie_genres FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow public read access on actors"
ON actors FOR SELECT
TO anon
USING (true);
