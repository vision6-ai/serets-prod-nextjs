'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
	Dialog,
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
import { ChevronLeft, Ticket } from 'lucide-react';
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
	biggerMovieId: string;
}

export function TicketBooking({
	movieId,
	movieTitle,
	posterUrl,
	isRtl = false,
	biggerMovieId,
}: TicketBookingProps) {
	const locale = useLocale();
	const [open, setOpen] = useState(false);
	const [showIframe, setShowIframe] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedShow, setSelectedShow] = useState<MovieShow | null>(null);
	const [movieShows, setMovieShows] = useState<MovieShow[]>([]);
	const [processedShows, setProcessedShows] = useState<ProcessedShows>({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [buttonAnimated, setButtonAnimated] = useState(false);

	const t = useTranslations('booking') as (key: string) => string;

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

	useEffect(() => {
		const fetchMovieShows = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await fetch(
					`/api/movieshows?moviepid=${biggerMovieId}`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch movie shows');
				}

				const data = await response.json();
				if (!data.success) {
					throw new Error(data.error || 'Failed to fetch movie shows');
				}

				setMovieShows(data.data);
				const processed = processShows(data.data);
				setProcessedShows(processed);
				console.log('Processed Shows:', processed);
			} catch (error) {
				console.error('Error fetching movie shows:', error);
				setError((error as Error).message);
			} finally {
				setLoading(false);
			}
		};

		if (open && biggerMovieId) {
			fetchMovieShows();
		}
	}, [selectedTheater, biggerMovieId]);

	// Animation timeout for mobile sticky button
	useEffect(() => {
		const animationTimer = setTimeout(() => {
			setButtonAnimated(true);
		}, 3000); // Animate after 3 seconds

		return () => {
			clearTimeout(animationTimer);
		};
	}, []);

	// Generate available dates from processed events
	const dates = Object.keys(processedEvents)
		.map((dateStr) => {
			const year = dateStr.substring(0, 4);
			const month = dateStr.substring(4, 6);
			const day = dateStr.substring(6, 8);
			const date = new Date(`${year}-${month}-${day}`);
			return {
				value: dateStr,
				label: format(date, 'EEEE, MMMM d'),
			};
		})
		.sort((a, b) => a.value.localeCompare(b.value));

	const handleBooking = () => {
		if (selectedShow) {
			// Open the booking URL directly instead of using an iframe
			window.open(selectedShow.deep_link, '_blank');
			setOpen(false);
		}
	};

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						size="lg"
						className={cn(
							'w-full md:w-auto text-lg gap-2 h-12',
							'transition-all duration-200 hover:scale-105',
							'shadow-lg hover:shadow-xl',
							'hidden md:flex'
						)}>
						<Ticket className="w-5 h-5" />
						{t('orderTickets')}
					</Button>
				</DialogTrigger>

			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader className="space-y-4">
					<div className="flex items-center gap-2">
						<DialogClose asChild>
							<Button variant="ghost" size="icon" className="shrink-0">
								<ChevronLeft className="h-4 w-4" />
								<span className="sr-only">Back</span>
							</Button>
						</DialogClose>
						<DialogTitle className="text-xl">{movieTitle}</DialogTitle>
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

			{/* Mobile Sticky Button */}
			<div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t z-50">
				<Button
					size="default"
					className={cn(
						'w-full gap-2 h-10',
						'transition-all duration-300',
						'shadow-lg',
						'bg-gradient-to-r from-[#EE9FF7] to-[#FC660C] hover:brightness-105 text-white',
						buttonAnimated && 'animate-attention'
					)}
					onClick={() => setOpen(true)}>
					<Ticket className="w-4 h-4" />
					{t('orderTickets')}
				</Button>
			</div>

			{/* Booking Iframe Dialog */}
			<Dialog open={showIframe} onOpenChange={setShowIframe}>
				<DialogContent className="sm:max-w-[900px] sm:h-[800px] p-0">
					<DialogHeader className="p-4 pb-0">
						<div className="flex items-center justify-between">
							<DialogTitle className="text-xl">{movieTitle}</DialogTitle>
							<DialogClose asChild>
								<Button variant="ghost" size="icon" className="shrink-0">
									<ChevronLeft className="h-4 w-4" />
									<span className="sr-only">Close</span>
								</Button>
							</DialogClose>
						</div>
					</DialogHeader>
					<div className="h-full">
						{selectedTheater && selectedTime && (
							<iframe
								src={`https://ecom.biggerpicture.ai/site/${
									selectedTheater.bigger_id
								}/tickets?languageId=${
									locale === 'he' ? 'he-IL' : 'en-US'
								}&saleChannelCode=WEB&code=${selectedTime.eventCode}`}
								className="w-full h-[700px] border-0"
								allow="payment"
							/>
						)}
						{error && <div className="text-center text-red-500">{error}</div>}

						{/* Date Selection */}
						<div className="space-y-2">
							<label className="block text-sm font-medium mb-1">
								{t('selectDate')}
							</label>
							<Select
								value={
									selectedDate ? format(selectedDate, 'yyyyMMdd') : undefined
								}
								onValueChange={(value) => {
									const year = value.substring(0, 4);
									const month = value.substring(4, 6);
									const day = value.substring(6, 8);
									setSelectedDate(new Date(`${year}-${month}-${day}`));
									setSelectedShow(null); // Reset selected show when date changes
								}}
								disabled={Object.keys(processedShows).length === 0 || loading}>
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
											const date = new Date(`${year}-${month}-${day}`);
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
								onValueChange={(value) => {
									const dateKey = selectedDate
										? format(selectedDate, 'yyyyMMdd')
										: '';
									const availableShows = processedShows[dateKey] || [];
									setSelectedShow(
										availableShows.find(
											(s) => s.showtime_pid.toString() === value
										) || null
									);
								}}
								disabled={!selectedDate || loading}>
								<SelectTrigger>
									<SelectValue placeholder={t('chooseTime')} />
								</SelectTrigger>
								<SelectContent>
									{selectedDate &&
										processedShows[format(selectedDate, 'yyyyMMdd')]?.map(
											(show) => (
												<SelectItem
													key={show.showtime_pid}
													value={show.showtime_pid.toString()}>
													<div className="flex justify-between items-center gap-4">
														<span>{show.time}</span>
														<div className="text-xs text-muted-foreground">
															{show.cinema} - {show.city}
														</div>
													</div>
												</SelectItem>
											)
										)}
								</SelectContent>
							</Select>
						</div>

						{/* Additional Show Information */}
						{selectedShow && (
							<div className="text-sm text-muted-foreground">
								<p>Cinema: {selectedShow.cinema}</p>
								<p>Available Seats: {selectedShow.available_seats}</p>
								<p>Chain: {selectedShow.chain}</p>
							</div>
						)}

						{/* Book Button */}
						<Button
							className="w-full h-12 text-lg mt-8"
							disabled={!selectedShow || loading}
							onClick={handleBooking}>
							{loading ? 'Loading...' : t('bookNow')}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
