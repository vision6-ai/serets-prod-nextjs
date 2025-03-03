/*
  # Update movie poster URLs

  1. Changes
    - Update poster URLs to use reliable image hosting service
    - Add fallback placeholder images for movies without posters

  Note: Using imgbb.com for reliable image hosting
*/

UPDATE movies
SET poster_url = CASE
  WHEN title = 'Waltz with Bashir' THEN 'https://i.ibb.co/wQB6cvf/waltz-with-bashir.jpg'
  WHEN title = 'Big Bad Wolves' THEN 'https://i.ibb.co/Kj8YtZy/big-bad-wolves.jpg'
  WHEN title = 'Image of Victory' THEN 'https://i.ibb.co/0jZ3Zqw/image-of-victory.jpg'
  WHEN title = 'Here We Are' THEN 'https://i.ibb.co/VvKn8jZ/here-we-are.jpg'
  WHEN title = 'Cinema Sabaya' THEN 'https://i.ibb.co/Lk2BVLJ/cinema-sabaya.jpg'
  ELSE 'https://placehold.co/600x900?text=' || REPLACE(title, ' ', '+')
END;