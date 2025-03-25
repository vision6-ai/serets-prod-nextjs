'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { MovieList } from '@/components/movies/movie-list';
import { MovieFilters } from '@/components/movies/movie-filters';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Locale } from '@/config/i18n';

interface Movie {
	id: string;
	title: string;
	hebrew_title: string | null;
	release_date: string | null;
	poster_url: string | null;
	rating: number | null;
	slug: string;
	synopsis: string | null;
	trailer_url: string | null;
}

interface TheaterMovie {
	id: string;
	moviepid: number;
	original_title: string;
	screenings_count: number;
	slug: string;
	countit_pid?: string;
	created_at?: string;
	updated_at?: string;
	duration?: number;
	imdb_id?: string;
	release_date?: string;
	rating?: number;
	themoviedb_id?: string;
}

interface Filters {
	genres: Array<string>;
	year?: number | null;
	rating?: number | null;
	sortBy: 'release_date' | 'rating' | 'title';
	sortOrder: 'asc' | 'desc';
}

interface MoviesContentProps {
	locale?: Locale;
	category?: string;
	hideFilters?: boolean;
	searchQuery?: string;
	selectedCity?: string | null;
}

export function MoviesContent({
	locale = 'en',
	category: propCategory,
	hideFilters = false,
	searchQuery = '',
	selectedCity = null,
}: MoviesContentProps) {
	const [movies, setMovies] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(true);
	const pathname = usePathname();
	const supabase = createClientComponentClient();

	const currentFilters = useRef<Filters>({
		genres: Array<string>(),
		sortBy: 'release_date',
		sortOrder: 'desc',
	});

	// Get the current page category from the URL or props
	const urlCategory = pathname?.split('/').pop() || '';
	const category = propCategory || urlCategory;

	const fetchMovies = useCallback(
		async (filters: Filters, query = searchQuery, city = selectedCity) => {
			// Don't show loading state if filters haven't changed
			const filtersChanged =
				JSON.stringify(filters) !== JSON.stringify(currentFilters.current) ||
				query !== searchQuery ||
				city !== selectedCity;

			if (filtersChanged) {
				setLoading(true);
			}

			currentFilters.current = filters;

			try {
				let movieQuery = supabase.from('movies').select('*');
				const now = new Date().toISOString();
				console.log('Current datetime (now):', now);

				// Get all movies that have showtimes after the current date
				// First, get movie IDs from movieshows with future dates
				const { data: upcomingShowtimes, error: showtimesError } =
					await supabase.from('movieshows').select('moviepid').gt('day', now);

				console.log('Upcoming showtimes query result:', upcomingShowtimes);
				if (showtimesError) {
					console.error('Error fetching upcoming showtimes:', showtimesError);
				}

				// If we have upcoming showtimes, filter movies to only those with showtimes
				if (upcomingShowtimes && upcomingShowtimes.length > 0) {
					// Get unique movie IDs
					const moviePids = [
						...new Set(upcomingShowtimes.map((item) => item.moviepid)),
					];

					if (moviePids.length > 0) {
						// Convert moviepid values to strings to match countit_pid format
						const countitPids = moviePids.map((pid) => String(pid));
						movieQuery = movieQuery.in('countit_pid', countitPids);
					} else {
						setMovies([]);
						setLoading(false);
						return;
					}
				}

				// Apply category-specific filters
				switch (category) {
					case 'latest':
						movieQuery = movieQuery
							.lt('release_date', now)
							.gt(
								'release_date',
								new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
							);
						break;

					case 'top-rated':
						movieQuery = movieQuery.lt('release_date', now).gte('rating', 7);
						break;

					case 'coming-soon':
						movieQuery = movieQuery.gt('release_date', now);
						break;

					case 'now-in-theaters':
						// Call the stored procedure to get movie showtime counts
						const { data: currentMoviesInTheaters, error: storedProcError } =
							await supabase.rpc('get_movie_showtime_counts');

						console.log(
							'Movie showtime counts from stored procedure:',
							currentMoviesInTheaters
						);

						if (storedProcError) {
							console.error(
								'Error fetching movie showtime counts:',
								storedProcError
							);
							break;
						}

						// If we have movies in theaters, use them directly instead of continuing with the regular query
						if (currentMoviesInTheaters && currentMoviesInTheaters.length > 0) {
							// Get movie details for each movie in theaters
							const theaterMoviesWithDetails = await Promise.all(
								currentMoviesInTheaters.map(async (theaterMovie: TheaterMovie) => {
									// Get the movie from the movies table using the id from the theater movie
									const { data: movieData } = await supabase
										.from('movies')
										.select('*')
										.eq('id', theaterMovie.id)
										.single();

									// If movie data not found, try looking up by countit_pid
									let finalMovieData = movieData;
									if (!finalMovieData && theaterMovie.moviepid) {
										const { data: movieByPid } = await supabase
											.from('movies')
											.select('*')
											.eq('countit_pid', theaterMovie.moviepid.toString())
											.single();
										
										finalMovieData = movieByPid;
									}

									if (!finalMovieData) return null;

									// Get translations for this movie
									const { data: translations } = await supabase
										.from('movie_translations')
										.select('title, synopsis, poster_url, trailer_url, language_code, movie_id')
										.eq('movie_id', finalMovieData.id)
										.eq('language_code', locale)
										.single();

									// If no translation in requested locale, try to get English translation
									if (!translations) {
										const { data: enTranslations } = await supabase
											.from('movie_translations')
											.select('title, synopsis, poster_url, trailer_url, language_code, movie_id')
											.eq('movie_id', finalMovieData.id)
											.eq('language_code', 'en')
											.single();

										return {
											...finalMovieData,
											title: enTranslations?.title || finalMovieData.title || theaterMovie.original_title,
											hebrew_title: locale === 'he' ? enTranslations?.title : finalMovieData.hebrew_title,
											synopsis: enTranslations?.synopsis || finalMovieData.synopsis,
											poster_url: enTranslations?.poster_url || null,
											screenings_count: theaterMovie.screenings_count
										};
									}

									// Return movie with translations
									return {
										...finalMovieData,
										title: translations.title || finalMovieData.title || theaterMovie.original_title,
										hebrew_title: locale === 'he' ? translations.title : finalMovieData.hebrew_title,
										synopsis: translations.synopsis || finalMovieData.synopsis,
										poster_url: translations.poster_url || null,
										screenings_count: theaterMovie.screenings_count
									};
								})
							);

							// Filter out any nulls and set the movies
							const validMovies = theaterMoviesWithDetails.filter(movie => movie !== null);
							
							// Sort movies by screenings_count in descending order
							const sortedMovies = validMovies.sort((a, b) => 
								(b.screenings_count || 0) - (a.screenings_count || 0)
							);
							
							setMovies(sortedMovies);
							setLoading(false);
							return;
						}
						break;
				}

				// Apply search query if provided
				if (query && query.trim() !== '') {
					// First get movies with matching titles from translations
					const { data: translationMatches, error: searchError } =
						await supabase
							.from('movie_translations')
							.select('movie_id')
							.ilike('title', `%${query}%`);

					if (searchError) {
						console.error('Error searching for movies:', searchError);
					}

					if (translationMatches && translationMatches.length > 0) {
						const movieIds = translationMatches.map((match) => match.movie_id);
						movieQuery = movieQuery.in('id', movieIds);
					} else {
						// If no matches in translations, return empty result
						setMovies([]);
						setLoading(false);
						return;
					}
				}

				// Apply city filter if provided
				if (city) {
					// Get movie IDs that have showtimes in the selected city
					const { data: cityMovies, error: cityError } = await supabase
						.from('movieshows')
						.select('moviepid')
						.eq('city', city)
						.order('moviepid');

					if (cityError) {
						console.error('Error filtering by city:', cityError);
					}

					if (cityMovies && cityMovies.length > 0) {
						// Get unique movie IDs
						const moviePids = [
							...new Set(cityMovies.map((item) => item.moviepid)),
						];

						if (moviePids.length > 0) {
							// Convert all items to strings to ensure type compatibility
							const countitPids = moviePids.map((pid) => String(pid));
							movieQuery = movieQuery.in('countit_pid', countitPids);
						} else {
							setMovies([]);
							setLoading(false);
							return;
						}
					} else {
						setMovies([]);
						setLoading(false);
						return;
					}
				}

				// Apply user filters
				if (filters.genres.length > 0) {
					const { data: movieIds } = await supabase
						.from('movie_genres')
						.select('movie_id')
						.in('genre_id', filters.genres);

					if (movieIds && movieIds.length > 0) {
						movieQuery = movieQuery.in(
							'id',
							movieIds.map((item) => item.movie_id)
						);
					} else {
						setMovies([]);
						setLoading(false);
						return;
					}
				}

				if (filters.year) {
					movieQuery = movieQuery
						.gte('release_date', `${filters.year}-01-01`)
						.lte('release_date', `${filters.year}-12-31`);
				}

				if (filters.rating) {
					movieQuery = movieQuery.gte('rating', filters.rating);
				}

				// Apply sorting
				movieQuery = movieQuery.order(filters.sortBy, {
					ascending: filters.sortOrder === 'asc',
				});

				// Execute the query
				const { data, error } = await movieQuery;

				if (error) throw error;

				// Only update if these are still the current filters
				if (
					JSON.stringify(filters) === JSON.stringify(currentFilters.current)
				) {
					// Get translations for the movies
					const moviesWithTranslations = await Promise.all(
						(data || []).map(async (movie) => {
							// Get translations for this movie - explicitly select all needed fields
							const { data: translations } = await supabase
								.from('movie_translations')
								.select(
									'title, synopsis, poster_url, trailer_url, language_code, movie_id'
								)
								.eq('movie_id', movie.id)
								.eq('language_code', locale)
								.single();

							// If no translation in requested locale, try to get English translation
							if (!translations) {
								const { data: enTranslations } = await supabase
									.from('movie_translations')
									.select(
										'title, synopsis, poster_url, trailer_url, language_code, movie_id'
									)
									.eq('movie_id', movie.id)
									.eq('language_code', 'en')
									.single();

								console.log(
									`Movie ${movie.id} English translations:`,
									enTranslations
								);

								// Make sure we're explicitly assigning the poster_url
								return {
									...movie,
									title: enTranslations?.title || movie.title,
									hebrew_title:
										locale === 'he'
											? enTranslations?.title
											: movie.hebrew_title,
									synopsis: enTranslations?.synopsis || movie.synopsis,
									poster_url: enTranslations?.poster_url || null,
								};
							}

							// Return movie with translations - make sure we're explicitly assigning the poster_url
							return {
								...movie,
								title: translations.title || movie.title,
								hebrew_title:
									locale === 'he' ? translations.title : movie.hebrew_title,
								synopsis: translations.synopsis || movie.synopsis,
								poster_url: translations.poster_url || null,
							};
						})
					);

					console.log('Movies with translations:', moviesWithTranslations);
					setMovies(moviesWithTranslations || []);
				}
			} catch (error) {
				console.error('Error fetching movies:', error);
				setMovies([]);
			} finally {
				setLoading(false);
			}
		},
		[category, supabase, locale, searchQuery, selectedCity]
	);

	// Re-fetch when search or city changes
	useEffect(() => {
		const initialFilters: Filters = {
			genres: [],
			sortBy: category === 'top-rated' ? 'rating' : 'release_date',
			sortOrder: category === 'coming-soon' ? 'asc' : 'desc',
		};

		fetchMovies(initialFilters, searchQuery, selectedCity);
	}, [category, fetchMovies, searchQuery, selectedCity]);

	return (
		<div className="space-y-8">
			{!hideFilters && (
				<MovieFilters onFilterChange={fetchMovies} locale={locale} />
			)}

			<div className="min-h-[400px]">
				{loading ? (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
						{[...Array(10)].map((_, i) => (
							<div key={i} className="overflow-hidden rounded-lg">
								<div className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
								<div className="p-2 space-y-2">
									<div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
									<div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
									<div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
								</div>
							</div>
						))}
					</div>
				) : (
					<>
						{movies.length > 0 ? (
							<MovieList movies={movies} locale={locale} />
						) : (
							<div className="text-center py-12">
								<p className="text-muted-foreground">
									No movies found matching your filters.
								</p>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
