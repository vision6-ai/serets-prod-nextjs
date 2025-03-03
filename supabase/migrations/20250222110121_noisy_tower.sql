/*
  # Update movie poster URLs
  
  Updates the poster_url values for movies to use the correct TMDB image paths
*/

UPDATE movies
SET poster_url = CASE
  WHEN title = 'Waltz with Bashir' THEN 'https://media.themoviedb.org/t/p/w600_and_h900_bestv2/9bXHaLlsFYpJUutg4E6WXAjaxDi.jpg'
  WHEN title = 'Big Bad Wolves' THEN 'https://media.themoviedb.org/t/p/w600_and_h900_bestv2/9bXHaLlsFYpJUutg4E6WXAjaxDi.jpg'
  WHEN title = 'Image of Victory' THEN 'https://media.themoviedb.org/t/p/w600_and_h900_bestv2/9bXHaLlsFYpJUutg4E6WXAjaxDi.jpg'
  WHEN title = 'Here We Are' THEN 'https://media.themoviedb.org/t/p/w600_and_h900_bestv2/9bXHaLlsFYpJUutg4E6WXAjaxDi.jpg'
  WHEN title = 'Cinema Sabaya' THEN 'https://media.themoviedb.org/t/p/w600_and_h900_bestv2/9bXHaLlsFYpJUutg4E6WXAjaxDi.jpg'
  ELSE 'https://media.themoviedb.org/t/p/w600_and_h900_bestv2/9bXHaLlsFYpJUutg4E6WXAjaxDi.jpg'
END;