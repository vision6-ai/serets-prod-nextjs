import { Locale } from '@/config/i18n';

export interface MovieShow {
	id: number;
	moviepid: number;
	showtime_pid: number;
	movie_name: string;
	movie_english: string;
	banner: string;
	genres: string;
	day: string;
	time: string;
	cinema: string;
	city: string;
	chain: string;
	available_seats: number;
	deep_link: string;
	imdbid: string;
}

export interface ProcessedShows {
	[date: string]: MovieShow[];
}

export interface TicketBookingProps {
	movieId: string;
	movieTitle: string;
	posterUrl: string | null;
	isRtl?: boolean;
	countitPid: string;
}

export interface BookingFormProps {
	selectedCity: string | null;
	availableCities: string[];
	selectedDate: Date | null;
	processedShows: ProcessedShows;
	selectedShow: MovieShow | null;
	loading: boolean;
	error: string | null;
	onCityChange: (value: string) => void;
	onDateChange: (value: string) => void;
	onShowSelection: (value: string) => void;
	onBooking: () => void;
	t: (key: string) => string;
	locale?: Locale;
	isRtl?: boolean;
}

export interface MoviePosterProps {
	posterUrl: string | null;
	movieTitle: string;
}

export interface BookingIframeProps {
	selectedShow: MovieShow | null;
	onBack: () => void;
}
