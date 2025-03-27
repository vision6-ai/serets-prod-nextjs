import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { MovieShow, ProcessedShows } from './types';
import { log } from 'node:console';

export function useBooking(countitPid: string) {
	const [open, setOpen] = useState(false);
	const [showIframe, setShowIframe] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedShow, setSelectedShow] = useState<MovieShow | null>(null);
	const [selectedCity, setSelectedCity] = useState<string | null>(null);
	const [availableCities, setAvailableCities] = useState<string[]>([]);
	const [movieShows, setMovieShows] = useState<MovieShow[]>([]);
	const [processedShows, setProcessedShows] = useState<ProcessedShows>({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	// Function to process shows data by date
	const processShows = (shows: MovieShow[]) => {
		console.log('🎬 [Processing] Raw movie shows data:', shows);
		const processed: ProcessedShows = {};

		shows.forEach((show) => {
			const date = format(new Date(show.day), 'yyyyMMdd');
			if (!processed[date]) {
				processed[date] = [];
			}
			processed[date].push(show);
			console.log(
				`🎟️ [Show Details] Date: ${show.day}, Cinema: ${show.cinema}, Time: ${show.time}, ShowID: ${show.showtime_pid}`
			);
		});

		// Sort shows by time for each date
		Object.keys(processed).forEach((date) => {
			processed[date].sort((a, b) => a.time.localeCompare(b.time));
		});

		console.log('🗓️ [Processing] Processed shows by date:', processed);
		return processed;
	};

	// Function to fetch available cities
	const fetchCities = useCallback(async () => {
		console.log('🎯 [API Call] Fetching cities for movie:', {
			moviepid: countitPid,
			timestamp: new Date().toISOString(),
		});

		try {
			const response = await fetch(`/api/movieshows?moviepid=${countitPid}`);
			if (!response.ok) {
				console.error('❌ [API Error] Failed to fetch cities:', {
					status: response.status,
					statusText: response.statusText,
				});
				throw new Error('Failed to fetch cities');
			}
			const data = await response.json();
			console.log('✅ [API Response] Cities data:', {
				success: data.success,
				citiesCount: data.data?.length || 0,
				timestamp: new Date().toISOString(),
				rawData: data,
			});

			if (!data.success) {
				throw new Error(data.error || 'Invalid response format');
			}

			// The API already returns an array of distinct cities
			const cities = (data.data as string[]).sort();

			console.log('📍 [Processing] Unique cities:', {
				cities,
				count: cities.length,
			});

			setAvailableCities(cities);

			// Check if user's preferred city is available for this movie
			if (typeof window !== 'undefined' && cities.length > 0) {
				const savedCity = localStorage.getItem('selectedCity');
				if (savedCity && cities.includes(savedCity)) {
					console.log(
						'🎯 [Auto-select] Using saved city preference:',
						savedCity
					);
					setSelectedCity(savedCity);
					return;
				}
			}

			// Auto-select city if only one available
			if (cities.length === 1) {
				console.log('🎯 [Auto-select] Single city available:', cities[0]);
				setSelectedCity(cities[0]);
			}
		} catch (error) {
			console.error('❌ [API Error] Error fetching cities:', error);
			setError((error as Error).message);
		}
	}, [countitPid]);

	const fetchMovieShows = useCallback(async () => {
		if (!selectedCity) return;

		console.log('🎯 [API Call] Fetching movie shows:', {
			moviepid: countitPid,
			city: selectedCity,
			refreshing,
			timestamp: new Date().toISOString(),
		});

		setLoading(true);
		setError(null);
		try {
			if (!countitPid) {
				throw new Error('No movie ID provided');
			}

			// First, trigger a refresh of the data from the external API
			if (!refreshing) {
				console.log('🔄 [API Call] Triggering data refresh');
				setRefreshing(true);
				// const refreshResponse = await fetch('/api/movieshows?fetchAll=true');
				console.log(
					'✅ [API Response] Refresh status:'
					// refreshResponse.status
				);
				setRefreshing(false);
			}

			// Then fetch the latest data for this movie and city
			console.log('🎯 [API Call] Fetching filtered shows:', {
				moviepid: countitPid,
				city: selectedCity,
			});

			const response = await fetch(
				`/api/movieshows?moviepid=${countitPid}&city=${encodeURIComponent(
					selectedCity
				)}`
			);

			if (!response.ok) {
				const errorData = await response.json();
				console.error('❌ [API Error] Failed to fetch shows:', {
					status: response.status,
					error: errorData,
				});
				throw new Error(errorData.details || 'Failed to fetch movie shows');
			}

			const data = await response.json();
			console.log('✅ [API Response] Complete shows data:', data);
			console.log('✅ [API Response] Shows summary:', {
				success: data.success,
				showsCount: data.data?.length || 0,
				timestamp: new Date().toISOString(),
			});

			if (!data.success || !Array.isArray(data.data)) {
				throw new Error(data.error || 'Invalid response format');
			}

			// Log detailed cinema information
			if (data.data && data.data.length > 0) {
				const cinemas = new Set(
					data.data.map((show: MovieShow) => show.cinema)
				);
				console.log('🏢 [Cinemas] Available cinemas:', {
					count: cinemas.size,
					cinemas: Array.from(cinemas),
				});

				// Group shows by cinema
				const showsByCinema: Record<string, MovieShow[]> = {};
				data.data.forEach((show: MovieShow) => {
					if (!showsByCinema[show.cinema]) {
						showsByCinema[show.cinema] = [];
					}
					showsByCinema[show.cinema].push(show);
				});

				Object.keys(showsByCinema).forEach((cinema) => {
					console.log(`🎬 [Cinema Details] ${cinema}:`, {
						totalShows: showsByCinema[cinema].length,
						days: new Set(showsByCinema[cinema].map((show) => show.day)).size,
					});
				});
			}

			// Filter out shows with past dates
			const now = new Date();

			const filteredShows = data.data.filter((show: MovieShow) => {
				try {
					// Parse the date and time components
					const showDay = show.day; // ISO format date
					const showTime = show.time; // HH:mm:ss format

					// Create a combined date-time object
					const combinedDateTime = new Date(
						`${showDay.split('T')[0]}T${showTime}+00:00`
					);

					// Convert to local timezone (Israel)
					const showDateTimeLocal = new Date(
						combinedDateTime.toLocaleString('en-US', {
							timeZone: 'Asia/Jerusalem',
						})
					);

					// Check if the show is in the future
					const isInFuture = showDateTimeLocal >= now;

					console.log('🕒 [DateTime Comparison]', {
						showDay,
						showTime,
						combinedDateTime: combinedDateTime.toISOString(),
						showDateTimeLocal: showDateTimeLocal.toISOString(),
						currentTime: now.toISOString(),
						isInFuture,
					});

					return isInFuture;
				} catch (error) {
					console.error('❌ [Date parsing error]:', {
						error: (error as Error).message,
						showData: {
							day: show.day,
							time: show.time,
						},
					});

					// Fallback to just comparing dates if there's an error
					const showDate = new Date(show.day);
					return showDate >= now;
				}
			});

			console.log('📍 [Processing] Filtered shows:', {
				total: data.data.length,
				filtered: filteredShows.length,
				removed: data.data.length - filteredShows.length,
			});

			if (filteredShows.length === 0) {
				console.log('⚠️ [Warning] No upcoming shows available');
				setError('No upcoming shows available');
				setMovieShows([]);
				setProcessedShows({});
				return;
			}

			setMovieShows(filteredShows);
			const processed = processShows(filteredShows);
			setProcessedShows(processed);

			// Auto-select the earliest date if none is selected
			if (!selectedDate && Object.keys(processed).length > 0) {
				const earliestDate = new Date(
					Object.keys(processed)[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
				);
				console.log(
					'🎯 [Auto-select] Earliest date:',
					earliestDate.toISOString()
				);
				setSelectedDate(earliestDate);
			}
		} catch (error) {
			console.error('❌ [API Error] Error in fetchMovieShows:', error);
			setError((error as Error).message);
			setMovieShows([]);
			setProcessedShows({});
		} finally {
			setLoading(false);
		}
	}, [countitPid, selectedCity, refreshing, selectedDate]);

	useEffect(() => {
		if (open && countitPid) {
			fetchCities();

			// Try to load the saved city from localStorage when the dialog opens
			if (typeof window !== 'undefined') {
				const savedCity = localStorage.getItem('selectedCity');
				if (savedCity) {
					// We'll set it after we confirm it's available for this movie
					console.log('Found saved city preference:', savedCity);
				}
			}
		} else {
			// Reset states when dialog is closed, but keep selectedShow
			setSelectedCity(null);
			setSelectedDate(null);
			setMovieShows([]);
			setProcessedShows({});
			setError(null);
		}
	}, [open, countitPid, fetchCities]);

	// Fetch shows when city is selected
	useEffect(() => {
		if (selectedCity) {
			fetchMovieShows();
		}
	}, [selectedCity, fetchMovieShows]);

	const handleBooking = () => {
		if (selectedShow) {
			console.log('🎟️ [Booking] Selected show details:', {
				show: selectedShow,
				cinema: selectedShow.cinema,
				date: selectedShow.day,
				time: selectedShow.time,
				showtime_pid: selectedShow.showtime_pid,
			});
			// Close dialog on mobile when opening iframe
			if (typeof window !== 'undefined' && window.innerWidth < 768) {
				setOpen(false);
			}
			setShowIframe(true);
		}
	};

	const handleIframeClose = () => {
		setShowIframe(false);
		setOpen(false);
		// Don't reset selectedShow here to maintain the state
	};

	const handleCityChange = (value: string) => {
		console.log('🌆 [City Change] Selected city:', value);
		setSelectedCity(value);
		setSelectedDate(null);
		setSelectedShow(null);

		// Save city preference to localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem('selectedCity', value);
			console.log('💾 [Storage] Saved city preference:', value);
		}
	};

	const handleDateChange = (value: string) => {
		const year = value.substring(0, 4);
		const month = value.substring(4, 6);
		const day = value.substring(6, 8);
		const newDate = new Date(`${year}-${month}-${day}`);
		console.log('📅 [Date Change] Selected date:', {
			dateString: value,
			formattedDate: `${year}-${month}-${day}`,
			dateObject: newDate.toISOString(),
		});
		setSelectedDate(newDate);
		setSelectedShow(null);
	};

	const handleShowSelection = (value: string) => {
		const dateKey = selectedDate ? format(selectedDate, 'yyyyMMdd') : '';
		const availableShows = processedShows[dateKey] || [];
		const show = availableShows.find(
			(s) => s.showtime_pid.toString() === value
		);
		console.log('🎞️ [Show Selection] Selected show:', {
			showtimePid: value,
			show,
			cinema: show?.cinema,
			date: show?.day,
			time: show?.time,
		});
		setSelectedShow(show || null);
	};

	return {
		open,
		setOpen,
		showIframe,
		setShowIframe,
		selectedDate,
		selectedShow,
		selectedCity,
		availableCities,
		processedShows,
		loading,
		error,
		refreshing,
		handleBooking,
		handleIframeClose,
		handleCityChange,
		handleDateChange,
		handleShowSelection,
		fetchMovieShows,
	};
}
