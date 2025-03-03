/*
  # Theater Management Schema

  1. New Tables
    - `theaters` - Stores theater information
    - `theater_movies` - Junction table for theaters and movies with showtimes
    - `promotions` - Promotional content for theaters

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
*/

-- Create theaters table
CREATE TABLE theaters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  location text NOT NULL,
  address text NOT NULL,
  phone text,
  email text,
  website text,
  description text,
  amenities text[] DEFAULT '{}',
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create theater_movies junction table
CREATE TABLE theater_movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theater_id uuid REFERENCES theaters(id) ON DELETE CASCADE,
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  active_status boolean DEFAULT true,
  showtimes jsonb DEFAULT '[]',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  format text[] DEFAULT '{}',
  language text,
  subtitles text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(theater_id, movie_id)
);

-- Create promotions table
CREATE TABLE promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theater_id uuid REFERENCES theaters(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  link_url text,
  link_text text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theater_id uuid REFERENCES theaters(id) ON DELETE CASCADE,
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  showtime_id text NOT NULL,
  showtime_date date NOT NULL,
  showtime_time text NOT NULL,
  ticket_count integer NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  booking_reference text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('confirmed', 'cancelled', 'completed'))
);

-- Create indexes
CREATE INDEX idx_theaters_slug ON theaters(slug);
CREATE INDEX idx_theaters_location ON theaters(location);
CREATE INDEX idx_theater_movies_theater_id ON theater_movies(theater_id);
CREATE INDEX idx_theater_movies_movie_id ON theater_movies(movie_id);
CREATE INDEX idx_theater_movies_active ON theater_movies(active_status);
CREATE INDEX idx_theater_movies_dates ON theater_movies(start_date, end_date);
CREATE INDEX idx_promotions_theater_id ON promotions(theater_id);
CREATE INDEX idx_promotions_active ON promotions(active);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_bookings_theater_id ON bookings(theater_id);
CREATE INDEX idx_bookings_movie_id ON bookings(movie_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Enable RLS
ALTER TABLE theaters ENABLE ROW LEVEL SECURITY;
ALTER TABLE theater_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on theaters"
ON theaters FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access on theater_movies"
ON theater_movies FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access on promotions"
ON promotions FOR SELECT
TO public
USING (active = true);

CREATE POLICY "Allow users to view their own bookings"
ON bookings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to create bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_theaters_updated_at
    BEFORE UPDATE ON theaters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_theater_movies_updated_at
    BEFORE UPDATE ON theater_movies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
    BEFORE UPDATE ON promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add sample theaters
INSERT INTO theaters (name, slug, location, address, phone, email, website, description, amenities, image_url)
VALUES
  (
    'Cinema City Jerusalem',
    'cinema-city-jerusalem',
    'Jerusalem',
    'Yitzhak Rabin Blvd 10, Jerusalem',
    '+972-2-565-6677',
    'info@cinema-city-jerusalem.co.il',
    'https://www.cinema-city.co.il',
    'Cinema City Jerusalem is the largest cinema complex in Jerusalem, featuring state-of-the-art screening rooms, comfortable seating, and the latest movie releases.',
    ARRAY['IMAX', 'VIP Seating', 'Dolby Atmos', 'Accessible Facilities', 'Food Court'],
    'https://media.themoviedb.org/t/p/w1920_and_h800_multi_faces/qZdFpkJJYxK2xP3jaecyZIzOMR4.jpg'
  ),
  (
    'Lev Cinema Tel Aviv',
    'lev-cinema-tel-aviv',
    'Tel Aviv',
    'Dizengoff Center, Tel Aviv',
    '+972-3-529-5555',
    'info@lev.co.il',
    'https://www.lev.co.il',
    'Lev Cinema specializes in art-house and independent films, offering a unique cinematic experience in the heart of Tel Aviv.',
    ARRAY['Art Films', 'Indie Cinema', 'Cafe', 'Accessible Facilities'],
    'https://media.themoviedb.org/t/p/w1920_and_h800_multi_faces/kQwR6v827TZGNVgWIgfXbr1g859.jpg'
  ),
  (
    'Yes Planet Haifa',
    'yes-planet-haifa',
    'Haifa',
    'Check Post Junction, Haifa',
    '+972-4-877-7777',
    'info@yesplanet-haifa.co.il',
    'https://www.yesplanet.co.il',
    'Yes Planet Haifa offers a premium movie-going experience with multiple screens, the latest blockbusters, and cutting-edge sound and projection technology.',
    ARRAY['4DX', 'IMAX', 'VIP Lounge', 'Parking', 'Restaurant', 'Accessible Facilities'],
    'https://media.themoviedb.org/t/p/w1920_and_h800_multi_faces/iKyD2hbKYVbDGFYoReV3v8JvZe3.jpg'
  );

-- Add sample theater_movies with showtimes
INSERT INTO theater_movies (
  theater_id,
  movie_id,
  active_status,
  showtimes,
  start_date,
  end_date,
  format,
  language,
  subtitles
)
SELECT
  t.id,
  m.id,
  true,
  jsonb_build_array(
    jsonb_build_object(
      'id', gen_random_uuid(),
      'date', (CURRENT_DATE)::text,
      'time', '14:30',
      'hall', 'Hall 1',
      'format', '2D',
      'available_seats', 120,
      'total_seats', 150,
      'price', 15.50
    ),
    jsonb_build_object(
      'id', gen_random_uuid(),
      'date', (CURRENT_DATE)::text,
      'time', '17:45',
      'hall', 'Hall 3',
      'format', '3D',
      'available_seats', 80,
      'total_seats', 150,
      'price', 18.00
    ),
    jsonb_build_object(
      'id', gen_random_uuid(),
      'date', (CURRENT_DATE)::text,
      'time', '20:15',
      'hall', 'Hall 2',
      'format', '2D',
      'available_seats', 100,
      'total_seats', 150,
      'price', 15.50
    ),
    jsonb_build_object(
      'id', gen_random_uuid(),
      'date', (CURRENT_DATE + 1)::text,
      'time', '15:00',
      'hall', 'Hall 1',
      'format', '2D',
      'available_seats', 140,
      'total_seats', 150,
      'price', 15.50
    ),
    jsonb_build_object(
      'id', gen_random_uuid(),
      'date', (CURRENT_DATE + 1)::text,
      'time', '18:30',
      'hall', 'Hall 3',
      'format', '3D',
      'available_seats', 120,
      'total_seats', 150,
      'price', 18.00
    ),
    jsonb_build_object(
      'id', gen_random_uuid(),
      'date', (CURRENT_DATE + 1)::text,
      'time', '21:00',
      'hall', 'Hall 2',
      'format', '2D',
      'available_seats', 130,
      'total_seats', 150,
      'price', 15.50
    )
  ),
  CURRENT_DATE - INTERVAL '3 days',
  CURRENT_DATE + INTERVAL '14 days',
  ARRAY['2D', '3D'],
  'Hebrew',
  'English'
FROM
  theaters t
CROSS JOIN
  movies m
WHERE
  t.slug IN ('cinema-city-jerusalem', 'lev-cinema-tel-aviv', 'yes-planet-haifa')
AND
  m.slug IN ('waltz-with-bashir', 'big-bad-wolves', 'footnote', 'here-we-are')
LIMIT 10;

-- Add sample past screenings
INSERT INTO theater_movies (
  theater_id,
  movie_id,
  active_status,
  showtimes,
  start_date,
  end_date,
  format,
  language,
  subtitles
)
SELECT
  t.id,
  m.id,
  false,
  jsonb_build_array(
    jsonb_build_object(
      'id', gen_random_uuid(),
      'date', (CURRENT_DATE - INTERVAL '30 days')::text,
      'time', '15:00',
      'hall', 'Hall 1',
      'format', '2D',
      'available_seats', 0,
      'total_seats', 150,
      'price', 15.50
    )
  ),
  CURRENT_DATE - INTERVAL '60 days',
  CURRENT_DATE - INTERVAL '30 days',
  ARRAY['2D'],
  'Hebrew',
  'English'
FROM
  theaters t
CROSS JOIN
  movies m
WHERE
  t.slug IN ('cinema-city-jerusalem', 'lev-cinema-tel-aviv', 'yes-planet-haifa')
AND
  m.slug IN ('image-of-victory', 'cinema-sabaya', 'desert-storm', 'night-watch')
LIMIT 12;

-- Add sample promotions
INSERT INTO promotions (
  theater_id,
  title,
  description,
  image_url,
  link_url,
  link_text,
  start_date,
  end_date,
  active
)
SELECT
  t.id,
  'Special Discount Tuesdays',
  'Get 25% off all movie tickets every Tuesday! Valid for all screenings.',
  'https://media.themoviedb.org/t/p/w1920_and_h800_multi_faces/wGcxQDrZqvzjhDYN78bkzaVoWEp.jpg',
  '/promotions/tuesday-discount',
  'Get Tickets',
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '60 days',
  true
FROM
  theaters t
WHERE
  t.slug = 'cinema-city-jerusalem'
UNION ALL
SELECT
  t.id,
  'Family Package Deal',
  'Special family package: 2 adult tickets + 2 child tickets + popcorn and drinks for a discounted price!',
  'https://media.themoviedb.org/t/p/w1920_and_h800_multi_faces/iKyD2hbKYVbDGFYoReV3v8JvZe3.jpg',
  '/promotions/family-package',
  'Learn More',
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '45 days',
  true
FROM
  theaters t
WHERE
  t.slug = 'yes-planet-haifa'
UNION ALL
SELECT
  t.id,
  'Indie Film Festival',
  'Join us for our annual Independent Film Festival featuring award-winning films from around the world.',
  'https://media.themoviedb.org/t/p/w1920_and_h800_multi_faces/kQwR6v827TZGNVgWIgfXbr1g859.jpg',
  '/events/indie-film-festival',
  'View Schedule',
  CURRENT_DATE + INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '22 days',
  true
FROM
  theaters t
WHERE
  t.slug = 'lev-cinema-tel-aviv';