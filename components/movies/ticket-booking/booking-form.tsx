import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { BookingFormProps } from './types';

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
}: BookingFormProps) {
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
				<label className="block text-sm font-medium mb-1">
					{t('selectCity')}
				</label>
				<Select
					value={selectedCity || undefined}
					onValueChange={onCityChange}
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
								selectedDate ? format(selectedDate, 'yyyyMMdd') : undefined
							}
							onValueChange={onDateChange}
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
							onValueChange={onShowSelection}
							disabled={!selectedDate || loading}>
							<SelectTrigger className="w-full h-[80px]">
								<SelectValue
									placeholder={t('chooseTime')}
									className="text-base"
								/>
							</SelectTrigger>
							<SelectContent className="w-[400px] max-h-[400px]">
								{selectedDate &&
									processedShows[format(selectedDate, 'yyyyMMdd')]?.map(
										(show) => (
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
