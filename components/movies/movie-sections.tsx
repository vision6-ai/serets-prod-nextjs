import { createClient } from '@supabase/supabase-js';
import { Locale } from '@/config/i18n';
import { MovieSlider } from './movie-slider';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

interface Movie {
	id: string;
	title: string;
	hebrew_title: string | null;
	release_date: string | null;
	poster_url: string | null;
	rating: number | null;
	slug: string;
}

interface Genre {
	id: string;
	name: string;
	slug: string;
}

interface MovieTranslation {
	title: string;
	synopsis: string | null;
	poster_url: string | null;
	trailer_url: string | null;
	language_code: string;
	movie_id: string;
}

async function getMoviesData(locale: string = 'en') {
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	);
	const now = new Date().toISOString();

	try {
		// Fetch genres with translations separately
		const { data: genresData, error: genresError } = await supabase
			.from('genres')
			.select('id, slug')
			.order('slug');

		if (genresError) {
			console.error('Error fetching genres:', genresError);
			return {
				latest: [],
				topRated: [],
				comingSoon: [],
				genres: [],
				genreMovies: {},
			};
		}

		// No separate genre translations table - data is already bilingual in genres table

		// Transform genres data
		const genres =
			genresData?.map((genre) => ({
				id: genre.id,
				slug: genre.id.toString(),
				name: getLocalizedField(genre.name_en, genre.name_he, locale) || `Genre ${genre.id}`
			})) || [];

		// Fetch latest movies (last 6 months)
		const { data: latestMovies, error: latestError } = await supabase
			.from('movies')
			.select('id, slug, release_date, vote_average')
			.lt('release_date', now)
			.gt(
				'release_date',
				new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
			)
			.order('release_date', { ascending: false })
			.limit(10);

		if (latestError) {
			console.error('Error fetching latest movies:', latestError);
			return {
				latest: [],
				topRated: [],
				comingSoon: [],
				genres: [],
				genreMovies: {},
			};
		}

		// Fetch top rated movies
		const { data: topRatedMovies, error: topRatedError } = await supabase
			.from('movies')
			.select('id, slug, release_date, vote_average')
			.lt('release_date', now)
			.gt('vote_average', 7)
			.order('vote_average', { ascending: false })
			.limit(10);

		if (topRatedError) {
			console.error('Error fetching top rated movies:', topRatedError);
			return {
				latest: [],
				topRated: [],
				comingSoon: [],
				genres: [],
				genreMovies: {},
			};
		}

		// Fetch coming soon movies (release date in the future)
		const { data: comingSoonMovies, error: comingSoonError } = await supabase
			.from('movies')
			.select('id, slug, release_date, vote_average')
			.gt('release_date', now)
			.order('release_date', { ascending: true })
			.limit(10);

		if (comingSoonError) {
			console.error('Error fetching coming soon movies:', comingSoonError);
			return {
				latest: [],
				topRated: [],
				comingSoon: [],
				genres: [],
				genreMovies: {},
			};
		}

		// Get all movie IDs to fetch translations
		const allMovieIds = [
			...new Set([
				...(latestMovies || []).map((m) => m.id),
				...(topRatedMovies || []).map((m) => m.id),
				...(comingSoonMovies || []).map((m) => m.id),
			]),
		];

		// Fetch translations for all movies
		const { data: allTranslations, error: translationsError } = await supabase
			.from('movie_translations')
			.select('movie_id, title, poster_url, language_code')
			.eq('language_code', locale)
			.in('movie_id', allMovieIds);

		if (translationsError) {
			console.error('Error fetching movie translations:', translationsError);
			return {
				latest: [],
				topRated: [],
				comingSoon: [],
				genres: [],
				genreMovies: {},
			};
		}

		// Create a map of translations
		const translationsMap = new Map();
		allTranslations?.forEach((translation) => {
			translationsMap.set(translation.movie_id, translation);
		});

		// Transform movie data
		const transformMovieData = (movieData: any) => {
			const translation = translationsMap.get(movieData.id);

			return {
				id: movieData.id,
				title: translation?.title || movieData.slug,
				hebrew_title: translation?.title || movieData.slug, // Using same title as fallback
				release_date: movieData.release_date,
				poster_url: translation?.poster_url || null,
				rating: movieData.rating,
				slug: movieData.slug,
			};
		};

		const latest = (latestMovies || []).map(transformMovieData);
		const topRated = (topRatedMovies || []).map(transformMovieData);
		const comingSoon = (comingSoonMovies || []).map(transformMovieData);

		// Get movies for each genre (limit to 5 genres to avoid too many queries)
		const genreMovies: Record<string, Movie[]> = {};

		for (const genre of genres.slice(0, 5)) {
			// Get movie IDs for this genre
			const { data: movieGenres } = await supabase
				.from('movie_genres')
				.select('movie_id')
				.eq('genre_id', genre.id)
				.limit(10);

			if (movieGenres && movieGenres.length > 0) {
				const movieIds = movieGenres.map((mg) => mg.movie_id);

				// Get the actual movies
				const { data: genreMoviesData } = await supabase
					.from('movies')
					.select('id, slug, release_date, rating')
					.in('id', movieIds)
					.order('release_date', { ascending: false })
					.limit(10);

				// Fetch translations for these movies if not already fetched
				const newMovieIds =
					genreMoviesData
						?.map((m) => m.id)
						.filter((id) => !translationsMap.has(id)) || [];

				if (newMovieIds.length > 0) {
					const { data: newTranslations } = await supabase
						.from('movie_translations')
						.select('movie_id, title, poster_url, language_code')
						.eq('language_code', locale)
						.in('movie_id', newMovieIds);

					newTranslations?.forEach((translation) => {
						translationsMap.set(translation.movie_id, translation);
					});
				}

				genreMovies[genre.id] = (genreMoviesData || []).map(transformMovieData);
			} else {
				genreMovies[genre.id] = [];
			}
		}

		return { latest, topRated, comingSoon, genres, genreMovies };
	} catch (error) {
		console.error('Error fetching movies data:', error);
		return {
			latest: [],
			topRated: [],
			comingSoon: [],
			genres: [],
			genreMovies: {},
		};
	}
}

export async function MovieSections({ locale }: { locale: Locale }) {
	const { latest, topRated, comingSoon, genres, genreMovies } =
		await getMoviesData(locale);
	const t = await getTranslations('movies');

	return (
		<div className="space-y-12">
			{comingSoon.length > 0 && (
				<MovieSlider
					title={t('comingSoon')}
					movies={comingSoon}
					locale={locale}
					viewAllHref={`/movies/coming-soon`}
				/>
			)}
			<MovieSlider
				title={t('latestReleases')}
				movies={latest}
				locale={locale}
			/>
			<MovieSlider title={t('topRated')} movies={topRated} locale={locale} />

			{genres
				.map(
					(genre) =>
						genreMovies[genre.id]?.length > 0 && (
							<MovieSlider
								key={genre.id}
								title={genre.name}
								movies={genreMovies[genre.id] || []}
								viewAllHref={`/genres/${genre.slug}`}
								locale={locale}
							/>
						)
				)
				.slice(0, 5)}
		</div>
	);
}
