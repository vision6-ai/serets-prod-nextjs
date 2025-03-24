'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
	Dialog as DialogRoot,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, Ticket, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MovieShow {
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

interface ProcessedShows {
	[date: string]: MovieShow[];
}

interface TicketBookingProps {
	movieId: string;
	movieTitle: string;
	posterUrl: string | null;
	isRtl?: boolean;
	countitPid: string;
}

export function TicketBooking({
	movieId,
	movieTitle,
	posterUrl,
	isRtl = false,
	countitPid,
}: TicketBookingProps) {
	const locale = useLocale();
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

	const t = useTranslations('booking') as (key: string) => string;

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

	// Function to process shows data by date
	const processShows = (shows: MovieShow[]) => {
		const processed: ProcessedShows = {};

		shows.forEach((show) => {
			const date = format(new Date(show.day), 'yyyyMMdd');
			if (!processed[date]) {
				processed[date] = [];
			}
			processed[date].push(show);
		});

		// Sort shows by time for each date
		Object.keys(processed).forEach((date) => {
			processed[date].sort((a, b) => a.time.localeCompare(b.time));
		});

		return processed;
	};

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
			console.log('✅ [API Response] Shows data:', {
				success: data.success,
				showsCount: data.data?.length || 0,
				timestamp: new Date().toISOString(),
			});

			if (!data.success || !Array.isArray(data.data)) {
				throw new Error(data.error || 'Invalid response format');
			}

			// Filter out shows with past dates
			const now = new Date();
			const filteredShows = data.data.filter((show: MovieShow) => {
				const showDate = new Date(show.day);
				return showDate >= now;
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
		} else {
			// Reset states when dialog is closed
			setSelectedCity(null);
			setSelectedDate(null);
			setSelectedShow(null);
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
			setShowIframe(true);
		}
	};

	const handleCityChange = (value: string) => {
		setSelectedCity(value);
		setSelectedDate(null);
		setSelectedShow(null);
	};

	const handleDateChange = (value: string) => {
		const year = value.substring(0, 4);
		const month = value.substring(4, 6);
		const day = value.substring(6, 8);
		const newDate = new Date(`${year}-${month}-${day}`);
		setSelectedDate(newDate);
		setSelectedShow(null);
	};

	const handleShowSelection = (value: string) => {
		const dateKey = selectedDate ? format(selectedDate, 'yyyyMMdd') : '';
		const availableShows = processedShows[dateKey] || [];
		const show = availableShows.find(
			(s) => s.showtime_pid.toString() === value
		);
		setSelectedShow(show || null);
	};

	return (
		<>
			<DialogRoot open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						size="lg"
						className={cn(
							'hidden md:flex w-full md:w-auto text-lg gap-2 h-12',
							'transition-all duration-200 hover:scale-105',
							'shadow-lg hover:shadow-xl'
						)}>
						<Ticket className="w-5 h-5" />
						{t('orderTickets')}
					</Button>
				</DialogTrigger>

				<DialogContent
					className={cn(
						'sm:max-w-[600px]',
						showIframe && 'sm:max-w-[900px] h-[80vh]'
					)}>
					{!showIframe ? (
						<>
							<DialogHeader className="space-y-4">
								<div className="flex items-center gap-2">
									<DialogClose asChild>
										<Button variant="ghost" size="icon" className="shrink-0">
											<ChevronLeft className="h-4 w-4" />
											<span className="sr-only">Back</span>
										</Button>
									</DialogClose>
									<DialogTitle className="text-xl flex-1">
										{movieTitle}
									</DialogTitle>
									<Button
										variant="ghost"
										size="icon"
										className="shrink-0"
										onClick={() => fetchMovieShows()}
										disabled={loading || refreshing}>
										<RefreshCw
											className={cn('h-4 w-4', loading && 'animate-spin')}
										/>
										<span className="sr-only">Refresh</span>
									</Button>
								</div>
							</DialogHeader>

							<div className="grid md:grid-cols-[150px,1fr] gap-6 pt-4">
								{/* Movie Poster */}
								<div className="hidden md:block">
									<div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-muted">
										{posterUrl ? (
											<Image
												src={posterUrl}
												alt={movieTitle}
												fill
												className="object-cover"
											/>
										) : (
											<div className="absolute inset-0 flex items-center justify-center p-4 text-center text-muted-foreground">
												<span>{movieTitle}</span>
											</div>
										)}
									</div>
								</div>

								{/* Booking Form */}
								<div className="space-y-6">
									{/* Loading and Error States */}
									{loading && (
										<div className="text-center text-muted-foreground">
											Loading showtimes...
										</div>
									)}
									{error && (
										<div className="text-center text-red-500">{error}</div>
									)}

									{/* City Selection */}
									<div className="space-y-2">
										<label className="block text-sm font-medium mb-1">
											{t('selectCity')}
										</label>
										<Select
											value={selectedCity || undefined}
											onValueChange={handleCityChange}
											disabled={availableCities.length === 0 || loading}>
											<SelectTrigger>
												<SelectValue placeholder={t('chooseCity')} />
											</SelectTrigger>
											<SelectContent>
												{availableCities.map((city) => (
													<SelectItem key={city} value={city}>
														{city}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									{selectedCity && (
										<>
											{/* Date Selection */}
											<div className="space-y-2">
												<label className="block text-sm font-medium mb-1">
													{t('selectDate')}
												</label>
												<Select
													value={
														selectedDate
															? format(selectedDate, 'yyyyMMdd')
															: undefined
													}
													onValueChange={handleDateChange}
													disabled={
														Object.keys(processedShows).length === 0 || loading
													}>
													<SelectTrigger>
														<SelectValue placeholder={t('chooseDate')} />
													</SelectTrigger>
													<SelectContent>
														{Object.keys(processedShows)
															.sort()
															.map((dateStr) => {
																const year = dateStr.substring(0, 4);
																const month = dateStr.substring(4, 6);
																const day = dateStr.substring(6, 8);
																const date = new Date(
																	`${year}-${month}-${day}`
																);
																return (
																	<SelectItem key={dateStr} value={dateStr}>
																		{format(date, 'EEEE, MMMM d')}
																	</SelectItem>
																);
															})}
													</SelectContent>
												</Select>
											</div>

											{/* Show Selection */}
											<div className="space-y-2">
												<label className="block text-sm font-medium mb-1">
													{t('selectTime')}
												</label>
												<Select
													value={selectedShow?.showtime_pid.toString()}
													onValueChange={handleShowSelection}
													disabled={!selectedDate || loading}>
													<SelectTrigger className="w-full h-[80px]">
														<SelectValue
															placeholder={t('chooseTime')}
															className="text-base"
														/>
													</SelectTrigger>
													<SelectContent className="w-[400px] max-h-[400px]">
														{selectedDate &&
															processedShows[
																format(selectedDate, 'yyyyMMdd')
															]?.map((show) => (
																<SelectItem
																	key={show.showtime_pid}
																	value={show.showtime_pid.toString()}
																	className="py-3 h-[90px]">
																	<div className="flex flex-col gap-2 w-full">
																		<div className="text-sm font-medium text-left line-clamp-2">
																			<span className="text-base font-medium pr-2">
																				{show.time.substring(0, 5)}
																			</span>
																			{show.movie_name}
																		</div>
																		<div className="flex justify-between items-center gap-4">
																			<span className="text-xs text-muted-foreground">
																				{show.city} - {show.cinema}
																			</span>
																		</div>
																	</div>
																</SelectItem>
															))}
													</SelectContent>
												</Select>
											</div>

											<Button
												className="w-full h-12 text-lg mt-8"
												disabled={!selectedShow || loading}
												onClick={handleBooking}>
												{loading ? 'Loading...' : t('bookNow')}
											</Button>
										</>
									)}
								</div>
							</div>
						</>
					) : (
						<div className="relative h-full">
							<div className="absolute top-2 left-2 z-10">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setShowIframe(false)}
									className="bg-white/90 hover:bg-white shadow-md">
									<ChevronLeft className="h-4 w-4" />
									<span className="sr-only">Back to showtimes</span>
								</Button>
							</div>
							{selectedShow && (
								<iframe
									src={selectedShow.deep_link}
									className="w-full h-full rounded-lg"
									allow="payment"
									title="Ticket Booking"
								/>
							)}
						</div>
					)}
				</DialogContent>
			</DialogRoot>

			{/* Mobile Sticky Button */}
			<div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t z-50">
				<Button
					size="default"
					className={cn(
						'w-full gap-2 h-10',
						'transition-all duration-300',
						'shadow-lg',
						'bg-gradient-to-r from-[#EE9FF7] to-[#FC660C] hover:brightness-105 text-white'
					)}
					onClick={() => setOpen(true)}>
					<Ticket className="w-4 h-4" />
					{t('orderTickets')}
				</Button>
			</div>
		</>
	);
}
