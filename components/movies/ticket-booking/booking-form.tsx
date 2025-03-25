import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { BookingFormProps } from './types';
import { cn } from '@/lib/utils';

export function BookingForm({
	selectedCity,
	availableCities,
	selectedDate,
	processedShows,
	selectedShow,
	loading,
	error,
	onCityChange,
	onDateChange,
	onShowSelection,
	onBooking,
	t,
	locale,
	isRtl = false,
}: BookingFormProps) {
	const citiesT = useTranslations('cities');

	// Function to get the translated city name
	const getTranslatedCity = (city: string) => {
		try {
			return citiesT(city);
		} catch (error) {
			// If translation not found, return the original name
			return city;
		}
	};

	return (
		<div className="space-y-6">
			{/* Loading and Error States */}
			{loading && (
				<div className="text-center text-muted-foreground">
					Loading showtimes...
				</div>
			)}
			{error && <div className="text-center text-red-500">{error}</div>}

			{/* City Selection */}
			<div className="space-y-2">
				<label
					className={cn(
						'block text-sm font-medium mb-1',
						isRtl && 'text-right'
					)}>
					{t('selectCity')}
				</label>
				<Select
					value={selectedCity || undefined}
					onValueChange={onCityChange}
					disabled={availableCities.length === 0 || loading}>
					<SelectTrigger className={isRtl ? 'text-right' : ''} locale={locale}>
						<SelectValue
							placeholder={t('chooseCity')}
							className={isRtl ? 'text-right' : ''}
						/>
					</SelectTrigger>
					<SelectContent locale={locale}>
						{availableCities.map((city) => (
							<SelectItem
								key={city}
								value={city}
								className={isRtl ? 'text-right' : ''}
								locale={locale}>
								{getTranslatedCity(city)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{selectedCity && (
				<>
					{/* Date Selection */}
					<div className="space-y-2">
						<label
							className={cn(
								'block text-sm font-medium mb-1',
								isRtl && 'text-right'
							)}>
							{t('selectDate')}
						</label>
						<Select
							value={
								selectedDate ? format(selectedDate, 'yyyyMMdd') : undefined
							}
							onValueChange={onDateChange}
							disabled={Object.keys(processedShows).length === 0 || loading}>
							<SelectTrigger
								className={isRtl ? 'text-right' : ''}
								locale={locale}>
								<SelectValue
									placeholder={t('chooseDate')}
									className={isRtl ? 'text-right' : ''}
								/>
							</SelectTrigger>
							<SelectContent locale={locale}>
								{Object.keys(processedShows)
									.sort()
									.map((dateStr) => {
										const year = dateStr.substring(0, 4);
										const month = dateStr.substring(4, 6);
										const day = dateStr.substring(6, 8);
										const date = new Date(`${year}-${month}-${day}`);
										return (
											<SelectItem
												key={dateStr}
												value={dateStr}
												className={isRtl ? 'text-right' : ''}
												locale={locale}>
												{format(date, 'EEEE, MMMM d')}
											</SelectItem>
										);
									})}
							</SelectContent>
						</Select>
					</div>

					{/* Show Selection */}
					<div className="space-y-2">
						<label
							className={cn(
								'block text-sm font-medium mb-1',
								isRtl && 'text-right'
							)}>
							{t('selectTime')}
						</label>
						<Select
							value={selectedShow?.showtime_pid.toString()}
							onValueChange={onShowSelection}
							disabled={!selectedDate || loading}>
							<SelectTrigger
								className={cn('w-full h-[80px]', isRtl && 'text-right')}
								locale={locale}>
								<SelectValue
									placeholder={t('chooseTime')}
									className={cn('text-base', isRtl && 'text-right')}
								/>
							</SelectTrigger>
							<SelectContent locale={locale}>
								{selectedDate &&
									processedShows[format(selectedDate, 'yyyyMMdd')]?.map(
										(show) => (
											<SelectItem
												key={show.showtime_pid}
												value={show.showtime_pid.toString()}
												className={cn('py-3 h-[90px]', isRtl && 'text-right')}
												locale={locale}>
												<div
													className={cn(
														'flex flex-col gap-2 w-full',
														isRtl && 'items-end'
													)}>
													<div
														className={cn(
															'text-sm font-medium line-clamp-2',
															isRtl
																? 'text-right flex flex-row-reverse'
																: 'text-left'
														)}>
														<span className="text-base font-medium px-2">
															{show.time.substring(0, 5)}
														</span>
														{show.movie_name}
													</div>
													<div
														className={cn(
															'flex justify-between items-center gap-4',
															isRtl && 'flex-row-reverse'
														)}>
														<span className="text-xs text-muted-foreground">
															{getTranslatedCity(show.city)} - {show.cinema}
														</span>
													</div>
												</div>
											</SelectItem>
										)
									)}
							</SelectContent>
						</Select>
					</div>

					<Button
						className="w-full h-12 text-lg mt-8"
						disabled={!selectedShow || loading}
						onClick={onBooking}>
						{loading ? 'Loading...' : t('bookNow')}
					</Button>
				</>
			)}
		</div>
	);
}
