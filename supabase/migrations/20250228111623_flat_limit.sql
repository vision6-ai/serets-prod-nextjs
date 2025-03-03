-- Insert test videos with Cloudflare IDs
INSERT INTO videos (movie_id, title, type, language, cloudflare_id, cloudflare_status)
SELECT 
  m.id,
  m.title || ' - Official Trailer',
  'trailer',
  CASE WHEN m.hebrew_title IS NOT NULL THEN 'Hebrew' ELSE 'English' END,
  CASE 
    WHEN m.slug = 'waltz-with-bashir' THEN '61d7f8b199313079f90399d802466eb3'
    WHEN m.slug = 'big-bad-wolves' THEN '8d4a9738ce0108e5b6db3d3aefcf56c7'
  END,
  'ready'
FROM movies m
WHERE m.slug IN ('waltz-with-bashir', 'big-bad-wolves')
AND NOT EXISTS (
  SELECT 1 FROM videos v 
  WHERE v.movie_id = m.id 
  AND v.type = 'trailer'
);