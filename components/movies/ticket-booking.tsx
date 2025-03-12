'use client';

import { useState, useEffect } from 'react';
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
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Theater {
	id: string;
	name: string;
	location: string;
	bigger_id: string;
}

interface ShowTime {
	id: string;
	time: string;
	eventCode: string;
	venueName: string;
	bookingUrl: string;
}

interface ProcessedEvents {
	[date: string]: ShowTime[];
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
	const [step, setStep] = useState<'theater' | 'date' | 'time' | 'seats'>(
		'theater'
	);
	const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedTime, setSelectedTime] = useState<ShowTime | null>(null);
	const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
	const [theaters, setTheaters] = useState<Theater[]>([]);
	const [events, setEvents] = useState<any>(null);
	const [processedEvents, setProcessedEvents] = useState<ProcessedEvents>({});

	// Type assertion for the translation function
	const t = useTranslations('booking') as (key: string) => string;

	// Function to process events data
	const processEvents = (eventsData: any) => {
		const processed: ProcessedEvents = {};

		// Check if eventsData is an array
		if (!Array.isArray(eventsData)) {
			console.error('Events data is not an array:', eventsData);
			return processed;
		}

		eventsData.forEach((event) => {
			if (!event || !event.bdf || !event.dtf) {
				console.warn('Invalid event data:', event);
				return;
			}

			const date = event.bdf; // Using bdf as date key (YYYYMMDD format)
			const time = {
				id: event.id?.toString() || '',
				time: event.dtf.split(' ')[1] || '', // Extract time from dtf
				eventCode: event.eventCode || '',
				venueName: event.venueName || '',
				bookingUrl: event.bookingNativeUrl || '',
			};

			if (!processed[date]) {
				processed[date] = [];
			}
			processed[date].push(time);
		});

		// Sort times for each date
		Object.keys(processed).forEach((date) => {
			processed[date].sort((a, b) => a.time.localeCompare(b.time));
		});

		return processed;
	};

	useEffect(() => {
		// Fetch theaters data from Supabase
		const fetchTheaters = async () => {
			const { data, error } = await supabase
				.from('theaters')
				.select('id, name, location, bigger_id');

			if (error) {
				console.error('Error fetching theaters:', error);
			} else {
				setTheaters(data || []);
			}
		};

		fetchTheaters();
	}, []);

	useEffect(() => {
		if (selectedTheater?.bigger_id && biggerMovieId) {
			const fetchEvents = async () => {
				try {
					const response = await fetch(
						`https://pub-api.biggerpicture.ai/mapiAPI/group/events?full=true&siteId=${selectedTheater.bigger_id}&edi=${biggerMovieId}`,
						{
							headers: {
								Authorization:
									'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhY2Nlc3NDb2RlIjoiWVAiLCJpc3MiOiJhdXRoMCIsImxhbmd1YWdlSWQiOjEsImFudGlDU1JGVG9rZW4iOiI5N2Y2MTFiZS1kYTczLTQyNTUtYmE5NC1mNTZiNWJlMGQwODUiLCJzaXRlSWQiOjk5OCwic2FsZUNoYW5uZWxDb2RlIjoiV0VCIiwic2Vzc2lvbklkIjo0NzAyNjAsImV4cCI6MTc0MjM3OTUxMiwidXNlcklkIjo5MSwidW5pcXVlSWQiOjI1ODExMTY4fQ.cLcvDhWAPB9mxu8cSrgCRAilIChcqTw64v41C3l5sts',
								'Content-Type': 'application/json',
							},
						}
					);

					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}

					const data = await response.json();
					console.log('Bigger Picture API Response:', data);

					if (!data) {
						throw new Error('No data received from API');
					}

					setEvents(data.events);
					const processed = processEvents(data.events);
					setProcessedEvents(processed);
					console.log('Processed Events:', processed);
				} catch (error) {
					console.error('Error fetching events:', error);
					setProcessedEvents({});
				}
			};

			fetchEvents();
		}
	}, [selectedTheater, biggerMovieId]);

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
		if (selectedTime && selectedTheater) {
			setShowIframe(true);
		}
	};

	// Use biggerMovieId as needed
	console.log('Bigger Movie ID:', biggerMovieId);

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						size="lg"
						className={cn(
							'w-full md:w-auto text-lg gap-2 h-12',
							'transition-all duration-200 hover:scale-105',
							'shadow-lg hover:shadow-xl'
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

						{/* Booking Form */}
						<div className="space-y-6">
							{/* Theater Selection */}
							<div className="space-y-2">
								<label className="block text-sm font-medium mb-1">
									{t('selectTheater')}
								</label>
								<Select
									value={selectedTheater?.id}
									onValueChange={(value) =>
										setSelectedTheater(
											theaters.find((t) => t.id === value) || null
										)
									}>
									<SelectTrigger>
										<SelectValue placeholder={t('chooseTheater')} />
									</SelectTrigger>
									<SelectContent>
										{theaters.map((theater) => (
											<SelectItem key={theater.id} value={theater.id}>
												<div>
													<div className="font-medium">{theater.name}</div>
													<div className="text-sm text-muted-foreground">
														{theater.location}
													</div>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

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
										setSelectedTime(null); // Reset time when date changes
									}}
									disabled={
										!selectedTheater ||
										Object.keys(processedEvents).length === 0
									}>
									<SelectTrigger>
										<SelectValue placeholder={t('chooseDate')} />
									</SelectTrigger>
									<SelectContent>
										{Object.keys(processedEvents)
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

							{/* Time Selection */}
							<div className="space-y-2">
								<label className="block text-sm font-medium mb-1">
									{t('selectTime')}
								</label>
								<Select
									value={selectedTime?.id}
									onValueChange={(value: string) => {
										const dateKey = selectedDate
											? format(selectedDate, 'yyyyMMdd')
											: '';
										const availableTimes = processedEvents[dateKey] || [];
										setSelectedTime(
											availableTimes.find((t) => t.id === value) || null
										);
									}}
									disabled={!selectedTheater || !selectedDate}>
									<SelectTrigger>
										<SelectValue placeholder={t('chooseTime')} />
									</SelectTrigger>
									<SelectContent>
										{selectedDate &&
											processedEvents[format(selectedDate, 'yyyyMMdd')]?.map(
												(time) => (
													<SelectItem key={time.id} value={time.id}>
														<div className="flex justify-between items-center gap-4">
															<span>{time.time}</span>
															<div className="text-xs text-muted-foreground">
																{time.venueName}
															</div>
														</div>
													</SelectItem>
												)
											)}
									</SelectContent>
								</Select>
							</div>

							{/* Book Button */}
							<Button
								className="w-full h-12 text-lg mt-8"
								disabled={!selectedTheater || !selectedDate || !selectedTime}
								onClick={handleBooking}>
								{t('bookNow')}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

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
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
