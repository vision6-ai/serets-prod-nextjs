/*
  # Update movie poster URLs with real TMDB images
  
  Updates the poster_url values for movies to use the correct TMDB image paths for each specific movie
*/

UPDATE movies
SET poster_url = CASE
  WHEN title = 'Waltz with Bashir' THEN 'https://media.themoviedb.org/t/p/w600_and_h900_bestv2/qZdFpkJJYxK2xP3jaecyZIzOMR4.jpg'
  WHEN title = 'Big Bad Wolves' THEN 'https://media.themoviedb.org/t/p/w600_and_h900_bestv2/kQwR6v827TZGNVgWIgfXbr1g859.jpg'
  WHEN title = 'Image of Victory' THEN 'https://media.themoviedb.org/t/p/w600_and_h900_bestv2/uzUPwWSxgQqDz3kuYIYhxGrHEtH.jpg'
  WHEN title = 'Here We Are' THEN 'https://media.themoviedb.org/t/p/w600_and_h900_bestv2/iKyD2hbKYVbDGFYoReV3v8JvZe3.jpg'
  WHEN title = 'Cinema Sabaya' THEN 'https://media.themoviedb.org/t/p/w600_and_h900_bestv2/wGcxQDrZqvzjhDYN78bkzaVoWEp.jpg'
  WHEN title = 'Footnote' THEN 'https://media.themoviedb.org/t/p/w600_and_h900_bestv2/nNJwPHFPJfsFXiw4Sgt5FhzjZPE.jpg'
  WHEN title = 'Zero Motivation' THEN 'https://media.themoviedb.org/t/p/w600_and_h900_bestv2/9bXHaLlsFYpJUutg4E6WXAjaxDi.jpg'
  ELSE 'https://placehold.co/600x900?text=' || REPLACE(title, ' ', '+')
END;