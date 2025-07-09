'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { MovieActions } from './movie-actions';
import { MovieSlider } from './movie-slider';
import { CastCarousel } from './cast-carousel';
import { TicketBooking } from '.';
import type { Movie } from '@/types/movie';
import { Locale } from '@/config/i18n';
import { useTranslations } from 'next-intl';
import MovieAffiliateWebsite from '@/components/ui/movie-affiliate-website';

interface MovieContentProps {
	movie: Movie & {
		poster_url: string | null;
		backdrop_url: string | null;
		trailer_url: string | null;
	};
	videos: {
		id: string;
		title: string | null;
		url: string;
		type: 'trailer' | 'clip' | 'featurette';
	}[];
	cast: {
		id: string;
		name: string;
		hebrew_name: string | null;
		slug: string;
		photo_url: string | null;
		role: string | null;
		order: number | null;
	}[];
	genres: {
		id: string;
		name: string;
		hebrew_name: string | null;
		slug: string;
	}[];
	awards: {
		id: string;
		name: string;
		category: string;
		year: number;
		is_winner: boolean;
	}[];
	similarMovies: Movie[];
	locale: string;
	countitPid: string;
}

export function MovieContent({
	movie,
	videos,
	cast,
	genres,
	awards,
	similarMovies,
	locale,
	countitPid,
}: MovieContentProps) {
	const { user } = useAuth();
	const trailer = videos.find((v) => v.type === 'trailer');
	const isRtl = locale === 'he';
	const t = useTranslations('movies');

	console.log(
		`🎬 MovieContent: Received ${
			similarMovies?.length || 0
		} similarMovies/recommendations`
	);

	// Transform data for MovieAffiliateWebsite
	const transformedMovie = {
		id: parseInt(movie.id),
		title: movie.title,
		title_he: movie.hebrew_title,
		poster_path_en: movie.poster_url,
		poster_path_he: movie.poster_url, // Using the same URL for both languages
		backdrop_path: movie.backdrop_url || '/placeholder-backdrop.jpg',
		overview: movie.synopsis || '',
		overview_he: movie.synopsis || '', // You can add Hebrew synopsis if available
		release_date: movie.release_date || '',
		vote_average: movie.rating || 0,
		runtime: movie.duration || 0,
		trailer_url: trailer?.url || movie.trailer_url,
		videos: videos.map(video => ({
			id: video.id,
			name: video.title || '',
			name_he: video.title || '', // Add Hebrew title if available
			key: video.id,
			type: video.type as 'Trailer' | 'Teaser' | 'Clip' | 'Behind the Scenes',
			thumbnail: movie.poster_url || '/placeholder-poster.jpg',
			duration: 180 // Default duration in seconds
		})),
		cast: cast.map(member => ({
			id: parseInt(member.id),
			name: member.name,
			name_he: member.hebrew_name,
			character: member.role || '',
			character_he: member.role || '', // Add Hebrew character name if available
			profile_path: member.photo_url || '/placeholder-avatar.jpg',
			order: member.order || 0
		})),
		keywords: genres.map(genre => ({
			id: parseInt(genre.id),
			name: genre.name,
			name_he: genre.hebrew_name
		}))
	};

	// Transform recommended movies
	const transformedRecommendedMovies = similarMovies.map(similarMovie => ({
		id: parseInt(similarMovie.id),
		title: similarMovie.title,
		title_he: similarMovie.hebrew_title,
		poster_path: similarMovie.poster_url || '/placeholder-poster.jpg',
		backdrop_path: '/placeholder-backdrop.jpg',
		vote_average: similarMovie.rating || 0,
		release_date: similarMovie.release_date || '',
		genre: 'Movie' // Default genre
	}));

	// Create default showtimes data
	const defaultShowtimes = {
		theaters: [
			{
				id: 1,
				name: "Cinema City",
				name_he: "סינמה סיטי",
				logo: "🎬",
				distance: 2.5,
				showtimes: ["14:30", "17:00", "20:30", "23:00"],
				availability: 85
			},
			{
				id: 2,
				name: "Yes Planet",
				name_he: "יס פלאנט",
				logo: "🎭",
				distance: 8.2,
				showtimes: ["15:00", "18:15", "21:45"],
				availability: 92
			}
		],
		dates: [
			new Date(),
			new Date(Date.now() + 86400000),
			new Date(Date.now() + 172800000),
			new Date(Date.now() + 259200000),
			new Date(Date.now() + 345600000)
		]
	};

	return (
		<MovieAffiliateWebsite
			movie={transformedMovie}
			showtimes={defaultShowtimes}
			locale={locale as "en" | "he"}
		/>
	);
}
