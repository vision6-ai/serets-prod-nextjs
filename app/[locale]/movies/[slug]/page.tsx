import { MovieContent } from '@/components/movies/movie-content';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Database } from '@/types/supabase';
import { Locale } from '@/config/i18n';
import { unstable_setRequestLocale } from 'next-intl/server';
import type { Movie } from '@/types/movie';
import { getRecommendedMovies } from '@/lib/recommendations';

export const revalidate = 3600;

// Helper function to get localized field
function getLocalizedField(enField: string | null, heField: string | null, locale: Locale): string | null {
	if (locale === 'he' && heField) return heField;
	return enField || heField;
}

async function getMovieData(slug: string, locale: Locale) {
	const supabase = createClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	);

	// Fetch the movie data with bilingual fields
	// Try to find by slug first, then fall back to other identifiers
	let { data: movie, error: movieError } = await supabase
		.from('movies')
		.select(`
			id, slug, release_date, runtime, vote_average, countit_pid,
			title_en, title_he, overview_en, overview_he,
			poster_path_en, poster_path_he, backdrop_path,
			tagline_en, tagline_he, israeli_release_date
		`)
		.eq('slug', slug)
		.single();

	// If slug lookup failed, try other identifiers
	if (movieError && movieError.code === 'PGRST116') {
		console.log('Movie not found by slug, trying other identifiers...');
		
		// Try to find by countit_pid (if slug looks like a PID)
		const { data: movieByPid, error: pidError } = await supabase
			.from('movies')
			.select(`
				id, slug, release_date, runtime, vote_average, countit_pid,
				title_en, title_he, overview_en, overview_he,
				poster_path_en, poster_path_he, backdrop_path,
				tagline_en, tagline_he, israeli_release_date
			`)
			.eq('countit_pid', slug)
			.single();

		if (!pidError && movieByPid) {
			movie = movieByPid;
			movieError = null;
		} else {
			// Try to find by ID (if slug is numeric)
			const numericId = parseInt(slug);
			if (!isNaN(numericId)) {
				const { data: movieById, error: idError } = await supabase
					.from('movies')
					.select(`
						id, slug, release_date, runtime, vote_average, countit_pid,
						title_en, title_he, overview_en, overview_he,
						poster_path_en, poster_path_he, backdrop_path,
						tagline_en, tagline_he, israeli_release_date
					`)
					.eq('id', numericId)
					.single();

				if (!idError && movieById) {
					movie = movieById;
					movieError = null;
				}
			}
		}
	}

	if (movieError || !movie) {
		console.error('Error fetching movie:', movieError);
		return null;
	}

	// Fetch additional data in parallel
	const [videosRes, castRes, movieGenresRes] = await Promise.all([
		supabase.from('movie_videos').select('*').eq('movie_id', movie.id),

		supabase
			.from('movie_credits')
			.select(`
				id, character_name, credit_order, credit_type,
				person_id,
				people:people!inner(
					id, name_en, name_he, profile_path, slug
				)
			`)
			.eq('movie_id', movie.id)
			.eq('credit_type', 'cast')
			.order('credit_order', { ascending: true }),

		supabase
			.from('movie_genres')
			.select(`
				genre_id,
				genres:genres!inner(
					id, name_en, name_he
				)
			`)
			.eq('movie_id', movie.id),
	]);

	// Find main trailer from videos
	const mainTrailer = videosRes.data?.find(video => 
		video.video_type === 'Trailer' && video.official === true
	) || videosRes.data?.[0];

	// Create movie with localized fields
	const movieWithTranslations = {
		id: movie.id,
		slug: movie.slug,
		release_date: movie.release_date || movie.israeli_release_date,
		duration: movie.runtime,
		rating: movie.vote_average,
		title: getLocalizedField(movie.title_en, movie.title_he, locale) || movie.slug,
		hebrew_title: movie.title_he || movie.title_en || movie.slug,
		synopsis: getLocalizedField(movie.overview_en, movie.overview_he, locale),
		poster_url: getLocalizedField(movie.poster_path_en, movie.poster_path_he, locale),
		backdrop_url: movie.backdrop_path,
		trailer_url: mainTrailer ? `https://www.youtube.com/watch?v=${mainTrailer.video_key}` : null,
		countit_pid: movie.countit_pid,
	} as Movie & {
		poster_url: string | null;
		backdrop_url: string | null;
		trailer_url: string | null;
	};

	// Process cast data (already includes people data from join)
	const cast = (castRes.data || [])
		.map((castMember: any) => {
			const person = castMember.people;
			if (!person) return null;

			return {
				id: castMember.person_id,
				role: castMember.character_name,
				order: castMember.credit_order || 999,
				character_name: castMember.character_name,
				actor: {
					id: person.id,
					name: getLocalizedField(person.name_en, person.name_he, locale) || person.slug,
					slug: person.slug,
					birth_date: null, // Not available in this query
					birth_place: null, // Not available in this query
					photo_url: person.profile_path,
				},
			};
		})
		.filter(Boolean);

	// Process genres data (already includes genres data from join)
	const genres = (movieGenresRes.data || [])
		.map((genreData: any) => {
			const genre = genreData.genres;
			if (!genre) return null;

			return {
				id: genreData.genre_id,
				genre: {
					id: genre.id,
					name: getLocalizedField(genre.name_en, genre.name_he, locale) || `Genre ${genre.id}`,
					slug: genre.id.toString(), // Using id as slug since we don't have slug in genres table
				},
			};
		})
		.filter(Boolean);

	// Awards functionality removed - table doesn't exist in current schema
	const awards: any[] = [];

	// Fetch recommended movies 
	const recommendedMovies = await getRecommendedMovies(movie.id, locale, 10);
	console.log(`📌 Movie page (${slug}): Got ${recommendedMovies.length} recommended movies`);

	return {
		movie: movieWithTranslations,
		videos: videosRes.data || [],
		cast: cast.filter(Boolean).map((item) => ({
			id: item!.id,
			name: item!.actor.name,
			hebrew_name: null, // We don't have this field yet
			slug: item!.actor.slug,
			photo_url: item!.actor.photo_url,
			role: item!.role,
			order: item!.order || 999 // Use a high default if order is missing
		})),
		genres: genres.filter(Boolean).map((item) => ({
			id: item!.id,
			name: item!.genre.name,
			hebrew_name: null, // We'll add this when we have separate he/en fields
			slug: item!.genre.slug,
		})),
		awards: awards, // Empty array for now
		similarMovies: recommendedMovies,
	};
}

export default async function MoviePage({
	params,
}: {
	params: { slug: string; locale: Locale };
}) {
	// This is critical for server components to work with next-intl
	unstable_setRequestLocale(params.locale);

	const data = await getMovieData(params.slug, params.locale);

	if (!data) {
		notFound();
	}

	// Pass all props directly to MovieContent
	return (
		<MovieContent
			movie={data.movie}
			videos={data.videos}
			cast={data.cast}
			genres={data.genres}
			awards={data.awards}
			similarMovies={data.similarMovies}
			locale={params.locale}
			countitPid={data.movie.countit_pid ?? ''}
		/>
	);
}
