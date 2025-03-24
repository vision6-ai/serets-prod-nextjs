'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
	Dialog as DialogRoot,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from '@/components/ui/dialog';
import { ChevronLeft, Ticket, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MoviePoster } from './movie-poster';
import { BookingForm } from './booking-form';
import { BookingIframe } from './booking-iframe';
import { useBooking } from './use-booking';
import { TicketBookingProps } from './types';

export function TicketBooking({
	movieId,
	movieTitle,
	posterUrl,
	isRtl = false,
	countitPid,
}: TicketBookingProps) {
	const t = useTranslations('booking') as (key: string) => string;

	const {
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
		handleCityChange,
		handleDateChange,
		handleShowSelection,
		fetchMovieShows,
	} = useBooking(countitPid);

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
								<MoviePoster posterUrl={posterUrl} movieTitle={movieTitle} />
								<BookingForm
									selectedCity={selectedCity}
									availableCities={availableCities}
									selectedDate={selectedDate}
									processedShows={processedShows}
									selectedShow={selectedShow}
									loading={loading}
									error={error}
									onCityChange={handleCityChange}
									onDateChange={handleDateChange}
									onShowSelection={handleShowSelection}
									onBooking={handleBooking}
									t={t}
								/>
							</div>
						</>
					) : (
						<BookingIframe
							selectedShow={selectedShow}
							onBack={() => setShowIframe(false)}
						/>
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
