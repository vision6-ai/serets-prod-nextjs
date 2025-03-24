import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { BookingIframeProps } from './types';

export function BookingIframe({ selectedShow, onBack }: BookingIframeProps) {
	return (
		<div className="relative h-full">
			<div className="absolute top-2 left-2 z-10">
				<Button
					variant="ghost"
					size="icon"
					onClick={onBack}
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
	);
}
